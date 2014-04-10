onload = function ()
{
	populateNavbar();

	// autocomplete stuff
	var tinput = document.getElementById("tag-input");
	var aclist = document.getElementById("autocomplete");
	test_suggestions.forEach(function(s) {
		var n = document.createElement("div");
		n.innerHTML = s;
		aclist.appendChild(n);
		n.onclick = function() {
			aclist.style.display = "none";
			tinput.value = s;
		}
	});
	tinput.onclick = function() {
		aclist.style.display = "block";
	};

	// slider stuff
	var cardIndex = 0;
	var slideThreshold = 60;
	var tapThreshold = 20;
	var rotationScale = 0.075;
	var translationScale = 1.35;
	var maxCardHeight = 300;
	var slideContainer = document.getElementById('slider');
	var formatter = document.getElementById('formatter');
	var slider = slideContainer.children[0];
	var slideState =
	{
		active: false,
		sliding: false,
		xStart: 0,
		yStart: 0,
		xTotal: 0,
		xLast: null,
		compressed: true
	};
	var resetSlideState = function ()
	{
		slideState =
		{
			active: false,
			sliding: false,
			xStart: 0,
			yStart: 0,
			xTotal: 0,
			xLast: null,
			compressed: true
		};
	};
	var buildCard = function (stackIndex)
	{
		var imageContainer, textContainer, fullscreenButton, truncatedTitle;
		var cardTemplate = "<div class='card-wrapper'><div class='card-container' style='z-index:" + stackIndex + ";'><div class='image-container expand-animation'><img src='http://" + test_data[cardIndex].src + "'></div><div class='text-container'><p>" + test_data[cardIndex].title + "</p></div><div class='expand-button'><img src='img/down_arrow.png'></div></div></div>";
		formatter.innerHTML = cardTemplate;
		imageContainer = formatter.children[0].children[0].children[0];
		textContainer = formatter.children[0].children[0].children[1];
		fullscreenButton = formatter.children[0].children[0].children[2];
		imageContainer.children[0].onload = function () {
			if (imageContainer.children[0].clientHeight + textContainer.clientHeight < maxCardHeight)
			{
				imageContainer.classList.remove("expand-animation");
				fullscreenButton.className += ' hider';
				if (stackIndex != 1)
				{
					slideState.compressed = false;
				}
			}
			else
			{
				truncatedTitle = test_data[cardIndex].title.trunc(30);
				truncatedTitle = "<p>" + truncatedTitle + "</p>";
				textContainer.innerHTML = truncatedTitle;
				if (stackIndex != 1)
				{
					slideState.compressed = true;
				}
			}
			slideContainer.innerHTML += formatter.innerHTML;
			formatter.innerHTML = "";
			++cardIndex;
			if (slideContainer.children.length < 2)
			{
				buildCard(1);
			}
			else
			{
				initSliding();
			}
		};
	};
	var populateSlider = function ()
	{
		buildCard(2);
	};
	var initSliding = function () 
	{
		slider = document.getElementById('slider').children[0].children[0];
		slider.addEventListener('mousedown', moveStart, false);
		slider.addEventListener('mouseup', moveEnd, false);
		slider.addEventListener('mousemove', swipeMove, false);
		slider.addEventListener('touchstart', moveStart, false);
		slider.addEventListener('touchmove', swipeMove, false);
		slider.addEventListener('touchend', moveEnd, false); 
	};
	var expandCard = function ()
	{
		if (slideState.compressed)
		{
			slideState.compressed = false;
			slider.children[0].className += " expanded";
			slider.children[1].innerHTML = "<p>" + test_data[cardIndex-2].title + "</p>";
			slider.children[2].style.visibility = "hidden";
		}
	};
	var moveStart = function (event)
	{
		slideState.active = true;
		if (event.type == 'touchstart')
		{
			slideState.xStart = event.changedTouches[0].pageX;
			slideState.yStart = event.changedTouches[0].pageY;
			slideState.xLast = event.changedTouches[0].pageX;
		}
		else
		{
			slideState.xStart = event.x;
			slideState.yStart = event.y;
			slideState.xLast = event.x;
		}
		//event.preventDefault();
	};
	var moveEnd = function (event)
	{
		var yTotal, distance;
		slideState.active = false;


		if (event.type == 'touchend')
		{
			yTotal = slideState.yStart - event.changedTouches[0].pageY;
		}
		else
		{
			yTotal = slideState.yStart - event.y;
		}

		distance = Math.sqrt((yTotal * yTotal) + (slideState.xTotal * slideState.xTotal));

		if (distance < tapThreshold && slideState.compressed)
		{
			expandCard();	
		}
		else
		{
			if (slideState.xTotal > slideThreshold)
			{
				slider.style['-webkit-transition'] = "-webkit-transform 250ms ease-in";
				slider.style['-webkit-transform'] = "translate3d(600px,0,0) rotate(60deg)";
				slider.addEventListener( 'webkitTransitionEnd', function (event) {
					slideContainer.removeChild(slider.parentNode);
					slideContainer.children[0].style.zIndex = 2;
					buildCard(1); resetSlideState();
				},false);
			}
			else if (Math.abs(slideState.xTotal) < slideThreshold)
			{
				slider.style['-webkit-transition'] = "-webkit-transform 250ms ease-in";
				slider.style['-webkit-transform'] = "translate3d(0,0,0) rotate(0deg)";
				slider.addEventListener( 'webkitTransitionEnd', function (event) {
					slider.style['-webkit-transition'] = "";
					slider.style['border-color'] = "#353535";
					resetSlideState();
				}, false);
			}
			else if (slideState.xTotal < -slideThreshold)
			{
				slider.style['-webkit-transition'] = "-webkit-transform 250ms ease-in";
				slider.style['-webkit-transform'] = "translate3d(-600px,0,0) rotate(-60deg)";
				slider.addEventListener( 'webkitTransitionEnd', function (event) {
					slideContainer.removeChild(slider.parentNode);
					slideContainer.children[0].style.zIndex = 2;
					buildCard(1); resetSlideState();
				},false);
			}
		}
		event.preventDefault();
	}
	var swipeMove = function (event)
	{
		var xDifference;
		if (slideState.active)
		{
			if (event.type == 'touchmove')
			{
				xDifference = event.changedTouches[0].pageX - slideState.xLast;
				slideState.xLast = event.changedTouches[0].pageX;
			}
			else
			{
				xDifference = event.x - slideState.xLast;
				slideState.xLast = event.x;
			}
			slideState.xTotal += xDifference;
			if (Math.abs(slideState.xTotal) > tapThreshold)
			{
				slideState.sliding = true;
			}
			if (slideState.sliding == true)
			{
				if (slideState.xTotal < 0)
				{
					slider.style['border-color'] = '#C90016';
				}
				else if (slideState.xTotal > 0)
				{
					slider.style['border-color'] = '#8EE5B0';
				}
				slider.style['-webkit-transform'] = 
					"translate3d(" + (slideState.xTotal * translationScale) + "px,0,0) rotate(" + (slideState.xTotal * rotationScale) + "deg)";
				event.preventDefault();
			}
		}
	};
	populateSlider();
};
