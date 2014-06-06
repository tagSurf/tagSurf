var drag =
{
	makeDraggable: function (node, constraint, interval, endCallback)
	{
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
				if (interval)
				{
					if (constraint != "vertical")
					{
						yMod = node.yDrag % interval;
						if (yMod != 0)
						{
							if (Math.abs(yMod) <= (interval / 2))
							{
								node.yDrag -= yMod;
							}
							else
							{
								node.yDrag -= (interval + yMod);
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
					if (constraint != "horizontal")
					{
						xMod = node.xDrag % interval;
						if (xMod != 0)
						{
							if (Math.abs(xMod) <= (interval / 2))
							{
								node.xDrag -= xMod;
							}
							else
							{
								node.xDrag -= (interval + xMod);
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
					if (constraint != "horizontal")
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
					if (constraint != "vertical")
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
				if (endCallback)
				{
					console.log("endCallback");
					endCallback(direction);
				}
			}
		};
		dragCallback = function (direction, distance, dx, dy) {
			var verticalTranslate, horizontalTranslate;
			if (node.dragging)
			{
				if (constraint != "vertical")
				{
					if (Math.abs(node.yDrag) < 
						(node.scrollHeight - 
						 (2 * node.parentNode.clientHeight / 3)))
					{
						node.yDrag += dy;
					}
				}
				if (constraint != "horizontal")
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
			}
		};
		swipeCallback =  function (direction, distance, dx, dy, pixelsPerSecond)
		{
			var xMod = interval ? node.xDrag % interval : -dx;
			var yMod = interval ? node.yDrag % interval : -dy;
			if (node.animating == false)
			{
				if (constraint != "horizontal" && node.xDrag <= 0 && 
					Math.abs(node.xDrag) < (node.scrollWidth - 
					node.parentNode.clientWidth))
				{
					if (direction == "right")
					{
						node.xDrag -= xMod;
					}
					else if (direction == "left")
					{
						node.xDrag += (interval ? -(interval + xMod) : xMod);
					}
					else
					{
						return;
					}
				}
				if (constraint != "vertical" && node.yDrag <= 0 
					&& Math.abs(node.yDrag) < (node.scrollHeight - 
					node.parentNode.clientWidth))
				{
					if (direction == "up")
					{
						node.yDrag -= yMod;
					}
					else if (direction == "down")
					{
						node.yDrag += (interval ? -(interval + yMod) : yMod);
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
