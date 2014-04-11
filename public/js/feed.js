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
	var verticalingThreshold = 10;
	var tapThreshold = 5;
	var rotationScale = 0.075;
	var translationScale = 1.35;
	var maxCardHeight = window.innerHeight - 170;
	addCss(".expand-animation { max-height: "
		+ maxCardHeight + "px; } .card-container { min-height: "
		+ (maxCardHeight + 65) + "px; }");
	var scrollContainer = document.getElementById('scroll-container');
	var slideContainer = document.getElementById('slider');
	var formatter = document.getElementById('formatter');
	var slider = slideContainer.children[0];
	var cardCompression = true;
	var animationInProgress = false;
	var nextCardCompression = true;
	var isExpanded = false;
	var activeState = false;
	var scrollState = 
	{
		verticaling: false,
		yCurrent: 0,
		yStart: 0,
		yTotal: 0,
		yLast: null
	};
	var slideState =
	{
		sliding: false,
		xStart: 0,
		xTotal: 0,
		xLast: null
	};
	var resetSlideState = function ()
	{
		slideState =
		{
			sliding: false,
			xStart: 0,
			xTotal: 0,
			xLast: null
		};
	};
	var resetScrollState = function ()
	{
		scrollState =
		{
			verticaling: false,
			yStart: 0,
			yTotal: 0,
			yLast: null
		};
	};
	var updateCompressionStatus = function ()
	{
		cardCompression = nextCardCompression;
		isExpanded = false;
	}
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
					cardCompression = false;
				}
				else
				{
					nextCardCompression = false;
				}
			}
			else
			{
				truncatedTitle = test_data[cardIndex].title.trunc(30);
				truncatedTitle = "<p>" + truncatedTitle + "</p>";
				textContainer.innerHTML = truncatedTitle;
				if (stackIndex != 1)
				{
					cardCompression = true;
				}
				else
				{
					nextCardCompression = true;
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
		if (cardCompression)
		{
			cardCompression = false;
			isExpanded = true;
			slider.children[0].className += " expanded";
			slider.children[1].innerHTML = "<p>" + test_data[cardIndex-2].title + "</p>";
			slider.children[2].style.visibility = "hidden";
		}
	};
	var moveStart = function (event)
	{
		console.log(animationInProgress,scrollState,slideState,activeState);
		if (animationInProgress == false)
		{
			activeState = true;
		}
		if (event.type == 'touchstart')
		{
			slideState.xStart = event.changedTouches[0].pageX;
			slideState.xLast = event.changedTouches[0].pageX;
			scrollState.yStart = event.changedTouches[0].pageY;
			scrollState.yLast = event.changedTouches[0].pageY;
		}
		else
		{
			slideState.xStart = event.x;
			slideState.xLast = event.x;
			scrollState.yStart = event.y;
			scrollState.yLast = event.y;
		}
		slideState.xTotal = 0;
		scrollState.yTotal = 0;
		event.preventDefault();
		return false;
	};
	var moveEnd = function (event)
	{
		var xDifference, yDifference, distance, _xLast, _yLast, animationDistance;
		activeState = false;

		if (event.type == 'touchend')
		{
			_xLast = event.changedTouches[0].pageX;
			_yLast = event.changedTouches[0].pageY;
		}
		else
		{
			_xLast = event.x;
			_yLast = event.y;
		}
		yDifference = _yLast - scrollState.yLast;
		xDifference = _xLast - slideState.xLast;
		scrollState.yLast = _yLast;
		slideState.xLast = _xLast;
		scrollState.yTotal += yDifference;
		slideState.xTotal += xDifference;

		distance = Math.sqrt((scrollState.yTotal * scrollState.yTotal) + (slideState.xTotal * slideState.xTotal));

		if ((distance < tapThreshold) && cardCompression)
		{
			expandCard();
		}
		else
		{
			animationInProgress = true;
			if (scrollState.verticaling == false)
			{
				if (slideState.xTotal > slideThreshold)
				{
					slider.style['-webkit-transition'] = "-webkit-transform 250ms ease-in";
					slider.style['-webkit-transform'] = "translate3d(600px,0,0) rotate(60deg)";
					resetSlideState();
					slider.addEventListener( 'webkitTransitionEnd', function (event) {
						slideContainer.removeChild(slider.parentNode);
						slideContainer.children[0].style.zIndex = 2;
						buildCard(1); 
						animationInProgress = false;
						updateCompressionStatus();
						resetSlideState(); resetScrollState();
						scrollState.yCurrent = 0;
					},false);
				}
				else if (slideState.xTotal < -slideThreshold)
				{
					slider.style['-webkit-transition'] = "-webkit-transform 250ms ease-in";
					slider.style['-webkit-transform'] = "translate3d(-600px,0,0) rotate(-60deg)";
					resetSlideState();
					slider.addEventListener( 'webkitTransitionEnd', function (event) {
						slideContainer.removeChild(slider.parentNode);
						slideContainer.children[0].style.zIndex = 2;
						buildCard(1);
						animationInProgress = false;
						updateCompressionStatus();
						resetSlideState(); resetScrollState();
						scrollState.yCurrent = 0;
					},false);
				}
				else
				{
					slider.style['-webkit-transition'] = "-webkit-transform 250ms ease-in";
					slider.style['-webkit-transform'] = "translate3d(0,0,0) rotate(0deg)";
					slider.style['border-color'] = "#353535";
					slider.addEventListener( 'webkitTransitionEnd', function (event) {
						slider.style['-webkit-transition'] = "";
						slider.style['-webkit-transform'] = "";
						animationInProgress = false;
						resetSlideState();
					}, false);
				}
			}
			else
			{
				animationDistance = 4 * scrollState.yTotal / 3;
				scrollState.yCurrent -= animationDistance;
				scrollContainer.style['-webkit-transition'] = "-webkit-transform 250ms ease-in-out";
				scrollContainer.style['-webkit-transform'] = "translate3d(0,"+ (scrollState.yCurrent) + "px,0)";
				scrollContainer.addEventListener( 'webkitTransitionEnd', function (event) {
					scrollContainer.style['-webkit-transition'] = "";
					scrollContainer.style['-webkit-transition'] = "";
					animationInProgress = false;
					resetScrollState();resetSlideState();
				}, false);
			}
		}
		event.preventDefault();
		return false;
	}
	var swipeMove = function (event)
	{
		var xDifference, _xLast, _xDiff, _yLast, _yDiff;
		
		if (event.type == 'touchmove')
		{
			_xLast = event.changedTouches[0].pageX;
			_yLast = event.changedTouches[0].pageY;
		}
		else
		{
			_xLast = event.x;
			_yLast = event.y;
		}
		if (scrollState.yLast && slideState.xLast)
		{
			_yDiff = _yLast - scrollState.yLast;
			_xDiff = _xLast - slideState.xLast;
		}
		scrollState.yLast = _yLast;
		slideState.xLast = _xLast;
		scrollState.yTotal += _yDiff;
		slideState.xTotal += _xDiff;
		
		if (activeState)
		{
			if ((Math.abs(scrollState.yTotal) > verticalingThreshold) && (slideState.sliding == false) && (cardCompression == false))
			{
				scrollState.verticaling = true;
			}
			if ((Math.abs(slideState.xTotal) > tapThreshold) && (scrollState.verticaling == false))
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
					"translate3d(" + ((slideState.xTotal - tapThreshold) * translationScale) + "px,0,0) rotate(" + ((slideState.xTotal - tapThreshold) * rotationScale) + "deg)";
			}
			if (isExpanded && scrollState.verticaling && _yDiff)
			{
				scrollState.yCurrent -= _yDiff;
				scrollContainer.style['-webkit-transform'] = "translate3d(0," + (scrollState.yCurrent - verticalingThreshold) + "px,0)";
				//window.scrollBy(0, _yDiff);
			}
		}
		event.preventDefault();
		return false;
	};
	populateSlider();
};
