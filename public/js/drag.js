var drag =
{
	makeDraggable: function (node, constraint, interval, endCallback)
	{
		var downCallback, upCallback, dragCallback;
		downCallback = function () 
		{
			if (node.animating) return;
			node.dragging = true;
			node.animating = false;
			if (!node.xDrag)
			{
				node.xDrag = 0;
			}
			if (!node.yDrag)
			{
				node.yDrag = 0;
			}
			node.xDragStart = node.xDrag;
			node.yDragStart = node.yDrag;
		};
		upCallback = function () {
			var xMod = 0, yMod = 0, direction = null;
			node.dragging = false;
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
							direction = "down";
						}
						else
						{
							node.yDrag += (interval - yMod);
							direction = "up";
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
			if (endCallback)
			{
				endCallback(direction);
			}
		};
		dragCallback = function (direction, distance, dx, dy) {
			var verticalTranslate, horizontalTranslate;
			if (node.dragging)
			{
				if (constraint != "vertical")
				{
					node.yDrag += dy;
				}
				if (constraint != "horizontal")
				{
					if (Math.abs(node.xDrag) < 
						(carousel.view.firstChild.scrollWidth - 
						 (2 * carousel.view.clientWidth / 3)))
					{
						node.xDrag += dx;
					}
				}
				node.style['-webkit-transform'] = 
					"translate3d(" + node.xDrag + "px," + 
					node.yDrag + "px,0)";
			}
		};
		gesture.listen("drag", node, dragCallback);
		gesture.listen("down", node, downCallback);
		gesture.listen("up", node, upCallback);
	}
};
