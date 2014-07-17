var carousel = 
{
	view: document.createElement('div'),
	activeCircle: null,
	translateDistance: window.innerWidth,
	inactivityTimeout: null,
	animating: false,
	images: [],
	current_card: 0,
	total_cards:0,
	endButton: false,
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
			nextButton = document.createElement('div');
		carousel.view.id = "carousel";
		container.className = "carousel_container";
		orderIndication.className = "carousel_order_indicator";
		nextButton.id = "next_button";
		nextButton.className = "advnc_tutorial_btn";
		nextButton.innerHTML = "Next";
		gesture.listen("tap", nextButton, carousel.nextButtonCallback);
		orderIndication.appendChild(circlesContainer);
		orderIndication.appendChild(nextButton);
		carousel.view.appendChild(container);
		carousel.view.appendChild(orderIndication);
		drag.makeDraggable(container, {
			constraint: "vertical",
			interval: carousel.translateDistance, 
			up: carousel.orderIndicationCallback
		});
		document.body.appendChild(carousel.view);
		for (index = 1; index <= 6; ++index)
		{
			carousel.images.push(
				'/img/tutorial/tutorial_' + index + '.png');
		}
		if(isAndroid())
			carousel.images.push('/img/tutorial/tutorial_homescreen_android.png');
		else
			carousel.images.push('/img/tutorial/tutorial_homescreen_ios.png');
		carousel._populate();
		//gesture.listen("swipe", carousel.view.firstChild, carousel.swipeCallback);
		//gesture.listen("up", carousel.view.firstChild, carousel.upCallback);
		//Stop auto-advance after the first touch event
		gesture.listen("down", carousel.view.firstChild, carousel.downCallback);
	},
	orderIndicationCallback: function (direction) {
		 if (direction == "left" && 
			carousel.activeCircle.nextSibling)
		 {
			if ((carousel.current_card+1)==(carousel.total_cards-1)) {
				carousel.setEndButton();
				carousel.swipeCallback("left");
			}
			carousel.activeCircle.classList.remove('active_circle');
			carousel.activeCircle.nextSibling.classList.add('active_circle');
			carousel.activeCircle = carousel.activeCircle.nextSibling;
			carousel.current_card+=1;
		 }
		 if (direction == "right" &&
			carousel.activeCircle.previousSibling)
		 {
			carousel.activeCircle.classList.remove('active_circle');
			carousel.activeCircle.previousSibling.classList.add('active_circle');
			carousel.activeCircle = carousel.activeCircle.previousSibling;
			carousel.current_card-=1;
		 }
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
			carousel.total_cards+=1;
		}
	},
	swipeCallback: function (direction, distance, dx, dy, pixelsPerSecond)
	{
		var container = carousel.view.firstChild, 
			xMod = container.xDrag % carousel.translateDistance;
		if (container.xDrag <= 0 && container.xDrag >
			-(container.scrollWidth - carousel.translateDistance) &&
			carousel.animating == false)
		{
			if (direction == "right")
			{
				container.xDrag -= xMod;
			}
			else if (direction == "left")
			{
				container.xDrag -= (carousel.translateDistance + xMod);
			}
			else
			{
				return;
			}
			carousel.orderIndicationCallback(direction);
			trans(container, function() {
				container.animating = false;
			}, "-webkit-transform 300ms ease-out");
			container.animating = true;
			container.style['-webkit-transform'] = 
				"translate3d(" + container.xDrag + "px,0,0)";
		}
	},
	nextButtonCallback: function(){
		if (carousel.endButton) {
			carousel.off();
			document.forms[0].submit();
		} 
		else if ((carousel.current_card+1)==(carousel.total_cards-1)) {
			carousel.setEndButton();
			carousel.swipeCallback("left");
		}
		else {
			clearInterval(carousel.inactivityTimeout);
			carousel.inactivityTimeout = null;
			carousel.swipeCallback("left");
		};
	},
	setEndButton: function(){
		document.getElementById("next_button").innerHTML = "Got it!";
		carousel.endButton = true;
	},
	// upCallback: function ()
	// {
	// 	carousel.inactivityTimeout = setInterval(function(){
	// 		carousel.swipeCallback("left");
	// 	},5000);
	// },
	downCallback: function ()
	{
		clearInterval(carousel.inactivityTimeout);
		carousel.inactivityTimeout = null;
	},
	on: function ()
	{
		carousel.view.style.visibility = "visible";
		carousel.view.style.opacity = 1;
		carousel.inactivityTimeout = setInterval(function(){
			carousel.swipeCallback("left");
		},5000);
	},
	off: function ()
	{
		carousel.view.style.opacity = 0;
		trans(carousel.view, function(){
			carousel.view.style.visibility = "hidden";
		});
		clearInterval(carousel.inactivityTimeout);
	},
};
carousel._build();

