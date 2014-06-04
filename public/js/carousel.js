var carousel = 
{
	view: document.createElement('div'),
	activeCircle: null,
	translateDistance: window.innerWidth,
	animating: false,
	xPosition: 0,
	images: [],
	_build: function ()
	{
		addCss({
			"#carousel": function() {
				return "height: " + window.innerHeight + "px; width: " + window.innerWidth + "px";
			},
			".carousel_container": function() {
				return "width: " + (5 * window.innerWidth) + "px";
			},
			".carousel_image_container": function() {
				return "width: " + window.innerWidth + "px";
			}
		});
		var index, changeOrder, container = document.createElement('div'),
			orderIndication = document.createElement('div'),
			circlesContainer = document.createElement('div'),
			endButton = document.createElement('div');
		var orderIndicationCallback = function (direction) {
			 if (direction == "left" && 
				carousel.activeCircle.nextSibling)
			 {
				carousel.activeCircle.classList.remove('active_circle');
				carousel.activeCircle.nextSibling.classList.add('active_circle');
				carousel.activeCircle = carousel.activeCircle.nextSibling;
			 }
			 if (direction == "right" &&
				carousel.activeCircle.previousSibling)
			 {
				carousel.activeCircle.classList.remove('active_circle');
				carousel.activeCircle.previousSibling.classList.add('active_circle');
				carousel.activeCircle = carousel.activeCircle.previousSibling;
			 }
		};
		carousel.view.id = "carousel";
		container.className = "carousel_container";
		orderIndication.className = "carousel_order_indicator";
		endButton.className = "end_tutorial_btn";
		endButton.innerHTML = "Got it!";
		gesture.listen("tap", endButton, function() {
			carousel.off();
			document.forms[0].submit();
		});
		drag.makeDraggable(container, "vertical", carousel.translateDistance, 
			orderIndicationCallback);
		orderIndication.appendChild(circlesContainer);
		orderIndication.appendChild(endButton);
		carousel.view.appendChild(container);
		carousel.view.appendChild(orderIndication);
		document.body.appendChild(carousel.view);
		for (index = 1; index <= 5; ++index)
		{
			carousel.images.push(
				'/img/tutorial/tutorial_' + index + '.png');
		}
		carousel._populate();
		//gesture.listen("swipe", carousel.view, carousel.swipeCallback);
	},
	_populate: function ()
	{
		var index, container, image, circle;
		for (index in carousel.images)
		{
			container = document.createElement('div');
			container.className = "carousel_image_container";
			image = new Image();
			image.src = carousel.images[index];
			container.appendChild(image);
			circle = document.createElement('div');
			circle.className = "indicator_circle";
			if (index == 0)
			{
				circle.className +=  " active_circle";
				carousel.activeCircle = circle;
			}
			carousel.view.firstChild.appendChild(container);
			carousel.view.lastChild.firstChild.appendChild(circle);
		}
	},
	dragCallback: function ()
	{
	},
	swipeCallback: function (direction, distance, dx, dy, pixelsPerSecond)
	{
		var container = carousel.view.firstChild, 
			translateToXPx = carousel.xPosition;
		if (direction == "left")
		{
			translateToXPx -= carousel.translateDistance;
		}
		else if (direction == "right")
		{
			translateToXPx += carousel.translateDistance;
		}
		else
		{
			return;
		}
		if (translateToXPx < 0 && translateToXPx >=
			-(carousel.translateDistance * carousel.images.length) &&
			carousel.animating == false)
		{
			translateToXPx += "px";
			trans(container, function() {
				carousel.animating = false;
			}, "-webkit-transform 300ms ease-out");
			carousel.animating = true;
			container.style['-webkit-transform'] = 
				"translate3d(" + translateToXPx + ",0,0)";
		}
	},
	upCallback: function ()
	{
	},
	downCallback: function ()
	{
	},
	on: function ()
	{
		carousel.view.style.visibility = "visible";
		carousel.view.style.opacity = 1;
	},
	off: function ()
	{
		carousel.view.style.opacity = 0;
		trans(carousel.view, function(){
			carousel.view.style.visibility = "hidden";
		});
	},
};
carousel._build();

