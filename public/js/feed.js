onload = function ()
{
	populateNavbar();
	gallerize();

	var data, current_tag = "funny";
	var populateSlider = function (update)
	{
		xhr("/api/media/" + current_tag, function(response_data) {
			if (update)
				data = data.concat(response_data.data);
			else {
				cardIndex = 0;
				data = response_data.data;
				slideContainer.innerHTML = "";
				buildCard(2);
			}
		});
	};

	// autocomplete stuff
	var blackback = document.getElementById("blackback");
	var tinput = document.getElementById("tag-input");
	var aclist = document.getElementById("autocomplete");
	var viewTag = function(tagName) {
		aclist.className = "";
		blackback.className = "blackout";
		current_tag = tinput.value = tagName;
		populateSlider();
	};
	xhr("/api/tags", function(response_data) {
		response_data.data.forEach(function(tag) {
			var n = document.createElement("div");
			n.innerHTML = tag.name;
			n.className = "tagline";
			for (var i = 1; i <= tag.name.length; i++)
				n.className += " " + tag.name.slice(0, i);
			aclist.appendChild(n);
			n.onclick = function() {
				viewTag(tag.name);
			};
		});
	});
	tinput.onclick = function() {
		aclist.className = "autocomplete-open";
		blackback.className = "blackout blackfade";
	};
	blackback.onclick = function() {
		aclist.className = "";
		blackback.className = "blackout";
	};
	tinput.onkeyup = function(e) {
		e = e || window.event;
		var code = e.keyCode || e.which;
		if (code == 13 || code == 3)
			viewTag(tinput.value);
		else if (tinput.value) {
			mod({
				className: "tagline",
				hide: true
			});
			mod({
				className: tinput.value,
				show: true
			});
		} else mod({
			className: "tagline",
			show: true
		});
	};

	// slider stuff
	var cardIndex = 0;
	var zoomScale = 1.5;
	var rotationScale = 0.075;
	var translationScale = 1.35;
	var maxCardHeight = window.innerHeight - 180;
	var slideThreshold = 60;
	addCss(".expand-animation { max-height: "
		+ maxCardHeight + "px; } .card-container { min-height: "
		+ (maxCardHeight + 65) + "px; }");
	var scrollContainer = document.getElementById('scroll-container');
	var slideContainer = document.getElementById('slider');
	var formattingContainer = document.getElementById('formatter');
	var navBarHeight = document.getElementById('navbar').clientHeight + 15;
	var slider = slideContainer.children[0];
	var cardCompression = true;
	animationInProgress = false;
	var nextCardCompression = true;
	var isExpanded = false;
	var zoomState =
	{
		zoomed: false,
		zoomNode: null,
		xCurrent: 0,
		yCurrent: 0
	};
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
	var zoomDragCallback = function (direction, distance, dx, dy)
	{
		if (animationInProgress == true)
		{
			return;
		}
		zoomState.xCurrent += dx;
		zoomState.yCurrent += dy;
		zoomState.zoomNode.style['-webkit-transform'] = 
			"translate3d(" + zoomState.xCurrent +"px," + zoomState.yCurrent + "px,0)";
	};
	var zoomBoundaryMonitor = function ()
	{
		var zNode = zoomState.zoomNode,
			topBound = 0, bottomBound = 100 + zNode.clientHeight - window.innerHeight,
			horizontalBound = (zNode.clientWidth - window.innerWidth - 80), 
			xRevert = zoomState.xCurrent, yRevert = zoomState.yCurrent;
		if (zoomState.yCurrent > topBound)
		{
			yRevert = topBound;
		}
		else if (zoomState.yCurrent < -bottomBound)
		{
			yRevert = -bottomBound;
		}
		if (zoomState.xCurrent > horizontalBound)
		{
			xRevert = horizontalBound;
		}
		else if (zoomState.xCurrent < -horizontalBound)
		{
			xRevert = -horizontalBound;
		}
		if (xRevert != zoomState.xCurrent || yRevert != zoomState.yCurrent)
		{
			revertZoomedNode(xRevert, yRevert);
		}
	};
	var zoomUpCallback = function ()
	{
		if (animationInProgress == false)
		{
			zoomBoundaryMonitor();
		}
	};
	var revertZoomedNode = function (xRevert, yRevert) 
	{
		var zNode = zoomState.zoomNode;
		zoomState.xCurrent = xRevert;
		zoomState.yCurrent = yRevert;
		animationInProgress = true;
		var zoomSlideEnd = function (event)
		{
			zNode.style['-webkit-transition'] = "";
			animationInProgress = false;
			zNode.removeEventListener("webkitTransitionEnd", zoomSlideEnd, false);
		};
		zNode.addEventListener("webkitTransitionEnd", zoomSlideEnd, false);
		zNode.style['-webkit-transition'] = "-webkit-transform 500ms ease-out";
		zNode.style['-webkit-transform'] = "translate3d(" + xRevert + "px," + yRevert + "px,0)";
	};
	var zoomSwipeCallback = function (direction, distance, dx, dy)
	{
		var zNode = zoomState.zoomNode;
		zoomState.xCurrent += dx;
		zoomState.yCurrent += dy;
		animationInProgress = true;
		zNode.style['-webkit-transition'] = "-webkit-transform 250ms ease-out";
		zNode.style['-webkit-transform'] = 
			"translate3d(" + zoomState.xCurrent +"px," + zoomState.yCurrent + "px,0)";
		var zoomSwipeEnd = function (event)
		{
			zNode.style['-webkit-transition'] = "";
			animationInProgress = false;
			zoomBoundaryMonitor();
			zNode.removeEventListener("webkitTransitionEnd", zoomSwipeEnd, false);
		};
		zNode.addEventListener("webkitTransitionEnd", zoomSwipeEnd, false);
	};
	var doubleTap = function ()
	{
		var zNode, scaledWidth;
		if (zoomState.zoomed == false)
		{
			zNode = slider.cloneNode(true);
			scaledWidth = window.innerWidth * zoomScale;
			zNode.classList.add('hider');
			zNode.style.width = scaledWidth + "px";
			zNode.style.left = -(window.innerWidth * (zoomScale - 1) / 2) + "px";
			zoomState.zoomNode = zNode;
			zoomState.zoomed = true;
			zoomState.xCurrent = 0;
			zoomState.yCurrent = 0;
			document.body.appendChild(zNode);
			gesture.listen("tap", zNode, function (tapCount) {
				if (tapCount == 2)
				{
					doubleTap();
				}
			});
			gesture.listen("swipe", zNode, zoomSwipeCallback);
			gesture.listen("drag", zNode, zoomDragCallback);
			gesture.listen("up", zNode, zoomUpCallback);
			zNode.style['-webkit-transition'] = "";
			zNode.classList.remove('hider');
		}
		else
		{
			zoomState.zoomed = false;
			zNode = zoomState.zoomNode;
			document.body.removeChild(zNode);
			zoomState.zoomNode = null;
		}
	};
	var revertSlider = function ()
	{
		animationInProgress = true;
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
	var boundaryMonitor = function ()
	{
		var bottomBoundary = window.innerHeight - (navBarHeight + slider.clientHeight + 70);
		if (scrollState.yCurrent > 0)
		{
			revertScroller(0);
		}
		else if (scrollState.yCurrent < bottomBoundary)
		{
			revertScroller(bottomBoundary);
		}
		else
		{
			scrollContainer.style['-webkit-transition'] = "";
			animationInProgress = false;
		}
	};
	var revertScroller = function (revertHeight)
	{
		animationInProgress = true;
		scrollContainer.style['-webkit-transition'] = "-webkit-transform 250ms ease-out";
		scrollContainer.style['-webkit-transform'] = "translate3d(0," + revertHeight + "px,0)";
		var scrollEnd = function (event) {
			scrollState.yCurrent = revertHeight;
			scrollState.verticaling = false;
			scrollContainer.style['-webkit-transition'] = "";
			animationInProgress = false;
			scrollContainer.removeEventListener('webkitTransitionEnd', scrollEnd, false);
		};
		scrollContainer.addEventListener('webkitTransitionEnd', scrollEnd, false);
	};
	var upCallback = function ()
	{
		if (animationInProgress == false)
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
			if (scrollState.verticaling == true)
			{
				boundaryMonitor();
			}
		}
		scrollState.verticaling = false;
		slideState.sliding = false;
	};
	var swipeSlider = function (direction)
	{
		animationInProgress = true;
		var translateQuantity = 600, rotateQuantity = 60;
		var isUp = direction == "right";
		if (!isUp)
		{
			translateQuantity = -translateQuantity;
			rotateQuantity = -rotateQuantity;
		}
		slider.style['-webkit-transition'] = "-webkit-transform 250ms ease-in";
		slider.style['-webkit-transform'] = "translate3d(" + translateQuantity + "px,0,0) rotate(" + rotateQuantity + "deg)";
		slider.addEventListener( 'webkitTransitionEnd', function (event) {
			slideContainer.removeChild(slider.parentNode);
			slideContainer.children[0].style.zIndex = 2;
			buildCard(1); 
			updateCompressionStatus();
			resetSlideState(); 
			revertScroller(0);
			xhr("/api/votes/" + (isUp ? "up/" : "down/") + data[cardIndex-2].id,
				null, "POST");
		},false);
	};
	var swipeCallback = function (direction, distance, dx, dy)
	{
		if (animationInProgress)
			return;
		var translateQuantity, rotateQuantity, animationDistance;
		animationInProgress = true;
		if (isExpanded == true &&
			(direction == "up" || direction == "down"))
		{
			animationDistance = dy;
			scrollState.yCurrent += animationDistance;
			scrollContainer.style['-webkit-transition'] = "-webkit-transform 250ms ease-out";
			scrollContainer.style['-webkit-transform'] = "translate3d(0,"+ (scrollState.yCurrent) + "px,0)";
			var verticalSwipeEnd = function (event)
			{
				boundaryMonitor();
				scrollContainer.removeEventListener('webkitTransitionEnd', verticalSwipeEnd, false);
			};
			scrollContainer.addEventListener( 'webkitTransitionEnd', verticalSwipeEnd, false);
		}
		else if (direction == "left")
		{
			swipeSlider("left");
		}
		else if (direction == "right")
		{
			swipeSlider("right");
		}
	};
	var dragCallback = function (direction, distance, dx, dy)
	{
		if (animationInProgress == false)
		{
			if (isExpanded == true && 
				(direction == "up" || direction == "down"))
			{
				if (slideState.sliding == false)
				{
					scrollState.verticaling = true;
					scrollState.yCurrent += dy / 2;
					scrollContainer.style['-webkit-transform'] = "translate3d(0," + scrollState.yCurrent + "px,0)";
				}
			}
			else 
			{
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
				doubleTap();
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
		var cardTemplate = "<div class='card-wrapper'><div class='card-container' style='z-index:" + stackIndex + ";'><div class='image-container expand-animation'><img src='" + data[cardIndex].image_link_original + "'></div><div class='text-container'><p>" + data[cardIndex].title + "</p></div><div class='expand-button'><img src='img/down_arrow.png'></div></div></div>";
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
			slider.children[1].innerHTML = "<p>" + data[cardIndex-2].title + "</p>";
			slider.children[2].style.visibility = "hidden";
		}
	};
	document.getElementById("favorites-btn").onclick = function() {
		xhr("/api/favorites/" + data[cardIndex-2].id, null, "POST");
		swipeSlider("right");
	};
	populateSlider();
};
