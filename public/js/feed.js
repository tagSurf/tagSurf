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
	var rotationScale = 0.075;
	var translationScale = 1.35;
	var maxCardHeight = window.innerHeight - 170;
	var slideThreshold = 60;
	addCss(".expand-animation { max-height: "
		+ maxCardHeight + "px; } .card-container { min-height: "
		+ (maxCardHeight + 65) + "px; }");
	var scrollContainer = document.getElementById('scroll-container');
	var slideContainer = document.getElementById('slider');
	var formattingContainer = document.getElementById('formatter');
	var slider = slideContainer.children[0];
	var cardCompression = true;
	var animationInProgress = false;
	var nextCardCompression = true;
	var isExpanded = false;
	var scrollState = 
	{
		verticaling: false,
		yCurrent: 0
	};
	var slideState =
	{
		sliding: false,
		xCurrent: 0
	};
	var resetSlideState = function ()
	{
		slideState =
		{
			sliding: false,
			xCurrent: 0
		};
	};
	var resetScrollState = function ()
	{
		scrollState =
		{
			verticaling: false,
			yCurrent: 0
		};
	};
	var revertSlider = function ()
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
	};
	var upCallback = function ()
	{
		if (slideState.sliding == true)
		{
			if (Math.abs(slideState.xCurrent) < slideThreshold)
			{
				revertSlider();
			}
			else if (slideState.xCurrent > slideThreshold)
			{
				swipeSlider("right");
			}
			else if (slideState.xCurrent < -slideThreshold)
			{
				swipeSlider("left");
			}
		}
		slideState.sliding = false;
		scrollState.verticaling = false;
	};
	var swipeSlider = function (direction)
	{
		var translateQuantity = 600, rotateQuantity = 60;
		if (direction == "left")
		{
			translateQuantity = -translateQuantity;
			rotateQuantity = -rotateQuantity;
		}
		slider.style['-webkit-transition'] = "-webkit-transform 250ms ease-in";
		slider.style['-webkit-transform'] = 
			"translate3d(" + translateQuantity + "px,0,0) rotate(" + rotateQuantity + "deg)";
		resetSlideState(); 
		slider.addEventListener( 'webkitTransitionEnd', function (event) {
			slideContainer.removeChild(slider.parentNode);
			slideContainer.children[0].style.zIndex = 2;
			buildCard(1); 
			animationInProgress = false;
			updateCompressionStatus();
			resetScrollState();
		},false);
	};
	var swipeCallback = function (direction, distance, dx, dy)
	{
		var translateQuantity, rotateQuantity, animationDistance;
		animationInProgress = true;
		if (cardCompression == false &&
			(direction == "up" || direction == "down"))
		{
			animationDistance = dy / 6;
			scrollState.yCurrent -= animationDistance;
			scrollContainer.style['-webkit-transition'] = "-webkit-transform 250ms ease-out";
			scrollContainer.style['-webkit-transform'] = "translate3d(0,"+ (scrollState.yCurrent) + "px,0)";
			scrollContainer.addEventListener( 'webkitTransitionEnd', function (event) {
				scrollContainer.style['-webkit-transition'] = "";
				animationInProgress = false;
				scrollState.verticaling = false;
			}, false);
		}
	};
	var dragCallback = function (direction, distance, dx, dy)
	{
		if (animationInProgress == false)
		{
			if (cardCompression == false && 
				(direction == "up" || direction == "down"))
			{
				if (slideState.sliding == false)
				{
					scrollState.verticaling = true;
					scrollState.yCurrent -= dy / 2;
					scrollContainer.style['-webkit-transform'] = "translate3d(0," + scrollState.yCurrent + "px,0)";
				}
			}
			else 
			{
				console.log(scrollState);
				if (scrollState.verticaling == false)
				{
					slideState.sliding = true;
					slideState.xCurrent += dx;
					if (slideState.xCurrent > 0)
					{
						slider.style['border-color'] = 'green';
					}
					else if (slideState.xCurrent < 0)
					{
						slider.style['border-color'] = '#C90016';
					}
					slider.style['-webkit-transform'] = 
						"translate3d(" + (slideState.xCurrent * translationScale) + "px,0,0) rotate(" + (slideState.xCurrent * rotationScale) + "deg)";
				}
			}
		}
	};
	var tapCallback = function (tapCount)
	{
		switch (tapCount)
		{
			case 1:
				expandCard();
				break;
			case 2:
				//double tap;
				break;
		}
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
		var formatter = document.createElement('div');
		formattingContainer.appendChild(formatter);
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
			slideContainer.appendChild(formatter.firstChild);
			slider = slideContainer.children[0].children[0];
			initCardGestures.call(slideContainer.children[stackIndex % 2]);
			formattingContainer.removeChild(formatter);
			++cardIndex;
			if (slideContainer.children.length < 2)
			{
				buildCard(1);
			}
		};
	};
	
	var populateSlider = function ()
	{
		buildCard(2);
	};
	var initCardGestures = function () 
	{
		gesture.listen("swipe", this, swipeCallback);
		gesture.listen("up", this, upCallback);
		gesture.listen("tap", this, tapCallback);
		gesture.listen("drag", this, dragCallback);
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
	populateSlider();
};
