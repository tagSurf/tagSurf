var drag = {
	_direction2constraint: {
		up: "horizontal",
		down: "horizontal",
		left: "vertical",
		right: "vertical"
	},
	nativeScroll: function (n, opts)
	{
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
		var dirs = {
			up: "down",
			down: "up",
			right: "left",
			left: "right"
		}, lastDirection, dragTimeout, delayedDrag = function() {
			if (dragTimeout) {
				clearTimeout(dragTimeout);
				dragTimeout = null;
			}
			dragTimeout = setTimeout(function() {
				opts.drag(dirs[lastDirection], 0, 0, 0);
			}, 100);
		};
		gesture.listen("drag", n, function (direction, distance, dx, dy) {
			var atBottom = (n.parentNode.scrollHeight - n.parentNode.scrollTop 
				=== n.parentNode.clientHeight), atTop = (n.parentNode.scrollTop === 0);
			lastDirection = direction;
			if (opts.drag)
				opts.drag(direction, distance, dx, dy);
			if((atTop && direction == "down") ||
				(atBottom && direction == "up"))
				return false;
			return !opts.constraint ||
				opts.constraint == drag._direction2constraint[direction];
		}, true, false);
		gesture.listen("swipe", n, function (direction, distance, dx, dy, pixelsPerSecond) { 
			if (direction == "up" && (n.parentNode.scrollTop >=
				(n.parentNode.scrollHeight - (n.parentNode.clientHeight + 800)))
				&& opts.swipe)
			{
				opts.swipe();
			}
		}, true, false);
		n.parentNode.addEventListener('scroll', function (event) {
			if (opts.scroll)
				opts.scroll(event);
			if (opts.drag)
				delayedDrag();
			return true;
		}, false);
	},
	makeDraggable: function (node, opts)
	{
		opts = opts || {};
		if (!opts.interval && !opts.force && !isStockAndroid())
			return drag.nativeScroll(node.firstChild, opts);
		var downCallback, upCallback, dragCallback, swipeCallback,
			dirs, bound, triggerCbs, translate;
		node.xDrag = 0;
		node.yDrag = 0;
		node.classList.add('hardware-acceleration');
		node.style['-webkit-transform'] = "translate3d(0,0,0)";
		// Don't apply overflow=visible to welcome tutorial carousel container
		if (node.className.indexOf("carousel") == -1) {
			node.style.overflow = "visible";
			node.parentNode.style.overflow = "visible";
		};
		node.parentNode.addEventListener('scroll', function (event) {return false;}, false);
		dirs = {
			horizontal: {
				drag: "xDrag",
				dimension: "Width",
				direction: ["right", "left"]
			},
			vertical: {
				drag: "yDrag",
				dimension: "Height",
				direction: ["up", "down"]
			}
		};
		bound = function (mult) {
			var direction;
			for (var dir in dirs) {
				var dirdata = dirs[dir];
				if (opts.constraint != dir) {
					var dragPos = node[dirdata.drag],
						dim = dirdata.dimension,
						outerBound = (mult || 1)
							* node.parentNode["client" + dim]
							- node["scroll" + dim];
					if (dragPos > 0) {
						node[dirdata.drag] = 0;
						direction = dirdata.direction[0];
					} else if (dragPos < outerBound) {
						node[dirdata.drag] = outerBound;
						direction = dirdata.direction[1];
					}
				}
			}
			return direction;
		};
		triggerCbs = function (direction, distance, dx, dy) {
			if (opts.drag) 
				opts.drag(direction, distance || 0, dx || 0, dy || 0);
			if (opts.scroll)
				opts.scroll();
		};
		translate = function (cb) {
			node.style['-webkit-transform'] =
				"translate3d(" + node.xDrag + "px,"
				+ node.yDrag + "px,0)";
			if (cb) {
				node.animating = true;
				trans(node, function() {
					node.animating = false;
					(typeof cb == "function") && cb();
				}, "-webkit-transform 300ms ease-out");
			}
		};
		downCallback = function () {
			if (node.animating) return;
			node.dragging = false;
			node.touchedDown = true;
			node.animating = false;
			node.xDragStart = node.xDrag;
			node.yDragStart = node.yDrag;
			if (opts.down)
				opts.down();
		};
		upCallback = function (direction) {
			node.touchedDown = node.dragging = false;
			if (node.animating == false) {
				if (opts.interval) {
					for (var dir in dirs) {
						var dirdata = dirs[dir];
						if (opts.constraint != dir) {
							var mod = node[dirdata.drag] % opts.interval;
							if (mod) {
								var dragStart = node[dirdata.drag + "Start"];
								node[dirdata.drag] -= (Math.abs(mod)
									<= (opts.interval / 2))
									? mod : (opts.interval + mod);
								if (node[dirdata.drag] < dragStart)
									direction = dirdata.direction[0];
								else if (node[dirdata.drag] > dragStart)
									direction = dirdata.direction[1];
								else
									direction = "hold";
							}
						}
					}
					if (direction)
						translate(true);
				} else {	//boundary checking
					var boundaryDirection = bound();
					if (boundaryDirection) {
						direction = boundaryDirection;
						translate(function () { triggerCbs(direction); });
					}
				}
				if (opts.up)
					opts.up(direction);
			}
		};
		dragCallback = function (direction, distance, dx, dy) {
			if (node.touchedDown) {
				node.dragging = true;
				var boundaryDirection = bound(2/3);
				if (opts.constraint != "vertical"
					&& boundaryDirection != "up"
					&& boundaryDirection != "down")
					node.yDrag += dy;
				if (opts.constraint != "horizontal"
					&& boundaryDirection != "right"
					&& boundaryDirection != "left")
					node.xDrag += dx;
				translate();
				triggerCbs(direction, distance, dx, dy);
			}
		};
		swipeCallback =  function (direction, distance, dx, dy, pixelsPerSecond)
		{
			var xMod = opts.interval ? node.xDrag % opts.interval : -dx;
			var yMod = opts.interval ? node.yDrag % opts.interval : pixelsPerSecond * .3;
			if (node.animating == false)
			{
				if (opts.constraint != "horizontal" && node.xDrag <= 0 && 
					Math.abs(node.xDrag) < (node.scrollWidth - 
					node.parentNode.clientWidth))
				{
					if (direction == "right")
					{
						node.xDrag -= xMod;
					}
					else if (direction == "left")
					{
						node.xDrag += (opts.interval ? -(opts.interval + xMod) : xMod);
					}
					else
					{
						return;
					}
				}
				if (opts.constraint != "vertical" && node.yDrag <= 0 
					&& node.yDrag > -(node.scrollHeight - 
					node.parentNode.clientHeight))
				{
					if (direction == "up")
					{
						node.yDrag -= yMod;
					}
					else if (direction == "down")
					{
						node.yDrag -= (opts.interval ? -(opts.interval + yMod) : -yMod);
					}
					else
					{
						return;
					}
				}
				translate(function() { upCallback(direction); });
			}
		};

		if (node.isDraggable)
			gesture.unlisten(node);
		node.isDraggable = true;
		gesture.listen("drag", node, dragCallback);
		gesture.listen("down", node, downCallback);
		gesture.listen("swipe", node, swipeCallback);
		gesture.listen("up", node, upCallback);
	}
};
