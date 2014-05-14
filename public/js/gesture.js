var gesture = {
	gid: 0,
	returnDefault: false,
	thresholds: {
		swipe: {
			minDistance: 35,
			maxTime: 400,
			minDP: 600,
			maxDP: 1000
		},
		tap: {
			maxDistance: 35,
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
		}
	},
	vars: {
		active: false,
		startTime: null,
		startPos: null,
		lastPos: null,
		holdCount: 0,
		tapTimeout: null,
		holdInterval: null,
		stopTimeout: null
	},
	events: isMobile() && {
		Start: "touchstart",
		Stop: "touchend",
		Move: "touchmove"
	} || {
		Start: "mousedown",
		Stop: "mouseup",
		Move: "mousemove"
	},
	handlers: { drag: {}, swipe: {}, tap: {}, up: {}, down: {}, hold: {} },
	tuneThresholds: function() {
		if (!isIphone())
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
		var p = {};
		if (e.type.slice(0, 5) == "touch") {
			p.x = e.changedTouches[0].pageX;
			p.y = e.changedTouches[0].pageY;
		} else {
			p.x = e.x;
			p.y = e.y;
		}
		return p;
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
	onStart: function(e, node) {
		var t = gesture.thresholds;
		var v = gesture.vars;
		v.active = true;
		v.startTime = Date.now();
		v.startPos = v.lastPos = gesture.getPos(e);
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
		var v = gesture.vars;
		if (!delayed && v.holdInterval) {
			clearInterval(v.holdInterval);
			v.holdInterval = null;
		}
		if (!v.active) return;
		var t = gesture.thresholds;
		var pos = gesture.getPos(e);
		var diff = gesture.getDiff(v.startPos, pos);
		var timeDiff = Date.now() - v.startTime;
		v.active = false;

		if ( (timeDiff < t.swipe.maxTime)
			&& (diff.distance > t.swipe.minDistance) ) // swipe
			gesture.triggerSwipe(node, diff.direction,
				diff.distance, diff.x, diff.y,
				Math.min(t.swipe.maxDP, Math.max(t.swipe.minDP,
					diff.distance / timeDiff)));
		else if ( (timeDiff < t.tap.maxTime)
			&& (diff.distance < t.tap.maxDistance) ) { // tap
			node.tapCount = (node.tapCount || 0) + 1;
			if (node.tapCount == t.tap.maxCount)
				gesture.triggerTap(node);
			else
				v.tapTimeout = setTimeout(gesture.triggerTap, t.tap.waitTime, node);
		}
		return gesture.triggerUp(node, delayed);
	},
	delayedStop: function(e, node) {
		var v = gesture.vars;
		if (v.stopTimeout) {
			clearTimeout(v.stopTimeout);
			v.stopTimeout = null;
		}
		v.stopTimeout = setTimeout(gesture.onStop,
			gesture.thresholds.up.androidDelay, e, node, true);
	},
	onMove: function(e, node) {
		var v = gesture.vars;
		if (v.active) {
			var pos = gesture.getPos(e);
			var diff = gesture.getDiff(v.lastPos, pos);
			v.lastPos = pos;
			var dres = gesture.triggerDrag(node, diff.direction, diff.distance, diff.x, diff.y);
			dres && isAndroid() && gesture.delayedStop(e, node);
			return dres;
		}
	},
	eWrap: function(node) {
		var e = {};
		['Start', 'Stop', 'Move'].forEach(function(eName) {
			e[eName] = function(e) {
				return gesture['on' + eName](e, node) || gesture.returnDefault
					|| e.preventDefault() || e.stopPropagation() || false;
			};
		});
		return e;
	},
	listen: function(eventName, node, cb) {
		if (!node.gid) {
			node.gid = ++gesture.gid;
			var e = node.listeners = gesture.eWrap(node);
			for (var evName in gesture.events)
				node.addEventListener(gesture.events[evName], e[evName]);
		}
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
	triggerSwipe: function(node, direction, distance, dx, dy, pixelsPerSecond) {
		var handlers = gesture.handlers.swipe[node.gid];
		if (handlers) for (var i = 0; i < handlers.length; i++)
			handlers[i](direction, distance, dx, dy, pixelsPerSecond);
	},
	triggerTap: function(node) {
		var handlers = gesture.handlers.tap[node.gid];
		if (handlers) for (var i = 0; i < handlers.length; i++)
			handlers[i](node.tapCount);
		node.tapCount = 0;
		gesture.vars.tapTimeout = null;
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
