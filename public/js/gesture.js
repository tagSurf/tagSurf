var gesture = {
	thresholds: {
		swipe: {
			minDistance: 50,
			maxTime: 300
		},
		tap: {
			maxDistance: 10,
			maxTime: 100,
			waitTime: 300
		}
	},
	vars: {
		active: false,
		startTime: null,
		startPos: null,
		lastPos: null,
		tapCount: 0,
		tapTimeout: null
	},
	handlers: { drag: {}, swipe: {}, tap: {} },
	getPos: function(e) {
		var p = {};
		if (event.type.slice(0, 5) == "touch") {
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
		var v = gesture.vars;
		v.active = true;
		v.startTime = Date.now();
		v.startPos = v.lastPos = gesture.getPos(e);
		if (v.tapTimeout) {
			clearTimeout(v.tapTimeout);
			v.tapTimeout = null;
		}
	},
	onStop: function(e, node) {
		var v = gesture.vars;
		var t = gesture.thresholds;
		var pos = gesture.getPos(e);
		var diff = gesture.getDiff(v.startPos, pos);
		var now = Date.now();
		v.active = false;

		if ( (now - v.startTime < t.swipe.maxTime)
			&& (diff.distance > t.swipe.minDistance) ) // swipe
			gesture.triggerSwipe(node, diff.direction, diff.distance, diff.x, diff.y);
		else if ( (now - v.startTime < t.tap.maxTime)
			&& (diff.distance < t.tap.maxDistance) ) { // tap
			v.tapCount += 1;
			v.tapTimeout = setTimeout(function() {
				gesture.triggerTap(node);
			}, t.tap.waitTime);
		}
	},
	onMove: function(e, node) {
		var v = gesture.vars;
		if (v.active) {
			var pos = gesture.getPos(e);
			var diff = gesture.getDiff(v.lastPos, pos);
			gesture.triggerDrag(node, diff.direction, diff.distance, diff.x, diff.y);
			v.lastPos = pos;
		}
	},
	eWrap: function(node) {
		var e = {};
		['Start', 'Stop', 'Move'].forEach(function(eName) {
			e[eName] = function(e) {
				gesture['on' + eName](e, node);
				e.preventDefault();
				return false;
			};
		});
		return e;
	},
	listen: function(event, node, cb) {
		if (!gesture.handlers[event][node]) {
			gesture.handlers[event][node] = [];
			var e = gesture.eWrap(node);
			node.addEventListener('mousedown', e.Start, false);
			node.addEventListener('touchstart', e.Start, false);
			node.addEventListener('mouseup', e.Stop, false);
			node.addEventListener('touchend', e.Stop, false);
			node.addEventListener('mousemove', e.Move, false);
			node.addEventListener('touchmove', e.Move, false);
		}
		gesture.handlers[event][node].push(cb);
	},
	triggerSwipe: function(node, direction, distance, dx, dy) {
		var handlers = gesture.handlers.swipe[node];
		for (var i = 0; i < handlers.length; i++)
			handlers[i](direction, distance, dx, dy);
	},
	triggerTap: function(node) {
		var handlers = gesture.handlers.tap[node];
		for (var i = 0; i < handlers.length; i++)
			handlers[i](gesture.vars.tapCount);
		gesture.vars.tapCount = 0;
		gesture.vars.tapTimeout = null;
	},
	triggerDrag: function(node, direction, distance, dx, dy) {
		var handlers = gesture.handlers.drag[node];
		for (var i = 0; i < handlers.length; i++)
			handlers[i](direction, distance, dx, dy);
	}
};
