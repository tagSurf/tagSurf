onload = function ()
{
	populateNavbar();
	gallerize();

	var data, current_tag = "funny";
	var populateSlider = function ()
	{
		xhr("/api/media/" + current_tag, function(response_data) {
			data = response_data.data;
			slideContainer.innerHTML = "";
			buildCard(2);
		});
	};

	// autocomplete stuff
	var tinput = document.getElementById("tag-input");
	var aclist = document.getElementById("autocomplete");
	xhr("/api/tags", function(response_data) {
		response_data.data.forEach(function(tag) {
			var n = document.createElement("div");
			n.innerHTML = tag.name;
			aclist.appendChild(n);
			n.onclick = function() {
				aclist.style.display = "none";
				tinput.value = tag.name;
				current_tag = tag.name;
				populateSlider();
			}
		});
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
	var slideContainer = document.getElementById('slider');
	var formatter = document.getElementById('formatter');
	var slider = slideContainer.children[0];
	var cardCompression = true;
	var animationInProgress = false;
	var nextCardCompression = true;
	var isExpanded = false;
	var slideState =
	{
		active: false,
		sliding: false,
		verticaling: false,
		xStart: 0,
		yStart: 0,
		xTotal: 0,
		yTotal: 0,
		xLast: null,
		yLast: null
	};
	var resetSlideState = function ()
	{
		slideState =
		{
			active: false,
			sliding: false,
			verticaling: false,
			xStart: 0,
			yStart: 0,
			xTotal: 0,
			yTotal: 0,
			xLast: null,
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
		var cardTemplate = "<div class='card-wrapper'><div class='card-container' style='z-index:" + stackIndex + ";'><div class='image-container expand-animation'><img src='" + data[cardIndex].image_link_original + "'></div><div class='text-container'><p>" + data[cardIndex].title + "</p></div><div class='expand-button'><img src='img/down_arrow.png'></div></div></div>";
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
				truncatedTitle = data[cardIndex].title.trunc(30);
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
			slider.children[1].innerHTML = "<p>" + data[cardIndex-2].title + "</p>";
			slider.children[2].style.visibility = "hidden";
		}
	};
	var vote = function(isUp) {
		var transVal = 600;
		var rotVal = 60;
		if (!isUp) {
			transVal *= -1;
			rotVal *= -1;
		}
		slider.style['-webkit-transition'] = "-webkit-transform 250ms ease-in";
		slider.style['-webkit-transform'] = "translate3d(" + transVal + "px,0,0) rotate(" + rotVal + "deg)";
		slider.addEventListener('webkitTransitionEnd', function () {
			slideContainer.removeChild(slider.parentNode);
			slideContainer.children[0].style.zIndex = 2;
			buildCard(1); 
			animationInProgress = false;
			updateCompressionStatus();
			xhr("/api/votes/" + (isUp ? "up/" : "down/") + data[cardIndex-2].id,
				null, "POST");
		}, false);
	};
	document.getElementById("favorites-btn").onclick = function() {
		xhr("/api/favorites/" + data[cardIndex-2].id, null, "POST");
		vote(true);
	};
	var moveStart = function (event)
	{
		if (animationInProgress == false)
		{
			slideState.active = true;
		}
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
		event.preventDefault();
		return false;
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

		if ((distance < tapThreshold) && cardCompression)
		{
			expandCard();
		}
		else
		{
			animationInProgress = true;
			if (slideState.xTotal > slideThreshold)
				vote(true);
			else if (slideState.xTotal < -slideThreshold)
				vote(false);
			else 
			{
				slider.style['-webkit-transition'] = "-webkit-transform 250ms ease-in";
				slider.style['-webkit-transform'] = "translate3d(0,0,0) rotate(0deg)";
				slider.style['border-color'] = "#353535";
				slider.addEventListener( 'webkitTransitionEnd', function (event) {
					slider.style['-webkit-transition'] = "";
					slider.style['-webkit-transform'] = "";
					animationInProgress = false;
				}, false);
			}
			resetSlideState();
		}
		event.preventDefault();
		return false;
	}
	var swipeMove = function (event)
	{
		var xDifference, _xTotal, _yLast, _yDiff;
		
		if (event.type == 'touchmove')
		{
			_yLast = event.changedTouches[0].pageY;
		}
		else
		{
			_yLast = event.y;
		}
		if (slideState.yLast)
			_yDiff = slideState.yLast - _yLast;
		slideState.yLast = _yLast;
		slideState.yTotal = slideState.yStart - slideState.yLast;

		if ((Math.abs(slideState.yTotal) > verticalingThreshold) && (slideState.sliding == false))
		{
			slideState.verticaling = true;
		}
		
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
			_xTotal = Math.abs(slideState.xTotal);
			if (_xTotal > tapThreshold)
			{
				slideState.sliding = true;
			}
			if (slideState.sliding == true && slideState.verticaling == false)
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
			if (isExpanded && slideState.verticaling && _yDiff)
				window.scrollBy(0, _yDiff);
		}
		event.preventDefault();
		return false;
	};
	populateSlider();
};
