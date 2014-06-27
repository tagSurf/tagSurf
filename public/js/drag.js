var drag =
{
	_direction2constraint: {
		up: "horizontal",
		down: "horizontal",
		left: "vertical",
		right: "vertical"
	},
	nativeScroll: function (n, opts)
	{
		gesture.listen("up", n, returnTrue);
		gesture.listen("down", n, returnTrue);
		gesture.listen("drag", n, function (direction, distance, dx, dy) {
			var atBottom = (n.parentNode.scrollHeight - n.parentNode.scrollTop 
				=== n.parentNode.clientHeight), atTop = (n.parentNode.scrollTop === 0);
			if (opts.drag) 
				opts.drag(direction, distance, dx, dy);
			if((atTop && direction == "down") ||
				(atBottom && direction == "up"))
				return false;
			return !opts.constraint ||
				opts.constraint == drag._direction2constraint[direction];
		});
		n.parentNode.addEventListener('scroll', function (event) {
			if (opts.drag) 
				opts.drag(event);
			return true;
		}, false);
	},
	makeDraggable: function (node, opts)
	{
		opts = opts || {};
		if (!opts.interval && isIphone() && !opts.force)
			return drag.nativeScroll(node, opts);
		var downCallback, upCallback, dragCallback, swipeCallback;
		node.xDrag = 0;
		node.yDrag = 0;
		node.classList.add('hardware-acceleration');
		node.style['-webkit-transform'] = "translate3d(0,0,0)";
		node.style.overflow = "visible";
		node.parentNode.style.overflow = "visible";
		downCallback = function () 
		{
			if (node.animating) return;
			node.dragging = false;
			node.touchedDown = true;
			node.animating = false;
			node.xDragStart = node.xDrag;
			node.yDragStart = node.yDrag;
		};
		upCallback = function (direction) {
			var xMod = 0, yMod = 0, boundaryReached = false;
			node.touchedDown = node.dragging = false;
			if (node.animating == false)
			{
				if (opts.interval)
				{
					if (opts.constraint != "vertical")
					{
						yMod = node.yDrag % opts.interval;
						if (yMod != 0)
						{
							if (Math.abs(yMod) <= (opts.interval / 2))
							{
								node.yDrag -= yMod;
							}
							else
							{
								node.yDrag -= (opts.interval + yMod);
							}
							if (node.yDrag < node.yDragStart)
							{
								direction = "up";
							}
							else if (node.yDrag > node.yDragStart)
							{
								direction = "down";
							}
							else
							{
								direction = "hold";
							}
						}
					}
					if (opts.constraint != "horizontal")
					{
						xMod = node.xDrag % opts.interval;
						if (xMod != 0)
						{
							if (Math.abs(xMod) <= (opts.interval / 2))
							{
								node.xDrag -= xMod;
							}
							else
							{
								node.xDrag -= (opts.interval + xMod);
							}
							if (node.xDrag < node.xDragStart)
							{
								direction = "left";
							}
							else if (node.xDrag > node.xDragStart)
							{
								direction = "right";
							}
							else
							{
								direction = "hold";
							}
						}
					}
					if (direction)
					{
						node.animating = true;
						trans(node, function () { node.animating = false;},
							"-webkit-transform 300ms ease-out");
						node.style['-webkit-transform'] = 
							"translate3d(" + node.xDrag + "px," + 
							node.yDrag + "px,0)";
					}
				}
				else	//boundary checking
				{
					if (opts.constraint != "horizontal")
					{
						if (node.xDrag > 0)
						{
							node.xDrag = 0;
							boundaryReached = true;
							direction = "right";
						}
						else if (Math.abs(node.xDrag) > 
							(node.scrollWidth - node.parentNode.clientWidth))
						{
							node.xDrag = -(node.scrollWidth - node.parentNode.clientWidth);
							boundaryReached = true;
							direction = "left";
						}
					}
					if (opts.constraint != "vertical")
					{
						if (node.yDrag > 0)
						{
							node.yDrag = 0;
							boundaryReached = true;
							direction = "up";
						}
						else if (node.yDrag < 
							-(node.scrollHeight - node.parentNode.clientHeight))
						{
							node.yDrag = -(node.scrollHeight - node.parentNode.clientHeight);
							boundaryReached = true;
							direction = "down";
						}
					}
					if (boundaryReached)
					{
						node.animating = true;
						trans(node, function () { node.animating = false;},
							"-webkit-transform 300ms ease-out");
						node.style['-webkit-transform'] = 
							"translate3d(" + node.xDrag + "px," + 
							node.yDrag + "px,0)";
					}
				}
				if (opts.up)
				{
					opts.up(direction);
				}
			}
		};
		dragCallback = function (direction, distance, dx, dy) {
			if (node.touchedDown)
			{
				node.dragging = true;
				if (opts.constraint != "vertical")
				{
					if (node.yDrag > -(node.scrollHeight - 
						 (2 * node.parentNode.clientHeight / 3)))
					{
						node.yDrag += dy;
					}
				}
				if (opts.constraint != "horizontal")
				{
					if (Math.abs(node.xDrag) < 
						(node.scrollWidth - 
						 (2 * node.parentNode.clientWidth / 3)))
					{
						node.xDrag += dx;
					}
				}
				node.style['-webkit-transform'] = 
					"translate3d(" + node.xDrag + "px," + 
					node.yDrag + "px,0)";
				if (opts.drag) 
					opts.drag(direction, distance, dx, dy);
			}
		};
		swipeCallback =  function (direction, distance, dx, dy, pixelsPerSecond)
		{
			var xMod = opts.interval ? node.xDrag % opts.interval : -dx;
			var yMod = opts.interval ? node.yDrag % opts.interval : -dy;
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
						node.yDrag += yMod;
					}
					else if (direction == "down")
					{
						node.yDrag += (opts.interval ? -(opts.interval + yMod) : -yMod);
					}
					else
					{
						return;
					}
				}
				//carousel.orderIndicationCallback(direction);
				trans(node, function() {
					node.animating = false;
					upCallback(direction);//legit?
				}, "-webkit-transform 300ms ease-out");
				node.animating = true;
				node.style['-webkit-transform'] = 
					"translate3d(" + node.xDrag + "px," + 
					node.yDrag + "px,0)";
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
