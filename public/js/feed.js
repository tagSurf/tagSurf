onload = function ()
{
	populateNavbar();

	// defined in util for autocomplete
	// integration with other sliding elements
	tinput = document.getElementById("tag-input");
	current_tag = tinput.value
		= document.location.hash.slice(1) || "trending";
	inputContainer = document.getElementById("input-container");
	scrollContainer = document.getElementById('scroll-container');
	slideContainer = document.getElementById('slider');

	var data, buffer_minimum = 5, known_keys = {},
		staticHash = document.getElementById("static-hash"),
		staticTrending = document.getElementById("static-trending");
	var refreshCards = function(failMsgNode, zIndex) {
		cardIndex = 0;
		if (failMsgNode && data.length == 0) {
			failMsgNode.innerHTML = "No more cards in <br>#" + current_tag + " feed";
			failMsgNode.parentNode.removeChild(failMsgNode.nextSibling);
		} else {
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
		if (!update && !failMsgNode)
		{
			slideContainer.innerHTML = "";
			scrollContainer.style.opacity = 0;
			throbber.on();
		}
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
	aclist = document.getElementById("autocomplete");
	var viewTag = function(tagName, insertCurrent) {
		closeAutoComplete(tagName, !!insertCurrent);
		if (tagName != current_tag) {
			current_tag = tagName;
			known_keys = {};
			populateSlider(null, null, insertCurrent ? slider.card : null);
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
	gesture.listen("down", tinput, returnTrue);
	gesture.listen("up", tinput, function(e) {
		if (!acviewing) {
			acviewing = true;
			tinput.value = "";
			mod({
				className: "tagline",
				show: true
			});
			modal.halfOn(function() {
				if (tinput.active)
					viewTag(current_tag);
			}, inputContainer);
			slideContainer.className = "noinput";
			aclist.className = "autocomplete-open";
			trans(aclist, function() {
				tinput.active = true;
				tinput.focus();
			});
			return true;
		}
	});
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
	var rotationScale = 0.075;
	var translationScale = 1.35;
	var slideThreshold = 60;
	addCss({
		".expand-animation": function() {
			return "max-height: " + parseInt(maxCardHeight + 60 - window.innerHeight * .04) + "px";
		},
		".card-container": function() {
			return "min-height: " + (maxCardHeight + 140) + "px";
		},
		".raw_wrapper, .zoom_wrapper, #scroll-container": function() {
			return "height: " + (window.innerHeight - 50) + "px";
		},
		".image-container img": function () {
			return "width: " + parseInt(window.innerWidth - (14 + .05 * window.innerWidth)) + "px;";
		}
	});
	var formattingContainer = document.getElementById('formatter');
	var slider;
	var setStartState = function (node)
	{
		node.x = 0;
		node.sliding = false;
		node.verticaling = false;
		node.supering = false;
		node.animating = false;
		node.compressing = true;
		node.expanded = false;
		node.card = data[cardIndex];
	};
	var revertStateReset = function (node)
	{
		node.x = 0;
		node.sliding = false;
		node.verticaling = false;
		node.supering = false;
		node.animating = false;
	};
	var callZoomModal = function ()
	{
		var modalCallback = function ()
		{
			modal.zoomOut();
			modal.backOff();	
		};
		modal.zoomIn(slider.card, modalCallback);
		modal.backOn(modalCallback);
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
				"swiping",
				"translate3d(0,0,0) rotate(0deg)"
			);
			slider.animating = true;
		}
	};
	var upCallback = function (androidSoftUp)
	{
		toggleClass.apply(slider,['super_card', 'off']);
		slider.supering = false;
		if (slider.animating == false)
		{
			if (slider.sliding == true)
			{
				if (androidSoftUp || Math.abs(slider.x) < slideThreshold)
				{
					revertSlider();
				}
				else if (slider.x > slideThreshold)
				{
					swipeSlider("right", null, 100);
				}
				else if (slider.x < -slideThreshold)
				{
					swipeSlider("left", null, 100);
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
		var _slider = slider;
		var activeCard = slider.card;
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
		trans(_slider,
			function () {
				_slider.animating = false;
				gesture.unlisten(_slider.parentNode);
				slideContainer.removeChild(_slider.parentNode);
				buildCard(0);
				slideContainer.children[0].style.zIndex = 2;
				if (slideContainer.children[1])
					slideContainer.children[1].style.zIndex = 1;
				if (voteAlternative) voteAlternative();
				else xhr("/api/votes/" + voteDir + "/" + activeCard.id
					+ "/tag/" + current_tag, "POST");
			},
			"swiping",
			"translate3d(" + translateQuantity + "px," + verticalQuantity
				+ "px,0) rotate(" + rotateQuantity + "deg)");
		slider.animating = true;

		setSlider(slider.parentNode.nextSibling.firstChild);
		setCurrentMedia(slider.card);
		// history slider
		activeCard.total_votes += 1;
		activeCard[voteDir + "_votes"] += 1;
		activeCard.user_stats.voted = true;
		activeCard.user_stats.tag_voted = current_tag;
		activeCard.user_stats.vote = voteDir;
		// removed history slider
//		addHistoryItem(activeCard);
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
			swipeSlider(direction, null, 700);
		else if (slider.expanded)
			return true;
	};
	var dragCallback = function (direction, distance, dx, dy)
	{
		var atBottom = (scrollContainer.scrollHeight - scrollContainer.scrollTop 
			=== scrollContainer.clientHeight),
		atTop = (scrollContainer.scrollTop === 0);
		if (slider.animating == false)
		{
			if (slider.expanded == true && 
				(direction == "up" || direction == "down"))
			{
				if (slider.sliding == false)
				{
					slider.verticaling = true;
				}
				if ((atTop && direction == "down") ||
					(atBottom && direction == "up"))
				{
					return false;
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
		if (tapCount == 1)
		{
			if (slider.compressing == false)
			{
				callZoomModal();
			}
			else if (slider.expanded == false)
			{
				expandCard();
			}
		}
	};
	var holdCallback = function (duration) {
		if (duration == 3000)
		{
			slider.supering = true;
			toggleClass.apply(slider, ['super_card', 'on']);
		}
	};
	var tagCard = function(tag, picTags) {
		var p = document.createElement("span");
		p.innerHTML = "#" + tag;
		gesture.listen("down", p, function() {
			p.classList.add("active-pictag");
		});
		gesture.listen("up", p, function() {
			p.classList.remove("active-pictag");
			viewTag(tag, true);
		});
		picTags.appendChild(p);
	};
	var expandTimeout;
	var setSlider = function(s) {
		slider = s || slideContainer.firstChild.firstChild;
		setCurrentMedia(slider.card);
		if (expandTimeout) {
			clearTimeout(expandTimeout);
			expandTimeout = null;
		}
		expandTimeout = setTimeout(expandCard, 1500);
	};
	var dataThrobTest = function ()
	{
		var c_wrapper, c_container, msg, img;
		if (slideContainer.firstChild && slideContainer.firstChild.throbbing) {
			setSlider();
			return populateSlider(false, slider.firstChild);
		}
		if (slideContainer.lastChild && slideContainer.lastChild.throbbing) {
			setSlider();
			return;
		}
		if (data.length <= cardIndex) {
			cardIndex += 1;
			c_wrapper = document.createElement("div");
			c_wrapper.className = "card-wrapper";
			c_container = document.createElement("div");
			c_container.className = "card-container center-label";
			msg = document.createElement("div");
			msg.innerHTML = "Searching for more cards in <br>#" + current_tag + " feed...";
			img = document.createElement("img");
			img.src = "/img/throbber.gif";
			c_container.appendChild(msg);
			c_container.appendChild(img);
			c_wrapper.appendChild(c_container);
			c_wrapper.throbbing = true;
			slideContainer.appendChild(c_wrapper);
			setSlider();
			throbber.off();
			scrollContainer.style.opacity = 1;
			if (slideContainer.childNodes.length == 1)
				populateSlider(false, slider.firstChild);
			return;
		}
		return true;
	};
	var formatCardContents = function (node, imageData)
	{
		var card = node || slider, imageContainer = card.firstChild,
			fullscreenButton = card.children[4], truncatedTitle,
			picTags = card.children[3], textContainer = card.children[2],
			iconLine = card.children[1], targetHeight = imageData ? 
			imageData.height * (window.innerWidth - 40) / imageData.width :
			card.firstChild.scrollHeight;
		if (node && (targetHeight + textContainer.scrollHeight 
			+ picTags.scrollHeight + iconLine.scrollHeight 
			< (maxCardHeight + 80)))
		{
			imageContainer.classList.remove("expand-animation");
			fullscreenButton.className += ' hidden';
			card.compressing = false;
		}
		else
		{
			if (node)
			{
				truncatedTitle = card.card.caption.trunc(25);
				truncatedTitle = "<p>" + truncatedTitle + "</p>";
				textContainer.innerHTML = truncatedTitle;
				picTags.className += ' hidden';
				card.compressing = true;
			}
			else
			{
				card.compressing = false;
				card.expanded = true;
			}
		}
	};
	var buildCard = function (zIndex)
	{
		if (!dataThrobTest())
			return;
		var imageContainer, iconLine, textContainer, picTags, 
			fullscreenButton, truncatedTitle, card, 
			targetHeight, imageData, c = data[cardIndex];
		var cardTemplate = "<div class='card-wrapper'><div class='card-container' style='z-index:" + zIndex + ";'><div class='image-container expand-animation'><img src='" + image.get(c, window.innerWidth - 40).url + "'></div><div class='icon-line'><img class='source-icon' src='/img/" + (c.source || ((c.tags[0] == null || c.tags[0] == "imgurhot") ? "imgur" : "reddit")) + "_icon.png'><span class='tag-callout pointer'><img src='/img/trending_icon_blue.png'>&nbsp;#" + c.tags[0] + "</span></div><div class='text-container'><p>" + c.caption + "</p></div><div id='pictags" + c.id + "' class='pictags'></div><div class='expand-button'><img src='img/down_arrow.png'></div><div class='super_label'>SUPER VOTE</div></div></div>";
		var formatter = document.createElement('div');
		formattingContainer.appendChild(formatter);
		formatter.innerHTML = cardTemplate;
		imageContainer = formatter.children[0].children[0].children[0];
		iconLine = formatter.children[0].children[0].children[1];
		textContainer = formatter.children[0].children[0].children[2];
		picTags = formatter.children[0].children[0].children[3];
		fullscreenButton = formatter.children[0].children[0].children[4];
		if (current_tag == "trending") {
			gesture.listen("down", iconLine.children[1], function() {
				iconLine.children[1].classList.add("active-tag-callout");
				iconLine.children[1].firstChild.src = "/img/trending_icon_gray.png";
			});
			gesture.listen("up", iconLine.children[1], function() {
				iconLine.children[1].classList.remove("active-tag-callout");
				iconLine.children[1].firstChild.src = "/img/trending_icon_blue.png";
				viewTag(c.tags[0], true);
			});
		} else
			iconLine.children[1].style.display = "none";
		c.tags_v2.sort(function(a, b) {
			var aName = Object.keys(a)[0];
			var bName = Object.keys(b)[0];
			return a[aName].score < b[bName].score;
		});
		c.tags_v2.forEach(function(tagobj) {
			var t = Object.keys(tagobj)[0];
			t && tagCard(t, picTags);
		});
		card = formatter.firstChild.firstChild;
		setStartState(card);
		imageData = image.get(card.card);
		formatCardContents(card, imageData);
		initCardGestures.call(card.parentNode);
		slideContainer.appendChild(card.parentNode);
		formattingContainer.removeChild(formatter);
		setSlider();
		if (slider == card)
		{
			imageContainer.firstChild.onload = function ()
			{
				throbber.off();
				scrollContainer.style.opacity = 1;
			};
		}
		imageContainer.firstChild.onerror = function() {
			slideContainer.removeChild(slider.parentNode);
			if (slider == card) {
				throbber.off();
				scrollContainer.style.opacity = 1;
			}
			buildCard();
		};
		++cardIndex;
		if (data.length == cardIndex + buffer_minimum)
			populateSlider(true);
		if (zIndex)
			buildCard(zIndex - 1);
		else if (getOrientation() == "landscape" && window.innerHeight < 700)
			expandCard(true);
	};
	var downCallback = function ()
	{
		if (slider.style["-webkit-transform"] == "")
		{
			slider.style["-webkit-transform"] = "tranform3d(0,0,0) rotate(0)";
		}
		return true;
	};
	var initCardGestures = function ()
	{
		gesture.listen("swipe", this, swipeCallback);
		gesture.listen("up", this, upCallback);
		gesture.listen("tap", this, tapCallback);
		gesture.listen("drag", this, dragCallback);
		gesture.listen("hold", this, holdCallback);
		gesture.listen("down", this, downCallback);
	};
	var expandCard = function (force)
	{
		if (slider && (slider.compressing || force))
		{
			slider.compressing = false;
			slider.expanded = true;
			if (slider.children[0].className.indexOf("expanded") == -1)
				slider.children[0].className += " expanded";
			slider.children[2].innerHTML = "<p>" + slider.card.caption + "</p>";
			toggleClass.call(slider.children[3], "hidden");
			toggleClass.call(slider.children[4], "hidden");
		}
	};
	setAddCallback(function(tag) {
		var objwrap = {};
		objwrap[tag] = {
			total_votes: 0,
			down_votes: 0,
			up_votes: 0,
			score: 0,
			is_trending: false,
			trend: "up"
		};
		slider.card.tags_v2.push(objwrap);
		tagCard(tag, document.getElementById("pictags" + slider.card.id));
		formatCardContents();
	});
	setStarCallback(function() {
		if (modal.zoom.zoomed) {
			if (modal.zoom.large)
				modal.callZoom(2);
			modal.callZoom(1);
		}
		setFavIcon(true);
		xhr("/api/favorites/" + slider.card.id, "POST", function() {
			swipeSlider("right", function () {
				setFavIcon(false);
			});
		});
	});
	setResizeCb(function() {
		slideContainer.innerHTML = "";
		cardIndex = Math.max(0, cardIndex - 3);
		if (data) {
			buildCard(2);
			expandCard(true);
		}
	});
	populateSlider();
};
