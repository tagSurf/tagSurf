var gesture = {
	gid: 0,
	preventDefault: true,
	thresholds: {
		swipe: {
			minDistance: 35,
			maxTime: 400,
			minDP: 600,
			maxDP: 1000
		},
		tap: {
			maxDistance: 10,
			maxTime: 700,
			waitTime: 300,
			maxCount: 2
		},
		hold: {
			maxDistance: null, // set to pixel value if desired
			interval: 1000
		},
		up: {
			androidDelay: 600
		},
		pinch: {}
	},
	_vars: {
		active: false,
		startTime: null,
		startPos: null,
		lastPos: null,
		tapCount: 0,
		holdCount: 0,
		tapTimeout: null,
		holdInterval: null,
		stopTimeout: null,
		firstPinch: null,
		stopPropagation: false,
		preventDefault: false
	},
	events: isMobile() && {
		Start: "touchstart",
		Stop: "touchend",
		Move: "touchmove",
		Cancel: "touchcancel"
	} || {
		Start: "mousedown",
		Stop: "mouseup",
		Move: "mousemove"
	},
	handlers: { drag: {}, swipe: {}, tap: {}, up: {}, down: {}, hold: {}, pinch: {} },
	tuneThresholds: function() {
		if (!isIos())
			for (var gest in gesture.thresholds)
				for (var constraint in gesture.thresholds[gest]) {
					var suffix = constraint.slice(3);
					if (suffix == "Distance")
						gesture.thresholds[gest][constraint] /= 2;
					else if (suffix == "DP")
						gesture.thresholds[gest][constraint] *= 2;
				}
	},
	getPos: function(e) {
		if (e.x == undefined) {
			e.x = e.pageX || e.changedTouches[0].pageX;
			e.y = e.pageY || e.changedTouches[0].pageY;
		}
		return { x: e.x, y: e.y };
	},
	getDiff: function(p1, p2) {
		var d = {};
		d.x = p2.x - p1.x;
		d.y = p2.y - p1.y;
		d.distance = Math.sqrt((d.x * d.x) + (d.y * d.y));
		if (Math.abs(d.x) > Math.abs(d.y))
			d.direction = d.x > 0 ? 'right' : 'left';
		else
			d.direction = d.y > 0 ? 'down' : 'up';
		return d;
	},
	pinchDiff: function(e) {
		return gesture.getDiff(gesture.getPos(e.touches[0]),
			gesture.getPos(e.touches[1]));
	},
	onStart: function(e, node) {
		var t = gesture.thresholds;
		var v = node.gvars;
		v.active = true;
		v.startTime = Date.now();
		v.startPos = v.lastPos = gesture.getPos(e);
		if (e.touches.length > 1)
			v.firstPinch = gesture.pinchDiff(e);
		if (v.tapTimeout) {
			clearTimeout(v.tapTimeout);
			v.tapTimeout = null;
		}
		v.holdCount = 0;
		v.holdInterval = setInterval(function() {
			if (!v.active || (t.hold.maxDistance && (t.hold.maxDistance <
				gesture.getDiff(v.startPos, v.lastPos).distance))) {
				clearInterval(v.holdInterval);
				v.holdInterval = null;
				return;
			}
			v.holdCount += 1;
			gesture.triggerHold(node, t.hold.interval * v.holdCount);
		}, t.hold.interval);
		return gesture.triggerDown(node);
	},
	onStop: function(e, node, delayed) {
		var v = node.gvars;
		if (!delayed && v.holdInterval) {
			clearInterval(v.holdInterval);
			v.holdInterval = null;
		}
		if (!v.active) return;
		var t = gesture.thresholds;
		var pos = gesture.getPos(e);
		var diff = gesture.getDiff(v.startPos, pos);
		var timeDiff = Date.now() - v.startTime;
		v.active = !!e.touches.length;

		if ( (timeDiff < t.swipe.maxTime)
			&& (diff.distance > t.swipe.minDistance) ) // swipe
			gesture.triggerSwipe(node, diff.direction,
				diff.distance, diff.x, diff.y,
				Math.min(t.swipe.maxDP, Math.max(t.swipe.minDP,
					diff.distance / timeDiff)) * (isIos() ? 1 : 0.5));
		else if ( (timeDiff < t.tap.maxTime)
			&& (diff.distance < t.tap.maxDistance) ) { // tap
			v.tapCount += 1;
			if (v.tapCount == t.tap.maxCount)
				gesture.triggerTap(node);
			else
				v.tapTimeout = setTimeout(gesture.triggerTap, t.tap.waitTime, node);
		}
		return gesture.triggerUp(node, delayed);
	},
	onMove: function(e, node) {
		var v = node.gvars;
		if (v.active) {
			var pos = gesture.getPos(e);
			var diff = gesture.getDiff(v.lastPos, pos);
			v.lastPos = pos;
			if (e.touches.length > 1)
				gesture.triggerPinch(node,
					gesture.pinchDiff(e).distance / v.firstPinch.distance);
			return gesture.triggerDrag(node, diff.direction,
				diff.distance, diff.x, diff.y);
		}
	},
	eWrap: function(node) {
		var e = {};
		['Start', 'Stop', 'Move'].forEach(function(eName) {
			e[eName] = function(e) {
				node.gvars.preventDefault && e.preventDefault();
				node.gvars.stopPropagation && e.stopPropagation();
				return gesture['on' + eName](e, node) || (gesture.preventDefault 
					&& e.preventDefault()) || e.stopPropagation() || false;
			};
		});
		if (gesture.events.Cancel)
			e.Cancel = e.Stop;
		return e;
	},
	listen: function(eventName, node, cb, stopPropagation, preventDefault) {
		if (!node.gid) {
			node.gid = ++gesture.gid;
			var e = node.listeners = gesture.eWrap(node);
			for (var evName in gesture.events)
				node.addEventListener(gesture.events[evName], e[evName]);
			node.gvars = JSON.parse(JSON.stringify(gesture._vars));
		}
		node.gvars.stopPropagation = stopPropagation;
		node.gvars.preventDefault = preventDefault;
		if (!gesture.handlers[eventName][node.gid])
			gesture.handlers[eventName][node.gid] = [];
		gesture.handlers[eventName][node.gid].push(cb);
	},
	unlisten: function(node) {
		if (node.gid) {
			var e = node.listeners;
			for (var evName in gesture.events)
				node.removeEventListener(gesture.events[evName], e[evName]);
			for (var eventName in gesture.handlers)
				if (node.gid in gesture.handlers[eventName])
					delete gesture.handlers[eventName][node.gid];
			delete node.gid;
		}
	},
	triggerPinch: function(node, normalizedDistance) {
		var handlers = gesture.handlers.pinch[node.gid];
		if (handlers) for (var i = 0; i < handlers.length; i++)
			handlers[i](normalizedDistance);
	},
	triggerSwipe: function(node, direction, distance, dx, dy, pixelsPerSecond) {
		var handlers = gesture.handlers.swipe[node.gid];
		if (handlers) for (var i = 0; i < handlers.length; i++)
			handlers[i](direction, distance, dx, dy, pixelsPerSecond);
	},
	triggerTap: function(node) {
		var v = node.gvars;
		var handlers = gesture.handlers.tap[node.gid];
		if (handlers) for (var i = 0; i < handlers.length; i++)
			handlers[i](v.tapCount);
		v.tapCount = 0;
		v.tapTimeout = null;
	},
	triggerDrag: function(node, direction, distance, dx, dy) {
		var returnVal = false;
		var handlers = gesture.handlers.drag[node.gid];
		if (handlers) for (var i = 0; i < handlers.length; i++)
			returnVal = handlers[i](direction, distance, dx, dy) || returnVal;
		return returnVal;
	},
	triggerHold: function(node, duration) {
		var handlers = gesture.handlers.hold[node.gid];
		if (handlers) for (var i = 0; i < handlers.length; i++)
			handlers[i](duration);
	},
	triggerUp: function(node, delayed) {
		var returnVal = false;
		var handlers = gesture.handlers.up[node.gid];
		if (handlers) for (var i = 0; i < handlers.length; i++)
			returnVal = handlers[i](delayed) || returnVal;
		return returnVal;
	},
	triggerDown: function(node) {
		var returnVal = false;
		var handlers = gesture.handlers.down[node.gid];
		if (handlers) for (var i = 0; i < handlers.length; i++)
			returnVal = handlers[i]() || returnVal;
		return returnVal;
	}
};
gesture.tuneThresholds();
