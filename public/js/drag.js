var drag = {
	// i'm defining some stuff here that could
	// instead be derived programmatically.
	// the idea is to reduce run-time load by
	// avoiding things like string concatonations
	// mid-drag. maybe it doesn't matter. we'll see.
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
	_direction2round: {
		left: "floor",
		up: "floor",
		down: "ceil",
		right: "ceil"
	},
	constants: {
		maxVelocity: 0.8,
		minVelocity: 0.01,
		velocityDecay: 0.6,
		swipeMultiplier: 2
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
			currentDirection, triggerCbs, _bounds, bounds,
			setVelocities, canGo, rAF_drag, settle,
			currentTrans, transDur = 300, tickCount = 0;
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
			if (!_bounds) {
				_bounds = {
					vertical: node.parentNode.clientHeight - node.scrollHeight,
					horizontal: node.parentNode.clientWidth - node.scrollWidth
				}
			}
			return _bounds;
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
			var axis, axisdata, vstr, vel, dval,
				tdata = { horizontal: node.xDrag, vertical: node.yDrag },
				time = Date.now(), dt = (time - node.time),
				slideTick = (tickCount++ % 2), tdt = slideTick ? transDur / dt : 1;
			node.time = time;

			for (axis in drag._axes) {
				axisdata = drag._axes[axis];
				vstr = axisdata.velocity;
				vel = node[vstr];
				if (vel && canGo(axis)) {
					dval = Math.min(Math.max(bounds()[axis],
						node[axisdata.drag] + vel * dt), 0);
					tdata[axis] += (dval - node[axisdata.drag]) * tdt;
					node[axisdata.drag] = dval;
					node[vstr] *= drag.constants.velocityDecay;
					if (Math.abs(node[vstr]) < drag.constants.minVelocity)
						node[vstr] = 0;
				} else
					node[vstr] = 0;
			}

			if (currentTrans) {
				cancelTrans(currentTrans);
				currentTrans = null;
			}
			currentTrans = trans(node, function() {
				if (!node.rAFid) {
					if (opts.interval)
						settle(currentDirection);
					else
						triggerCbs(currentDirection);
				}
			}, slideTick ?
				'-webkit-transform ' + transDur + 'ms linear': "",
				"translate3d(" + tdata.horizontal + "px,"
					+ tdata.vertical + "px,0)");

			if (node.vx || node.vy)
				node.rAFid = requestAnimFrame(rAF_drag);
			else
				node.rAFid = null;
		};
		settle = function(direction) {
			var axis, axisdata, dragPos;
			for (axis in drag._axes) {
				if (opts.constraint != axis) {
					node[drag._axes[axis].drag] = opts.interval *
						Math[drag._direction2round[direction] || 'round']
							(node.xDrag / opts.interval);
				}
			}
			trans(node, function() {
				triggerCbs(direction);
				opts.settle(direction);
			}, "-webkit-transform 300ms ease-out");
			node.style['-webkit-transform'] =
				"translate3d(" + node.xDrag + "px,"
				+ node.yDrag + "px,0)";
		};
		downCallback = function () {
			node.dragging = false;
			node.touchedDown = true;
			opts.down && opts.down();
		};
		upCallback = function () {
			var axis, axisdata, mod;
			node.touchedDown = node.dragging = false;
			if (opts.interval && !node.animating)
				settle();
			opts.up && opts.up();
		};
		setVelocities = function(vx, vy, isSwipe) {
			var axis, vstr, vel, sign,
				mult = (isSwipe ? drag.constants.swipeMultiplier : 1);
			for (axis in drag._axes) {
				vstr = drag._axes[axis].velocity;
				vel = (axis == "horizontal") ? vx : vy;
				sign = (vel < 0) ? -1 : 1;
				node[vstr] = sign * Math.min(drag.constants.maxVelocity,
					Math.max((node[vstr] || 0) * sign, vel * mult * sign));
			}
		};
		dragCallback = function (direction, distance, dx, dy, velocity, vx, vy) {
			if (node.touchedDown) {
				node.dragging = true;
				if (!node.rAFid) {
					node.time = Date.now();
					node.rAFid = requestAnimFrame(rAF_drag);
				}
				setVelocities(vx, vy);
				if (opts.constraint != drag._direction2axis[direction])
					currentDirection = direction;
			}
		};
		swipeCallback = function (direction, distance, dx, dy, velocity, vx, vy) {
			var axisdata, axis = drag._direction2axis[direction];
			if (opts.constraint == axis)
				return;
			currentDirection = direction;
			if (opts.interval)
				settle(direction);
			else
				setVelocities(vx, vy, true);
		};

		node.isCustomDraggable = true;
		gesture.listen("drag", node, dragCallback);
		gesture.listen("swipe", node, swipeCallback);
		gesture.listen("down", node, downCallback);
		gesture.listen("up", node, upCallback);
	}
};
