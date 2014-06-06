var drag =
{
	_direction2constraint: {
		up: "horizontal",
		down: "horizontal",
		left: "vertical",
		right: "vertical"
	},
	nativeScroll: function (node, opts)
	{
		gesture.listen("up", n, returnTrue);
		gesture.listen("down", n, returnTrue);
		gesture.listen("drag", n, function (direction, distance, dx, dy) {
			var atBottom = (n.scrollHeight - n.scrollTop 
				=== n.clientHeight),
			atTop = (n.scrollTop === 0);
			opts.drag && opts.drag(direction, distance, dx, dy);
			if((atTop && direction == "down") ||
				(atBottom && direction == "up"))
				return false;
			return !opts.constraint ||
				opts.constraint == drag._direction2constraint[direction];
		});
	},
	makeDraggable: function (node, opts)
	{
		opts = opts || {};
		if (!opts.interval && isIphone())
			return drag.nativeScroll(node, opts);
		var downCallback, upCallback, dragCallback, swipeCallback;
		node.xDrag = 0;
		node.yDrag = 0;
		downCallback = function () 
		{
			if (node.animating) return;
			node.dragging = true;
			node.animating = false;
			node.xDragStart = node.xDrag;
			node.yDragStart = node.yDrag;
		};
		upCallback = function () {
			var xMod = 0, yMod = 0, direction = null, 
				boundaryReached = false;
			node.dragging = false;
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
					if (direction && node.animating == false)
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
						else if (Math.abs(node.yDrag) > 
							(node.scrollHeight - node.parentNode.clientHeight))
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
					console.log("endCallback");
					opts.up(direction);
				}
			}
		};
		dragCallback = function (direction, distance, dx, dy) {
			if (node.dragging)
			{
				if (opts.constraint != "vertical")
				{
					if (Math.abs(node.yDrag) < 
						(node.scrollHeight - 
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
				opts.drag && opts.drag(direction, distance, dx, dy);
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
					&& Math.abs(node.yDrag) < (node.scrollHeight - 
					node.parentNode.clientWidth))
				{
					if (direction == "up")
					{
						node.yDrag -= yMod;
					}
					else if (direction == "down")
					{
						node.yDrag += (opts.interval ? -(opts.interval + yMod) : yMod);
					}
					else
					{
						return;
					}
				}
				//carousel.orderIndicationCallback(direction);
				trans(node, function() {
					console.log("drag-swipe");
					node.animating = false;
					upCallback();//legit?
				}, "-webkit-transform 300ms ease-out");
				node.animating = true;
				node.style['-webkit-transform'] = 
					"translate3d(" + node.xDrag + "px," + 
					node.yDrag + "px,0)";
			}
		};

		gesture.listen("drag", node, dragCallback);
		gesture.listen("down", node, downCallback);
		gesture.listen("swipe", node, swipeCallback);
		gesture.listen("up", node, upCallback);
	}
};
