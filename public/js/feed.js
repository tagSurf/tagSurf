onload = function ()
{
	populateNavbar();
	gallerize("history");

	var data, current_tag = "trending";
	var buffer_minimum = 3;
	var known_keys = {};
	var populateSlider = function (update)
	{
		xhr("/api/media/" + current_tag, null, function(response_data) {
			var rdata = response_data.data;
			if (update) {
				// this method only nets 4 cards for every 10 cards requested
				// needs new API!
				for (var i = 0; i < rdata.length; i++) {
					if (!known_keys[rdata[i].id]) {
						data.push(rdata[i]);
						known_keys[rdata[i].id] = true;
					}
				}
			} else {
				for (var card in rdata)
					known_keys[rdata[card].id] = true;
				cardIndex = 0;
				slideContainer.innerHTML = "";
				data = rdata;
				buildCard(2);
			}
		}, function() {
			if (!update) {
				data = [];
				cardIndex = 0;
				slideContainer.innerHTML = "";
				buildCard();
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
	xhr("/api/tags", null, function(response_data) {
		response_data.data.forEach(function(tag) {
			if (tag.name) {
				var n = document.createElement("div");
				n.innerHTML = tag.name;
				n.className = "tagline";
				var tlower = tag.name.toLowerCase();
				for (var i = 1; i <= tlower.length; i++)
					n.className += " " + tlower.slice(0, i);
				aclist.appendChild(n);
				n.onclick = function() {
					viewTag(tag.name);
				};
			}
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
				className: tinput.value.toLowerCase(),
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
	addCss(".basic-zoom { z-index: 2; position: absolute; top: 100px;");
	var scrollContainer = document.getElementById('scroll-container');
	var slideContainer = document.getElementById('slider');
	var formattingContainer = document.getElementById('formatter');
	var navBarHeight = document.getElementById('navbar').clientHeight + 15;
	var slider = slideContainer.children[0];
	var cardCompression = [false, false, false];
	animationInProgress = false;
	var isExpanded = false;
	var superState = false;
	var zoomState =
	{
		zoomed: false,
		large: false,
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
			horizontalBound = ((zNode.clientWidth - window.innerWidth) / 2), 
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
			blackback.className = "blackout blackfade";
			zNode = slider.firstChild.firstChild.cloneNode(true);
			scaledWidth = window.innerWidth;
			zNode.className = 'hider basic-zoom';
			zNode.style.left = "0px";
			zNode.style.width = window.innerWidth + "px";
			zoomState.zoomNode = zNode;
			zoomState.zoomed = true;
			document.body.appendChild(zNode);
			gesture.listen("tap", zNode, largeZoom);
			gesture.listen("swipe", zNode, doubleTap);
			zNode.style['-webkit-transition'] = "";
			zNode.classList.remove('hider');
		}
		else
		{
			zoomState.zoomed = false;
			blackback.className = "blackout";
			zNode = zoomState.zoomNode;
			document.body.removeChild(zNode);
			zoomState.zoomNode = null;
		}
	};
	var largeZoom = function (tapCount)
	{
		if (tapCount == 2)
		{
			zoomTap();
		}
	};
	var zoomTap = function ()
	{
		var zNode = zoomState.zoomNode, 
			zoomWidth = zoomScale * zNode.clientWidth,
			zoomLeft = -((zoomWidth - window.innerWidth) / 2);
		var zoomUpEnd = function (event)
		{
			zNode.style['-webkit-transition'] = "";
			zNode.removeEventListener("webkitTransitionEnd", zoomUpEnd, false);
		};
		zNode.addEventListener("webkitTransitionEnd", zoomUpEnd, false);
		zNode.style['-webkit-transition'] = "width 250ms ease-in, left 250ms ease-in, -webkit-transform 250ms ease-in";
		if (zoomState.large == false)
		{
			zoomState.large = true;
			zNode.style.width = zoomWidth + "px";
			zNode.style.left = zoomLeft + "px";
			zoomState.xCurrent = 0;
			zoomState.yCurrent = 0;
			gesture.unlisten(zNode);
			gesture.listen("swipe", zNode, zoomSwipeCallback);
			gesture.listen("drag", zNode, zoomDragCallback);
			gesture.listen("up", zNode, zoomUpCallback);
			gesture.listen("tap", zNode, largeZoom);
		}
		else
		{
			zoomState.large = false;
			zoomWidth = window.innerWidth + "px";
			zoomLeft = "0px";
			zNode.style.width = zoomWidth;
			zNode.style.left = zoomLeft;
			zNode.style['-webkit-transform'] = "";
			gesture.unlisten(zNode);
			gesture.listen("tap", zNode, largeZoom);
			gesture.listen("swipe", zNode, doubleTap);
		}
	};
	var revertSlider = function ()
	{
		animationInProgress = true;
		slider.style['-webkit-transition'] = "-webkit-transform 250ms ease-in";
		slider.style['-webkit-transform'] = "translate3d(0,0,0) rotate(0deg)";
		slider.style['border-color'] = "#353535";
		slider.style['background-color'] = "#353535";
		var revertSliderCallback = function (event) {
			slider.style['-webkit-transition'] = "";
			slider.style['-webkit-transform'] = "";
			animationInProgress = false;
			resetSlideState();
			slider.removeEventListener("webkitTransitionEnd", revertSliderCallback, false);
		};
		slider.addEventListener( 'webkitTransitionEnd', revertSliderCallback, false);
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
			animationInProgress = false;
			clearTimeout(scrollEndTimeout);
			scrollContainer.style['-webkit-transition'] = "";
			scrollContainer.removeEventListener('webkitTransitionEnd', scrollEnd, false);
		};
		var scrollEndTimeout = setTimeout(scrollEnd, 250);
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
					if (superState == true)
					{
						toggleClass.apply(slider,['super_card']);
						superState = false;
					}
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
	var swipeSlider = function (direction, voteAlternative, timeDifference)
	{
		animationInProgress = true;
		var activeCard = data[cardIndex-3];
		var translateQuantity = 600, rotateQuantity = 60,
			verticalQuantity = 0;
		var isUp = direction == "right";
		var transitionLength = timeDifference || 250;
		if (superState == true)
		{
			verticalQuantity = -500;
		}
		if (!isUp)
		{
			translateQuantity = -translateQuantity;
			rotateQuantity = -rotateQuantity;
			verticalQuantity = -verticalQuantity;
		}
		slider.style['-webkit-transition'] = "-webkit-transform " + transitionLength + "ms";
		slider.style['-webkit-transform'] = "translate3d(" + translateQuantity + "px," + verticalQuantity + "px,0) rotate(" + rotateQuantity + "deg)";
		var swipeSliderCallback = function (event) {
			animationInProgress = false;
			clearTimeout(swipeSliderCallbackTimeout);
			slider.removeEventListener( 'webkitTransitionEnd', swipeSliderCallback, false);
			gesture.unlisten(slider.parentNode);
			slideContainer.removeChild(slider.parentNode);
			updateCompressionStatus();
			buildCard(0);
			slideContainer.children[0].style.zIndex = 2;
			if (slideContainer.children[1]) {
				slideContainer.children[1].style.zIndex = 1;
				slideContainer.children[1].style["visibility"] = "visible";
			}
			resetSlideState();
			revertScroller(0);
			if (voteAlternative) voteAlternative();
			else xhr("/api/votes/" + (isUp ? "up/" : "down/") + activeCard.id
				+ "/tag/" + current_tag, "POST");
		};
		var swipeSliderCallbackTimeout = setTimeout(swipeSliderCallback, transitionLength);
		slider.addEventListener( 'webkitTransitionEnd', swipeSliderCallback, false);
		addHistoryItem(activeCard);
	};
	window.onkeyup = function(e) {
		e = e || window.event;
		var code = e.keyCode || e.which;
		if (code == 37)
			swipeSlider("left");
		else if (code == 39)
			swipeSlider("right");
	};
	var swipeCallback = function (direction, distance, dx, dy, timeDifference)
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
			swipeSlider("left", null, timeDifference);
		}
		else if (direction == "right")
		{
			swipeSlider("right", null, timeDifference);
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
						if (superState == true)
						{
							slider.style['background-color'] = 'green';
						}
						slider.style['border-color'] = 'green';
					}
					else if (slideState.xCurrent < 0)
					{
						if (superState == true)
						{
							slider.style['background-color'] = '#C90016';
						}
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
	var holdCallback = function (duration) {
		if (duration == 3000)
		{
			superState = true;
			toggleClass.apply(slider, ['super_card']);
		}
	};
	var updateCompressionStatus = function ()
	{
		cardCompression.shift();
		isExpanded = false;
	}
	var buildCard = function (zIndex)
	{
		if (data.length <= cardIndex) {
			cardIndex = Math.max(cardIndex + 1, 3);
			var c_wrapper = document.createElement("div");
			c_wrapper.className = "card-wrapper";
			var c_container = document.createElement("div");
			c_container.className = "card-container center-label";
			c_container.innerHTML = "No more cards in " + current_tag + " feed!";
			c_wrapper.appendChild(c_container);
			slideContainer.appendChild(c_wrapper);
			return;
		}
		var imageContainer, textContainer, fullscreenButton, truncatedTitle, card;
		var cardTemplate = "<div class='card-wrapper'><div class='card-container' style='z-index:" + zIndex + ";'><div class='image-container expand-animation'><img src='" + data[cardIndex].image_link_original + "'></div><div class='text-container'><p>" + data[cardIndex].title + "</p></div><div class='expand-button'><img src='img/down_arrow.png'></div><div class='super_label'>SUPER VOTE</div></div></div>";
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
				cardCompression[2 - zIndex] = false;
			}
			else
			{
				truncatedTitle = data[cardIndex].title.trunc(30);
				truncatedTitle = "<p>" + truncatedTitle + "</p>";
				textContainer.innerHTML = truncatedTitle;
				cardCompression[2 - zIndex] = true;
			}
			card = formatter.firstChild;
			card.style["visibility"] = zIndex ? "" : "hidden";
			slideContainer.appendChild(card);
			slider = slideContainer.children[0].children[0];
			initCardGestures.call(card);
			formattingContainer.removeChild(formatter);

			++cardIndex;
			if (data.length == cardIndex + buffer_minimum)
				populateSlider(true);

			if (zIndex)
				buildCard(zIndex - 1);
		};
	};
	var initCardGestures = function ()
	{
		gesture.listen("swipe", this, swipeCallback);
		gesture.listen("up", this, upCallback);
		gesture.listen("tap", this, tapCallback);
		gesture.listen("drag", this, dragCallback);
		gesture.listen("hold", this, holdCallback);
	};
	var expandCard = function ()
	{
		if (cardCompression[0])
		{
			cardCompression[0] = false;
			isExpanded = true;
			slider.children[0].className += " expanded";
			slider.children[1].innerHTML = "<p>" + data[cardIndex-3].title + "</p>";
			slider.children[2].style.visibility = "hidden";
		}
	};
	setStarCallback(function() {
		setFavIcon(true);
		xhr("/api/favorites/" + data[cardIndex-3].id, "POST", function() {
			swipeSlider("right", function () {
				setFavIcon(false);
			});
		});
	});
	populateSlider();
};
