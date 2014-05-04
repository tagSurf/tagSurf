onload = function ()
{
	populateNavbar();
	gallerize("history");

	var data, buffer_minimum = 5, known_keys = {},
		staticHash = document.getElementById("static-hash"),
		staticTrending = document.getElementById("static-trending"),
		tinput = document.getElementById("tag-input"),
		inputContainer = document.getElementById("input-container"),
		current_tag = tinput.value
			= document.location.hash.slice(1) || "trending";
	var refreshCards = function(failMsgNode, zIndex) {
		cardIndex = 0;
		if (failMsgNode && data.length == 0)
			failMsgNode.innerHTML = "No more cards in " + current_tag + " feed!";
		else {
			slideContainer.innerHTML = "";
			buildCard(zIndex);
		}
	};
	var popData = function(rdata, firstCard) {
		// this method only nets 4 cards for every 10 cards requested
		// needs new API!
		if (firstCard) known_keys[firstCard.id] = true;
		for (var i = 0; i < rdata.length; i++) {
			if (!known_keys[rdata[i].id]) {
				data.push(rdata[i]);
				known_keys[rdata[i].id] = true;
			}
		}
		if (firstCard) data.unshift(firstCard);
	};
	var populateSlider = function (update, failMsgNode, firstCard)
	{
		var isTrending = current_tag == "trending";
		staticHash.className = isTrending ? "hidden" : "";
		staticTrending.className = isTrending ? "" : "hidden";
		xhr("/api/media/" + current_tag, null, function(response_data) {
			var rdata = response_data.data;
			if (update)
				popData(rdata);
			else {
				data = [];
				popData(rdata, firstCard);
				refreshCards(failMsgNode, 2);
			}
		}, function() {
			if (!update) {
				data = [];
				refreshCards(failMsgNode);
			}
		});
	};

	// autocomplete stuff
	var aclist = document.getElementById("autocomplete");
	var viewTag = function(tagName, insertCurrent) {
		var firstCard;
		if (insertCurrent) // tag link
			firstCard = data[cardIndex-3];
		else // tag bar
			modal.backOff(function() {
				slideContainer.className = "";
				scrollContainer.insertBefore(inputContainer,
					scrollContainer.firstChild);
			});
		location.hash = tagName;
		aclist.className = "";
		tinput.value = tagName;
		tinput.blur();
		if (tagName != current_tag) {
			current_tag = tagName;
			known_keys = {};
			populateSlider(null, null, firstCard);
		}
	};
	var addTag = function(tagName) {
		var n = document.createElement("div");
		n.innerHTML = tagName;
		n.className = "tagline";
		var tlower = tagName.toLowerCase();
		for (var i = 1; i <= tlower.length; i++)
			n.className += " " + tlower.slice(0, i);
		aclist.appendChild(n);
		n.onclick = function() {
			viewTag(tagName);
		};
	};
	xhr("/api/tags", null, function(response_data) {
		var hasTrending = false;
		response_data.data.forEach(function(tag) {
			if (tag.name) {
				hasTrending = hasTrending || tag.name == "trending";
				addTag(tag.name);
			}
		});
		if (!hasTrending)
			addTag("trending");
	});
	tinput.onclick = function() {
		tinput.value = "";
		mod({
			className: "tagline",
			show: true
		});
		aclist.className = "autocomplete-open";
		modal.halfOn(function() {
			viewTag(current_tag);
		}, inputContainer);
		slideContainer.className = "noinput";
		tinput.focus();
	};
	tinput.onkeyup = function(e) {
		e = e || window.event;
		var code = e.keyCode || e.which;
		if (code == 13 || code == 3) {
			tinput.blur();
			tinput.value ? viewTag(tinput.value) : modal.callBack();
		} else if (tinput.value) {
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
	var slideThreshold = 60;
	addCss({
		".expand-animation": function() {
			return "max-height: " + parseInt(maxCardHeight - window.innerHeight * .02) + "px";
		},
		".card-container": function() {
			return "min-height: " + (maxCardHeight + 130) + "px";
		},
		".raw_wrapper, .zoom_wrapper, #scroll-container": function() {
			return "height: " + (window.innerHeight - 50) + "px";
		},
		".image-container img": function () {
			return "width: " + parseInt(window.innerWidth - (14 + .05 * window.innerWidth)) + "px;";
		}
	});
	var scrollContainer = document.getElementById('scroll-container');
	var slideContainer = document.getElementById('slider');
	var formattingContainer = document.getElementById('formatter');
	var slider = slideContainer.children[0];
	var setStartState = function (node)
	{
		node.x = 0;
		node.zoomNode = null;
		node.sliding = false;
		node.verticaling = false;
		node.supering = false;
		node.animating = false;
		node.compressing = true;
		node.large = false;
		node.zoomed = false;
		node.expanded = false;
	};
	var revertStateReset = function (node)
	{
		node.x = 0;
		node.sliding = false;
		node.verticaling = false;
		node.supering = false;
		node.animating = false;
	};
	var doubleTap = function ()
	{
		var zNode, wrapper, gesture_wrapper, scaledWidth;
		if (slider.zoomed == false)
		{
			var modalCallback = function ()
			{
				if (slider.large == false)
				{
					doubleTap();
					modal.backOff();	
				}
			};
			zNode = slider.zoomNode;
			if (!zNode)
			{
				zNode = document.createElement('img');
				zNode.src = image.get(data[cardIndex - 3]);
				scaledWidth = window.innerWidth;
				zNode.className = 'hider basic-zoom';
				zNode.style.left = "0px";
				zNode.style.top = "10px";
				zNode.style.width = "100%";
				slider.zoomNode = zNode;
			}
			modal.backOn(modalCallback);
			slider.zoomed = true;
			wrapper = document.createElement('div');
			gesture_wrapper = document.createElement('div');
			wrapper.className = "zoom_wrapper";
			gesture_wrapper.className = "raw_wrapper";
			wrapper.style.zIndex = 3;
			gesture_wrapper.appendChild(zNode);
			wrapper.appendChild(gesture_wrapper);
			document.body.appendChild(wrapper);
			gesture.listen("tap", zNode.parentNode.parentNode, largeZoom);
			gesture.listen("up", zNode.parentNode.parentNode, function(){return true;});
			gesture.listen("drag", zNode.parentNode.parentNode, function(){return true;});
			gesture.listen("down", zNode.parentNode.parentNode, function(){return true;});
			zNode.style['-webkit-transition'] = "";
			zNode.classList.remove('hider');
		}
		else
		{
			slider.zoomed = false;
			modal.backOff();
			zNode = slider.zoomNode;
			gesture.unlisten(zNode.parentNode.parentNode);
			document.body.removeChild(zNode.parentNode.parentNode);
			slider.zoomNode = null;
		}
	};
	var largeZoom = function (tapCount)
	{
		if (tapCount == 1)
		{
			if (slider.large == false)
			{
				doubleTap();
			}
			
		}
		else if (tapCount == 2)
		{
			zoomTap();
		}
	};
	var zoomTap = function ()
	{
		var zNode = slider.zoomNode;
		trans(zNode, null, "width 250ms ease-in");
		if (slider.large == false)
		{
			slider.large = true;
			zNode.style.width = (zoomScale * zNode.clientWidth) + "px";
		}
		else
		{
			slider.large = false;
			zNode.style.width = window.innerWidth + "px";
		}
	};
	var revertSlider = function ()
	{
		slider.style['border-color'] = "#353535";
		slider.style['background-color'] = "#353535";
		slider.lastChild.display = "none";
		if (slider.x == 0)
		{
			revertStateReset(slider);
		}
		else
		{
			revertStateReset(slider);
			trans(slider,
				function (event) {
					slider.animating = false;
				},
				"-webkit-transform 250ms ease-in",
				"translate3d(0,0,0) rotate(0deg)"
			);
			slider.animating = true;
		}
	};
	var upCallback = function ()
	{
		toggleClass.apply(slider,['super_card', 'off']);
		slider.supering = false;
		if (slider.animating == false)
		{
			if (slider.sliding == true)
			{
				if (Math.abs(slider.x) < slideThreshold)
				{
					revertSlider();
				}
				else if (slider.x > slideThreshold)
				{
					swipeSlider("right");
				}
				else if (slider.x < -slideThreshold)
				{
					swipeSlider("left");
				}
			}
			else if (slider.verticaling == true && slider.expanded == true)
			{
				slider.verticaling = false;
				slider.sliding = false;
				return true;
			}
		}
		slider.verticaling = false;
		slider.sliding = false;
	};
	var swipeSlider = function (direction, voteAlternative, pixelsPerSecond)
	{
		var activeCard = data[Math.max(0, cardIndex-3)];
		var translateQuantity = 600, rotateQuantity = 60,
			verticalQuantity = 0;
		var isUp = direction == "right";
		var voteDir = isUp ? "up" : "down";
		var transitionDistance = translateQuantity - slider.x;
		var transitionDuration = pixelsPerSecond ? (transitionDistance / pixelsPerSecond) : 250;
		if (slider.supering == true)
		{
			verticalQuantity = -500;
		}
		if (!isUp)
		{
			translateQuantity = -translateQuantity;
			rotateQuantity = -rotateQuantity;
			verticalQuantity = -verticalQuantity;
		}
		trans(slider,
			function () {
				slider.animating = false;
				gesture.unlisten(slider.parentNode);
				slideContainer.removeChild(slider.parentNode);
				buildCard(0);
				slideContainer.children[0].style.zIndex = 2;
				if (slideContainer.children[1])
					slideContainer.children[1].style.zIndex = 1;
				if (voteAlternative) voteAlternative();
				else xhr("/api/votes/" + voteDir + "/" + activeCard.id
					+ "/tag/" + current_tag, "POST");
			},
			"-webkit-transform " + Math.abs(transitionDuration) + "ms",
			"translate3d(" + translateQuantity + "px," + verticalQuantity
				+ "px,0) rotate(" + rotateQuantity + "deg)");
		slider.animating = true;

		// history slider
		activeCard.total_votes += 1;
		activeCard[voteDir + "_votes"] += 1;
		activeCard.user_stats.voted = true;
		activeCard.user_stats.tag_voted = current_tag;
		activeCard.user_stats.vote = voteDir;
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
	var swipeCallback = function (direction, distance, dx, dy, pixelsPerSecond)
	{
		if (slider.animating)
			return;
		if (direction == "left" || direction == "right")
			swipeSlider(direction, null, pixelsPerSecond);
		else if (slider.expanded)
			return true;
	};
	var dragCallback = function (direction, distance, dx, dy)
	{
		if (slider.animating == false)
		{
			if (slider.expanded == true && 
				(direction == "up" || direction == "down"))
			{
				if (slider.sliding == false)
				{
					slider.verticaling = true;
				}
				return true;
			}
			else 
			{
				if (slider.verticaling == false)
				{
					 slider.sliding = true;
					 slider.x += dx;
					if ( slider.x > 0)
					{
						if (slider.supering == true)
						{
							slider.style['background-color'] = 'green';
						}
						slider.style['border-color'] = 'green';
					}
					else if ( slider.x < 0)
					{
						if (slider.supering == true)
						{
							slider.style['background-color'] = '#C90016';
						}
						slider.style['border-color'] = '#C90016';
					}
					slider.style['-webkit-transform'] = 
						"translate3d(" + ( slider.x * translationScale) + "px,0,0) rotate(" + ( slider.x * rotationScale) + "deg)";
				}
			}
		}
	};
	var tapCallback = function (tapCount)
	{
		[expandCard, doubleTap][tapCount-1]();
	};
	var holdCallback = function (duration) {
		if (duration == 3000)
		{
			slider.supering = true;
			toggleClass.apply(slider, ['super_card', 'on']);
		}
	};
	var buildCard = function (zIndex)
	{
		if (slideContainer.firstChild && slideContainer.firstChild.throbbing) {
			slider = slideContainer.firstChild.firstChild;
			return populateSlider(false, slider.firstChild);
		}
		if (slideContainer.lastChild && slideContainer.lastChild.throbbing) {
			slider = slideContainer.firstChild.firstChild;
			return;
		}
		if (data.length <= cardIndex) {
			cardIndex += 1;
			var c_wrapper = document.createElement("div");
			c_wrapper.className = "card-wrapper";
			var c_container = document.createElement("div");
			c_container.className = "card-container center-label";
			var msg = document.createElement("div");
			msg.innerHTML = "Searching for more cards in " + current_tag + " feed...";
			var img = document.createElement("img");
			img.src = "/img/throbber.gif";
			c_container.appendChild(msg);
			c_container.appendChild(img);
			c_wrapper.appendChild(c_container);
			c_wrapper.throbbing = true;
			slideContainer.appendChild(c_wrapper);
			slider = slideContainer.firstChild.firstChild;
			if (slideContainer.childNodes.length == 1)
				populateSlider(false, slider.firstChild);
			return;
		}
		var imageContainer, iconLine, textContainer, picTags, fullscreenButton, truncatedTitle, card;
		var c = data[cardIndex];
		var cardTemplate = "<div class='card-wrapper'><div class='card-container' style='z-index:" + zIndex + ";'><div class='image-container expand-animation'><img src='" + image.get(c, window.innerWidth - 40) + "'></div><div class='icon-line'><img class='source-icon' src='/img/" + (c.source || ((c.tags[0] == null || c.tags[0] == "imgurhot") ? "imgur" : "reddit")) + "_icon.png'><span class='tag-callout pointer'><img src='/img/trending_icon_blue.png'>&nbsp;#" + c.tags[0] + "</span></div><div class='text-container'><p>" + c.caption + "</p></div><div class='pictags'></div><div class='expand-button'><img src='img/down_arrow.png'></div><div class='super_label'>SUPER VOTE</div></div></div>";
		var formatter = document.createElement('div');
		formattingContainer.appendChild(formatter);
		formatter.innerHTML = cardTemplate;
		imageContainer = formatter.children[0].children[0].children[0];
		iconLine = formatter.children[0].children[0].children[1];
		textContainer = formatter.children[0].children[0].children[2];
		picTags = formatter.children[0].children[0].children[3];
		fullscreenButton = formatter.children[0].children[0].children[4];
		gesture.listen("up", iconLine.children[1], function() {
			viewTag(c.tags[0], true);
		});
		c.tags.forEach(function(tag) {
			var p = document.createElement("span");
			p.innerHTML = "#" + tag;
			gesture.listen("up", p, function() {
				viewTag(tag, true);
			});
			picTags.appendChild(p);
		});
		imageContainer.children[0].onload = function () {
			card = formatter.firstChild.firstChild;
			setStartState(card);
			if (imageContainer.children[0].clientHeight + textContainer.clientHeight
				+ /* picTags */ 10 + /* icon bar */ 10 + /* chevron and border*/ 10 < maxCardHeight)
			{
				imageContainer.classList.remove("expand-animation");
				fullscreenButton.className += ' hider';
				card.compressing = false;
			}
			else
			{
				truncatedTitle = data[cardIndex].caption.trunc(30);
				truncatedTitle = "<p>" + truncatedTitle + "</p>";
				textContainer.innerHTML = truncatedTitle;
				picTags.className += ' hider';
				card.compressing = true;
			}
			initCardGestures.call(card.parentNode);
			slideContainer.appendChild(card.parentNode);
			formattingContainer.removeChild(formatter);
			slider = slideContainer.children[0].children[0];
			++cardIndex;

			if (data.length == cardIndex + buffer_minimum)
				populateSlider(true);

			if (zIndex)
				buildCard(zIndex - 1);
			else if (getOrientation() == "landscape" && window.innerHeight < 700)
				expandCard(true);
		};
	};
	var initCardGestures = function ()
	{
		gesture.listen("swipe", this, swipeCallback);
		gesture.listen("up", this, upCallback);
		gesture.listen("tap", this, tapCallback);
		gesture.listen("drag", this, dragCallback);
		gesture.listen("hold", this, holdCallback);
		gesture.listen("down", this, function(){return true;});
	};
	var expandCard = function (force)
	{
		if (slider && (slider.compressing || force))
		{
			slider.compressing = false;
			slider.expanded = true;
			slider.children[0].className += " expanded";
			slider.children[2].innerHTML = "<p>" + data[cardIndex-3].caption + "</p>";
			slider.children[3].style.visibility = "visible";
			slider.children[4].style.visibility = "hidden";
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
	setResizeCb(function() {
		slideContainer.innerHTML = "";
		cardIndex = Math.max(0, cardIndex - 3);
		data && buildCard(2);
	});
	populateSlider();
};
