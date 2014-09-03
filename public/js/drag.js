var drag = {
	// i'm defining some stuff here that could
	// instead be derived programmatically.
	// the idea is to reduce run-time load by
	// avoiding things like string concatonations
	// at potentially critical junctures like bound().
	// maybe it won't end up mattering. we'll see.
	//  - mario
	_axes: {
		horizontal: {
			velocity: "vx",
			drag: "xDrag",
			clientSize: "clientWidth",
			scrollSize: "scrollWidth",
			directions: ["right", "left"]
		},
		vertical: {
			velocity: "vy",
			drag: "yDrag",
			clientSize: "clientHeight",
			scrollSize: "scrollHeight",
			directions: ["down", "up"]
		}
	},
	_direction2axis: {
		up: "vertical",
		down: "vertical",
		left: "horizontal",
		right: "horizontal"
	},
	_direction2opposite: {
		up: "down",
		down: "up",
		right: "left",
		left: "right"
	},
	constants: {
		minVelocity: 0.01,
		velocityDecay: 0.6,
		swipeMultiplier: 10
	},
	nativeScroll: function (n, opts) {
		gesture.listen("up", n, function () {
			if (opts.up)
				opts.up();
			return true;
		}, true, false);
		gesture.listen("down", n, function () {
			if (opts.down)
				opts.down();
			return true;
		}, true, false);
		var lastDirection, dragTimeout, delayedDrag = function() {
			if (dragTimeout) {
				clearTimeout(dragTimeout);
				dragTimeout = null;
			}
			dragTimeout = setTimeout(function() {
				opts.drag(drag._direction2opposite[lastDirection], 0, 0, 0);
			}, 100);
		};
		gesture.listen("drag", n, function (direction, distance, dx, dy, velocity, vx, vy) {
			var atBottom = (n.parentNode.scrollHeight - n.parentNode.scrollTop 
				=== n.parentNode.clientHeight), atTop = (n.parentNode.scrollTop === 0);
			lastDirection = direction;
			if (opts.drag)
				opts.drag(direction, distance, dx, dy);
			if((atTop && direction == "down") ||
				(atBottom && direction == "up"))
				return false;
			return !opts.constraint ||
				opts.constraint != drag._direction2axis[direction];
		}, true, false);
		gesture.listen("swipe", n, function (direction, distance, dx, dy, velocity, vx, vy) { 
			if (direction == "up" && (n.parentNode.scrollTop >=
				(n.parentNode.scrollHeight - (n.parentNode.clientHeight + 800)))
				&& opts.swipe)
			{
				opts.swipe();
			}
		}, true, false);
		n.parentNode._ndcb = function (event) {
			if (opts.scroll)
				opts.scroll(event);
			if (opts.drag)
				delayedDrag();
			return true;
		};
		n.parentNode.addEventListener('scroll', n.parentNode._ndcb, false);
		n.parentNode.isNativeDraggable = true;
	},
	makeDraggable: function (node, opts) {
		opts = opts || {};
		if (node.isCustomDraggable) {
			gesture.unlisten(node);
			node.parentNode.removeEventListener('scroll', returnFalse, false);
		} else if (node.isNativeDraggable) {
			gesture.unlisten(node.firstChild);
			node.removeEventListener('scroll', node._ndcb, false);
		}
		if (!opts.interval && !opts.force && !isStockAndroid())
			return drag.nativeScroll(node.firstChild, opts);
		var downCallback, upCallback, dragCallback, swipeCallback,
			bounds, triggerCbs, currentDirection, rAF_drag;
		node.xDrag = 0;
		node.yDrag = 0;
		node.classList.add('hardware-acceleration');
		node.style['-webkit-transform'] = "translate3d(0,0,0)";
		// Don't apply overflow=visible to welcome tutorial carousel container
		if (node.className.indexOf("carousel") == -1) {
			node.style.overflow = "visible";
			node.parentNode.style.overflow = "visible";
		};
		node.parentNode.addEventListener('scroll', returnFalse, false);

		triggerCbs = function (direction, distance, dx, dy, velocity, vx, vy) {
			if (opts.drag) 
				opts.drag(direction, distance || 0, dx || 0, dy || 0,
					velocity || 0, vx || 0, vy || 0);
			if (opts.scroll)
				opts.scroll();
		};
		bounds = function() {
			return {
				vertical: node.parentNode.clientHeight - node.scrollHeight,
				horizontal: node.parentNode.clientWidth - node.scrollWidth
			}
		};
		canGo = function(axis) {
			if (opts.constraint == axis) return false;
			var axisdata, dragPos, outerBound;
			axisdata = drag._axes[axis];
			dragPos = node[axisdata.drag];
			outerBound = bounds()[axis];
			return currentDirection != (dragPos > 0 ? axisdata.directions[0]
				: dragPos < outerBound ? axisdata.directions[1] : null);
		};
		rAF_drag = function () {
			var axis, axisdata,
				time = Date.now(),
				dt = (time - node.time);
			for (axis in drag._axes) {
				axisdata = drag._axes[axis];
				if (canGo(axis))
					node[axisdata.drag] = Math.min(Math.max(bounds()[axis],
						node[axisdata.drag] + node[axisdata.velocity] * dt), 0);
				else
					node[axisdata.velocity] = 0;
				node[axisdata.velocity] *= drag.constants.velocityDecay;
				if (node[axisdata.velocity] && Math.abs(node[axisdata.velocity])
					< drag.constants.minVelocity)
					node[axisdata.velocity] = 0;
			}
			node.time = time;
			node.style['-webkit-transform'] =
				"translate3d(" + node.xDrag + "px," + node.yDrag + "px,0)";
			if (node.vx || node.vy)
				node.rAFid = requestAnimFrame(rAF_drag);
			else {
				node.rAFid = null;
				triggerCbs(currentDirection);
			}
		};
		downCallback = function () {
			if (node.animating) return;
			node.dragging = false;
			node.touchedDown = true;
			if (opts.down)
				opts.down();
		};
		upCallback = function () {
			node.touchedDown = node.dragging = false;
			if (node.animating == false) {
				if (opts.interval) {
					for (var dir in drag._axes) {
						var axisdata = drag._axes[dir];
						if (opts.constraint != dir) {
							var mod = node[axisdata.drag] % opts.interval;
							if (mod) {
								var dragStart = node[axisdata.drag + "Start"];
								node[axisdata.drag] += node[axisdata.drag]
									- (Math.abs(mod) <= (opts.interval / 2))
									? mod : (opts.interval + mod);
							}
						}
					}
				}
				if (opts.up)
					opts.up();
			}
		};
		dragCallback = function (direction, distance, dx, dy, velocity, vx, vy) {
			if (node.touchedDown) {
				node.dragging = true;
				if (!node.rAFid) {
					node.time = Date.now();
					node.rAFid = requestAnimFrame(rAF_drag);
				}
				node.vx = Math[vx < 0 ? "min" : "max"](node.vx || 0, vx);
				node.vy = Math[vx < 0 ? "min" : "max"](node.vy || 0, vy);
				if (opts.constraint != drag._direction2axis[direction])
					currentDirection = direction;
			}
		};
		swipeCallback = function (direction, distance, dx, dy, velocity, vx, vy) {
			if (opts.constraint == drag._direction2axis[direction])
				return;
			currentDirection = direction;
			node.vx = vx * drag.constants.swipeMultiplier;
			node.vy = vy * drag.constants.swipeMultiplier;
		};

		node.isCustomDraggable = true;
		gesture.listen("drag", node, dragCallback);
		gesture.listen("swipe", node, swipeCallback);
		gesture.listen("down", node, downCallback);
		gesture.listen("up", node, upCallback);
	}
};
