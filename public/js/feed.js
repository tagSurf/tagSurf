var castVote = function(card) {
	xhr("/api/votes/" + card.user_stats.vote + "/" + card.id
		+ "/tag/" + card.user_stats.tag_voted, "POST", null, null);
};


onload = function ()
{
	analytics.track('Begin Pageload');
	populateNavbar();
	if (isAuthorized() && (document.location.href.indexOf('share') != -1)) {
		analytics.track('Redirected to Authed Feed');
		window.location = "http://" +
			document.location.host + '/feed#' +
			window.location.pathname.replace('/share/','').replace('/','~');
	} 
	// defined in util for autocomplete
	// integration with other sliding elements
	tinput = document.getElementById("tag-input");
	current_tag = tinput.value = document.location.hash.slice(1).split("~")[0]
		|| document.location.pathname.split("/")[2] || "trending";
	inputContainer = document.getElementById("input-container");
	scrollContainer = document.getElementById('scroll-container');
	slideContainer = document.getElementById('slider');
	reminderTimeout = null;

	//modal formatting for desktop
 	if (!isMobile() && !isTablet() && !isNarrow())
	 	addCss({
	 		".modal": function() {
	 			return "width: 75%; margin: auto;";
	 		},
			"#slide-down-menu li:hover": function() {
				return "background-color: #00aeef;";
			},
			"#slide-down-menu li:hover a": function() {
				return "color: white;";
			},
			"#slide-down-menu li:hover div img:nth-child(2)": function() {
				return "display: inline;";
			},
			"#slide-down-menu li:hover div img:first-child": function() {
				return "display: none;";
			},
			".autocomplete div div:hover": function() {
				return "color: white; background-color: #00aeef;";
			}
	 	});
	var reminderContainer = document.createElement('div');
	var forgetReminder = function() {
		if (reminderTimeout) {
			document.body.removeChild(reminderContainer);
			clearTimeout(reminderTimeout);
			reminderTimeout = null;
		}
	};
	var closeReminder = function (direction)
	{
		forgetReminder();
		if (reminderContainer.isOn && direction != "up" && direction != "down")
		{
			reminderContainer.isOn = false;
			reminderContainer.style.opacity = 0;			
			trans(reminderContainer, function() {
				reminderContainer.parentNode.removeChild(reminderContainer);
				reminderTimeout = null;
			});
			analytics.track('Close Swipe Reminder');
		}
	};
	var setReminderTimeout = function ()
	{
		var closeContainer = document.createElement('div'),
			close = document.createElement('img'),
			leftImage = new Image(), rightImage = new Image();
		reminderContainer.id = "reminder-container";
		close.className = "reminder-close";
		close.src = "http://assets.tagsurf.co/img/Close.png";
		closeContainer.appendChild(close);
		reminderContainer.appendChild(closeContainer);
		leftImage.id = "reminder-left";
		rightImage.id = "reminder-right";
		if(isDesktop()) {
			var closeInstructions = new Image();
			closeInstructions.className = "close-instructions block";
			closeInstructions.src="http://assets.tagsurf.co/img/clearscreen.png";
			reminderContainer.appendChild(closeInstructions);
			rightImage.src = "http://assets.tagsurf.co/img/reminder_right_desktop.png";
			leftImage.src = "http://assets.tagsurf.co/img/reminder_left_desktop.png";
			addCss({
				"#reminder-left": function() {
					return "width: 18%; top: 20%";
				},
				"#reminder-right": function() {
					return "width: 18%";
				}
			});
		}
		else {
			leftImage.src = "http://assets.tagsurf.co/img/reminder_left_mobile.png";	
			rightImage.src = "http://assets.tagsurf.co/img/reminder_right_mobile.png";
		}
		reminderContainer.appendChild(leftImage);
		reminderContainer.appendChild(rightImage);
		gesture.listen("drag", reminderContainer, function (direction) {
			if (direction != "left" && direction != "right")
			{
				return true;
			}
		});
		gesture.listen("down", reminderContainer, returnTrue);
		gesture.listen('down', closeContainer, closeReminder);
		gesture.listen("tap", reminderContainer, closeReminder);
		gesture.listen("swipe", reminderContainer, closeReminder);
		document.body.appendChild(reminderContainer);
		if(DEBUG)
			return;
		reminderTimeout = setTimeout(function () {
			reminderContainer.isOn = true;
			reminderContainer.style.visibility = "visible";
			reminderContainer.style.zIndex = "100";
			reminderContainer.style.opacity = 1;
			if(isDesktop())
				analytics.track('Seen Desktop Swipe Reminder');
			else
				analytics.track('Seen Mobile Swipe Reminder');
		}, 20000);
	};
	
	var scrollCallback = function (event)
	{
		var trueScrollTop = scrollContainer.scrollTop ? scrollContainer.scrollTop
			: (scrollContainer.yDrag ? -scrollContainer.yDrag : 0);
		slider.style['transform-origin'] = "center " + trueScrollTop + 'px';
		slider.style['-webkit-transform-origin'] = "center " + trueScrollTop + 'px';
		slider.lastChild.previousSibling.style.top = (50 + trueScrollTop) + 'px';
	};
	drag.makeDraggable(scrollContainer, {
		constraint: "horizontal",
		scroll: scrollCallback
	});

	var data, buffer_minimum = 5, known_keys = {},
		staticHash = document.getElementById("static-hash"),
		staticTrending = document.getElementById("static-trending");
	var refreshCards = function(failMsgNode, zIndex) {
		cardIndex = 0;
		if (failMsgNode && data.length == 0) {
			var trendingBtn = document.createElement('div'),
				orMsg = document.createElement('div'),
				surfATagMsg = document.createElement('div'),
				tagSuggestions = document.createElement('div'),
				numberOfTags = 5;
			trendingBtn.className = 'trending-returnbtn pointer';
			trendingBtn.innerHTML = "<img src='http://assets.tagsurf.co/img/trending_icon_blue.png'>Return to <span class='blue'>#trending</span>";	
			failMsgNode.innerHTML = "<div class='fail-msg'>No more cards in <br>#" + current_tag + " feed...</div>";
			orMsg.className = "fail-msg";
			orMsg.id = "or-msg";
			orMsg.innerHTML = "or";
			tagSuggestions.className = "taglist";
			surfATagMsg.className = "fail-msg";
			surfATagMsg.id = "surf-msg";
			surfATagMsg.innerHTML = "Surf a popular tag";
			gesture.listen("down", trendingBtn, function() {
				trendingBtn.classList.add("active-trending-returnbtn");
				trendingBtn.firstChild.src = "http://assets.tagsurf.co/img/trending_icon_gray.png";
			});
			gesture.listen("up", trendingBtn, function() {
				trendingBtn.classList.remove("active-trending-returnbtn");
				trendingBtn.firstChild.src = "http://assets.tagsurf.co/img/trending_icon_blue.png";
				if(isAuthorized())
					window.location = "http://" + document.location.host + '/feed';
				else
					autocomplete.tapTag("trending", "autocomplete", false);
			});
			for(var i = 0; i < numberOfTags; i++) {
				if (autocomplete.data[i]["name"] == "trending") {
					++numberOfTags;
					continue;
				}
				else {
					tagCard(autocomplete.data[i]["name"], tagSuggestions);
				}
			}
			failMsgNode.parentNode.removeChild(failMsgNode.nextSibling);
			failMsgNode.parentNode.appendChild(trendingBtn);
			failMsgNode.parentNode.appendChild(orMsg);
			failMsgNode.parentNode.appendChild(surfATagMsg);
			failMsgNode.parentNode.appendChild(tagSuggestions);
			analytics.track('Seen End-Of-Feed Card', {
				surfing: current_tag
			});
		} 
		else {
			slideContainer.innerHTML = "";
			buildCard(zIndex);
		}
	};
	var popData = function(rdata, firstCard) {
		var i, starters = [], others = [], preloads = [];

		if (!isAuthorized())
			preloads = rdata;
		else {
			if (firstCard) known_keys[firstCard.id] = true;
			for (i = 0; i < rdata.length; i++) {
				if (!known_keys[rdata[i].id]) {
					var d = rdata[i];
					((!d.image.animated && starters.length < 3)
						? starters : others).push(d);
					known_keys[d.id] = true;
				}
			}
			for (i = 0; i < starters.length; i++) preloads.push(starters[i]);
			for (i = 0; i < others.length; i++) preloads.push(others[i]);
			if (firstCard) data.unshift(firstCard);
		}

		data = data.concat(preloads);
		return preloads;
	};
	var cardsToLoad = [];
	var preloadCards = function() {
		if (cardsToLoad.length) {
			image.load(cardsToLoad, window.innerWidth - 40);
			cardsToLoad = [];
		}
	};
	var shareSwap, shareOffset = 0;
	var dataPath = function(firstCard) {
		if (!isAuthorized()) {
			var p = "/api";
			if (shareSwap) {
				shareSwap = false;
				shareOffset = 0;
			}
			if (firstCard || current_tag
				!= document.location.pathname.split("/")[2])
				p += "/share/" + current_tag + "/" +
					(firstCard ? firstCard.id : 0);
			else
				p += document.location.pathname;
			return p + "/20/" + (shareOffset++ * 20);
		}
		return "/api/media/" + current_tag;
	};
	var populateSlider = function (update, failMsgNode, firstCard)
	{
		if (!update && !failMsgNode)
		{
			slideContainer.innerHTML = "";
			scrollContainer.style.opacity = 0;
			throbber.on();
		}
		xhr(dataPath(firstCard), null, function(response_data) {
			var rdata = response_data.data;
			if (update)
				cardsToLoad = cardsToLoad.concat(popData(rdata));
			else {
				data = [];
				cardsToLoad = cardsToLoad.concat(popData(rdata, firstCard).slice(3));
				refreshCards(failMsgNode, 2);
			}
		}, function(response, status) {
			if (status == 401){
				messageBox("Oops", response.errors + " <br><br><i>Control Safe Surf from Options</i>");
			}
			if (!update) {
				data = [];
				refreshCards(failMsgNode);
			}
		});
	};
	var firstPopulate = function() {
		var feed, id, pair, h = document.location.hash.slice(1);
		if (h.indexOf('~') != -1) {
			pair = h.split("~");
			feed = pair[0];
			id = pair[1];
		}
		if (id)
			xhr("/api/card/" + id, null, function(d) {
				populateSlider(false, null, d.data);
			}, populateSlider);
		else
			populateSlider();
	};

	// autocomplete stuff
	var autocompleteCbs = {
		tapCb: function(tagName, insertCurrent) {
			closeAutoComplete(tagName, !!insertCurrent);
			if (tagName != current_tag) {
				shareSwap = true;
				current_tag = tagName;
				known_keys = {};
				populateSlider(null, null, insertCurrent ? slider.card : null);
				analytics.track('Search for Tag', {
					tag: tagName
				});
			}
		},
		expandCb: function() {
			tinput.value = "";
			modal.halfOn(function() {
				if (tinput.active)
					autocomplete.tapTag(current_tag, "autocomplete");
			}, inputContainer);
			slideContainer.className = "noinput";
		},
		enterCb: function() {
			tinput.value ?
				autocomplete.tapTag(tinput.value, "autocomplete") :
				modal.callBack();
		}
	};
	autocomplete.register("autocomplete", tinput, autocompleteCbs);
	gesture.listen("tap", document.getElementById("search-input"),
		autocompleteCbs.enterCb);
	popTrending = function() { // var'red in util (global)
		slideNavMenu();
		autocompleteCbs.tapCb("trending");
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
			return "min-height: " + (maxCardHeight + 140) + "px; width: " + ((isMobile() || isTablet() || isNarrow()) ? "95" : "70") + "%;";
		},
		".raw-wrapper, .zoom-wrapper, #scroll-container, #scroll-container-container": function() {
			return "height: " + (window.innerHeight - 50) + "px";
		}
		// Why is this necessary? Setting width=100% in feed.css instead.
		//,
		// ".image-container img": function () {
		// 	return "width: " + parseInt(window.innerWidth - (14 + .05 * window.innerWidth)) + "px;";
		// }
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
	var revertSlider = function ()
	{
		if (slider.isContent) {
			var thumbContainer = slider.lastChild.previousSibling;
			slider.style['border-color'] = "#353535";
			slider.style['background-color'] = "#353535";
			slider.lastChild.display = "none";

			if (thumbContainer.firstChild.style.opacity > 0)
			{
				thumbContainer.firstChild.style.opacity = 0;
			}
			if (thumbContainer.lastChild.style.opacity > 0)
			{
				thumbContainer.lastChild.style.opacity = 0;
			}
		}
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
		if (modal.zoom.zoomed) return;
		toggleClass.apply(slider,['super-card', 'off']);
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
				if (scrollContainer.scrollTop)
					scrollContainer.scrollTop = 0;
				if (scrollContainer.yDrag)
				{
					scrollContainer.animating = true;
					trans(scrollContainer, 
						function(){ scrollContainer.animating = false},
						"-webkit-transform 200ms",
						"translate3d(0,0,0) rotate(0deg)");
				}
				slideContainer.children[0].style.zIndex = 2;
				if (slideContainer.children[1])
					slideContainer.children[1].style.zIndex = 1;
				if (activeCard.type == "content") {
					activeCard.total_votes += 1;
					activeCard[voteDir + "_votes"] += 1;
					activeCard.user_stats.voted = true;
					activeCard.user_stats.tag_voted = current_tag;
					activeCard.user_stats.vote = voteDir;
					if (!isAuthorized())
						shareVotes.push(activeCard);
					else if (voteAlternative)
						voteAlternative();
					else
						castVote(activeCard);
				}
				preloadCards();
			},
			"swiping",
			"translate3d(" + translateQuantity + "px," + verticalQuantity
				+ "px,0) rotate(" + rotateQuantity + "deg)");
		slider.animating = true;

		pushTags();
		setSlider(slider.parentNode.nextSibling.firstChild);
		setCurrentMedia(slider.card);
		// removed history slider
//		addHistoryItem(activeCard);
	};
	var keyInertia = 0;
	window.onkeydown = function(e) {
		keyInertia += 1;
		e = e || window.event;
		var code = e.keyCode || e.which;
		if (code == 38){
			//boundary checking
			scrollContainer.scrollTop -= (2 * keyInertia);
		}
		else if (code == 40){
			//boundary checking
			window.scrollBy(0,10);
			scrollContainer.scrollTop += (2 * keyInertia);
		}
	};
	window.onkeyup = function(e) {
		closeReminder("right");
		keyInertia = 0;
		e = e || window.event;
		var code = e.keyCode || e.which;
		if (code == 32){
			expandCard();
		}
		else if (code == 37){
			dragCallback("left", -3, -3);
			if (slider.card.id == 221281) {	
				analytics.track("Key Swipe Login Card", {
					direction: "left",
					surfing: current_tag
				});
			}
			else {
				analytics.track("Key Swipe", {
					card: slider.card.id,
					direction: "left",	
					surfing: current_tag
				});
				analytics.page({
					title: slider.card.id + " left",
					url: 'http://beta.tagsurf.co/feed#'+current_tag,
					path: "/feed#"+current_tag,
					referrer: 'http://beta.tagsurf.co/'
				});
			}
			swipeSlider("left");
			// slider id will change to next card 
			if (slider.card.id == 221281)
				analytics.track("Seen Login Card");
		}
		else if (code == 39) {
			dragCallback("right", 3, 3);
			if (slider.card.id == 221281) {
				analytics.track("Key Swipe Login Card", {
					direction: "right",
					surfing: current_tag
				});
			}
			else {
				analytics.track("Key Swipe", {
					card: slider.card.id,
					direction: "right",	
					surfing: current_tag
				});
				analytics.page({
					title: slider.card.id + " right",
					url: 'http://beta.tagsurf.co/feed#'+current_tag,
					path: "/feed#"+current_tag,
					referrer: 'http://beta.tagsurf.co/'
				});

			}
			swipeSlider("right");
			// slider id will change to next card 
			if (slider.card.id == 221281)
				analytics.track("Seen Login Card");
		}
	};
	var swipeCallback = function (direction, distance, dx, dy, pixelsPerSecond)
	{
		if (modal.zoom.zoomed) return;
		if (!slider.animating && (direction == "up" || direction == "down") && slider.expanded)
			gesture.triggerSwipe(scrollContainer, direction, distance, dx, dy, pixelsPerSecond);
		else if (!slider.animating && (direction == "left" || direction == "right")) {
			if (slider.isContent) {
				analytics.track("Swipe", {
					card: slider.card.id,
					direction: direction,	
					surfing: current_tag
				});
				analytics.page({
					title: slider.card.id + " " + direction,
					url: 'http://beta.tagsurf.co/feed#'+current_tag,
					path: "/feed#"+current_tag,
					referrer: 'http://beta.tagsurf.co/'
				});
			}
			else if (slider.card.id == 221281)
				analytics.track("Swipe Login Card", {
					direction: direction,
					surfing: current_tag
				});
			swipeSlider(direction, null, 700);
			// slider id will change to next card 
			if (slider.card.id == 221281)
				analytics.track("Seen Login Card");
		}
	};
	var dragCallback = function (direction, distance, dx, dy)
	{
		if (modal.zoom.zoomed) return;
		if (slider.animating == false)
		{
			if (slider.expanded == true && 
				(direction == "up" || direction == "down"))
			{
				if (slider.sliding == false)
					slider.verticaling = true;
				if (slider.sliding)
					return false;
				if (!isStockAndroid()) {
					var sc = scrollContainer, atTop = (sc.scrollTop === 0),
						atBottom = (sc.scrollHeight - sc.scrollTop === sc.clientHeight),
						goingUp = direction == "down";
					if ((atTop && goingUp) || (atBottom && !goingUp))
						return false;
				}
				return true;
			}
			else 
			{
				if (slider.verticaling == false)
				{
					var thumbContainer = slider.lastChild.previousSibling;
					slider.sliding = true;
					slider.x += dx;
					if (slider.isContent) {
						if ( slider.x > 0)
						{
							slider.style['border-color'] = "green";
							if (slider.supering == true)
							{
								slider.style['background-color'] = 'green';
							}
							if (thumbContainer.firstChild.style.opacity == 0)
							{
								thumbContainer.firstChild.style.opacity = 0.8;
							}
							if (thumbContainer.lastChild.style.opacity == .8)
							{
								thumbContainer.lastChild.style.opacity = 0;
							}
						}
						else if ( slider.x < 0)
						{
							slider.style['border-color'] = "#C90016";
							if (slider.supering == true)
							{
								slider.style['background-color'] = '#C90016';
							}
							if (thumbContainer.lastChild.style.opacity == 0)
							{
								thumbContainer.lastChild.style.opacity = .8;
							}
							if (thumbContainer.firstChild.style.opacity == .8)
							{
								thumbContainer.firstChild.style.opacity = 0;
							}
						}
					}
					slider.style['-webkit-transform'] = 
						"translate3d(" + ( slider.x * translationScale) + "px,0,0) rotate(" + ( slider.x * rotationScale) + "deg)";
				}
			}
		}
	};
	var tapCallback = function (tapCount)
	{
		if (modal.zoom.zoomed) return;
		if (tapCount == 1)
		{
			if (slider.compressing == false)
			{
				modal.zoomIn(slider.card);
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
			toggleClass.apply(slider, ['super-card', 'on']);
		}
	};
	var isMine = function(tag) {
		if (!slider.card) return;
		var tobjs = slider.card.tags_v2;
		for (var i = 0; i < tobjs.length; i++)
			if (Object.keys(tobjs[i])[0] == tag)
				return tobjs[i][tag].user_owned;
	};
	var tagCard = function(tag, picTags) {
		var ismine = slider && isMine(tag);
		var p = document.createElement("div");
		p.className = "pictagcell";
		var tNode = document.createElement("div");
		tNode.className = "smallpadded tcell";
		tNode.innerHTML = "#" + tag;
		p.appendChild(tNode);
		if (ismine) {
			var delNode = document.createElement("div");
			delNode.className = "smallpadded delNode tcell";
			delNode.innerHTML = "x";
			p.appendChild(delNode);
		}
		gesture.listen("down", p, function() {
			p.classList.add("active-pictag");
		});
		gesture.listen("up", p, function() {
			p.classList.remove("active-pictag");
			if (ismine) {
				rmTag(tag);
				picTags.removeChild(p);
			} else
				autocomplete.tapTag(tag, "autocomplete", false);
		});
		picTags.appendChild(p);
	};
	var expandTimeout;
	var setSlider = function(s) {
		slider = s || slideContainer.firstChild.firstChild;
		setCurrentMedia(slider.card, forgetReminder, function() { //panic btn callback
			swipeSlider("left");
			analytics.track('Report Inappropriate Content', {
				card: panic.data.id,
				surfing: current_tag
			});
			messageBox("Thanks for the Report", "An admin will review that card before anyone sees it again.", "Ok", null, true);
		});
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
			img.src = "http://assets.tagsurf.co/img/throbber.gif";
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
		if (node && node.card.image.animated && !imageContainer.firstChild.classList.contains('translate-z'))
		{
			imageContainer.firstChild.classList.add('translate-z');
		}
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
	var firstCardLoaded = false;
	var buildContentCard = function(c, zIndex) {
		var imageContainer, iconLine, textContainer, picTags, fullscreenButton,
			truncatedTitle, card, formatter = document.createElement('div'),
			cardTemplate = "<div class='card-wrapper'><div class='card-container' style='z-index:" + zIndex + ";'><div class='image-container expand-animation'><img" + (firstCardLoaded ? (" src='" + image.get(c, window.innerWidth - 40).url + "'") : "") + "></div><div class='icon-line'><img class='source-icon' src='http://assets.tagsurf.co/img/" + (c.source || ((c.tags[0] == null || c.tags[0] == "imgurhot") ? "imgur" : "reddit")) + "_icon.png'><span class='tag-callout pointer'><img src='http://assets.tagsurf.co/img/trending_icon_blue.png'>&nbsp;#" + c.tags[0] + "</span></div><div class='text-container'><p>" + c.caption + "</p></div><div id='pictags" + c.id + "' class='pictags'></div><div class='expand-button'><img src='http://assets.tagsurf.co/img/down_arrow.png'></div><div id='thumb-vote-container'><img class='thumb-up' src='http://assets.tagsurf.co/img/thumbsup.png'><img class='thumb-down' src='http://assets.tagsurf.co/img/thumbsdown.png'></div><div class='super-label'>SUPER VOTE</div></div></div>";
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
				iconLine.children[1].firstChild.src = "http://assets.tagsurf.co/img/trending_icon_gray.png";
			});
			gesture.listen("up", iconLine.children[1], function() {
				iconLine.children[1].classList.remove("active-tag-callout");
				iconLine.children[1].firstChild.src = "http://http://assets.tagsurf.co/img/trending_icon_blue.png";
				autocomplete.tapTag(c.tags[0], "autocomplete", false);
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
			t && t != "trending" && tagCard(t, picTags);
		});
		var card = initCard(formatter);
		card.isContent = true;
		card.setSource = function() {
			imageContainer.firstChild.src = image.get(c, window.innerWidth - 40).url;
			console.log("Source Set to: ", imageContainer.firstChild.src, " for card ", card.id, " with data ", card);
		};
		formatCardContents(card, image.get(card.card));
		console.log("Reached if test for slider = ", slider, " card = ", card);
		if (slider == card) {
			console.log("Slider = card in test ", card);
			slider.setSource();
			firstCardLoaded = false;
			imageContainer.firstChild.onload = function() {
				console.log("Finished load of first card");
				firstCardLoaded = true;
				slider.parentNode.nextSibling.firstChild.setSource();
				slider.parentNode.nextSibling.nextSibling.firstChild.setSource();
				throbber.off();
				scrollContainer.style.opacity = 1;
				analytics.track('Finished Pageload');
				preloadCards();
			};
		}
		imageContainer.firstChild.onerror = function() {
			slideContainer.removeChild(card.parentNode);
			setSlider();
			console.log("Error event ", card);
			if (slider == card) {
				throbber.off();
  				scrollContainer.style.opacity = 1;
 				console.log("Slider == card in error... slider = ", slider, " card = ", card);
			}
			cardIndex -= 2;
			buildCard(1);
		};
	};
	var focusInput = function (input)
	{
		gesture.listen('down', input, function(){
			input.focus();
		});
	};
	var blurLoginInputs = function ()
	{
		var listInputs = document.forms[0].getElementsByClassName('su-input'),
			listLength = listInputs.length, index = 0;
		for (;index < listLength; ++index)
		{
			listInputs[index].blur();
		}
	};
	var initLoginInputs = function () {
		var listInputs = document.forms[0].getElementsByClassName('su-input'),
			listLength = listInputs.length;
		for (var index = 0;index < listLength; ++index)
		{
			focusInput(listInputs[index]);
		}
	};
	var buildLoginCard = function(c, zIndex) {
		var formatter = document.createElement('div'),
			top = "<div class='card-wrapper'><div class='card-container login-card' style='z-index:" + zIndex + ";'><img src='http://assets.tagsurf.co/img/logo_w_border.png'><div class='big bold'>Hate repeats? Sign up!</div>",
			form = "<form accept-charset='UTF-8' action='/users' class='new-user' id='new-user' method='post'><div style='margin:0;padding:0;display:inline'><input name='utf8' type='hidden' value='✓'><input name='authenticity_token' type='hidden' value='" + document.getElementsByName("csrf-token")[0].content + "'></div><center><div><input autocapitalize='off' autocomplete='off' autocorrect='off' class='su-input bigplace' id='email' name='user[email]' placeholder='email' spellcheck='false' type='email' value=''></div><div class='small'>Password must be at least 8 characters</div><div><input autocapitalize='off' autocomplete='off' autocorrect='off' class='su-input bigplace' id='password' name='user[password]' placeholder='password' spellcheck='false' type='password' value=''></div><div><input autocapitalize='off' autocomplete='off' autocorrect='off' class='su-input bigplace' id='repassword' name='user[password_confirmation]' placeholder='re-enter password' spellcheck='false' type='password' value=''></div><input id='su-submit-btn' class='signup-button' name='commit' type='submit' value='sign up'></center></form>",
			bottom = "<div class='wide-text'><a id='line-text-login' class='small big-lnk'>Already have an account? <b>Login here</b>.</a></div><div class='smaller block'>By signing up you agree to our <a class='bold big-lnk' id='terms-lnk'>Terms of Use</a> and <a class='bold big-lnk' id='privacy-lnk'>Privacy Policy</a>.</div></div></div>",
			cardTemplate = top + form + bottom;
		formattingContainer.appendChild(formatter);
		formatter.innerHTML = cardTemplate;
		initCard(formatter);
		initLoginInputs();
		initDocLinks();

		// form validation
		var p = document.getElementById("password");
		var f = document.getElementById("new-user");
		f.onsubmit = function() {
			if (!validEmail(document.getElementById("email").value)) {
				alert("Please use a valid email address");
				return false;
			}
			if (p.value.length < 8) {
				alert("Please try a longer password");
				return false;
			}
			if (p.value != document.getElementById("repassword").value) {
				alert("Please submit matching passwords");
				return false;
			}
			analytics.track('Sign Up in Feed');
			return true;
		};
		gesture.listen("down", document.getElementById("su-submit-btn"), function() {
			f.onsubmit() && f.submit();
		});
	};
	var initCard = function(formatter) {
		card = formatter.firstChild.firstChild;
		setStartState(card);
		initCardGestures.call(card.parentNode);
		slideContainer.appendChild(card.parentNode);
		formattingContainer.removeChild(formatter);
		setSlider();
		return card;
	};
	var buildCard = function (zIndex)
	{
		if (!dataThrobTest())
			return;
		var c = data[cardIndex];

		if (c.type == "content")
			buildContentCard(c, zIndex);
		else if (c.type == "login") 
			buildLoginCard(c, zIndex);
		else
			alert("unknown card type: " + c.type);

		++cardIndex;
		if (data.length == cardIndex + buffer_minimum)
			populateSlider(true);
		if (zIndex)
			buildCard(zIndex - 1);
		else if (getOrientation() == "landscape" && window.innerHeight < 700)
			expandCard();
	};
	var downCallback = function ()
	{
		if (modal.zoom.zoomed) return;
		if (slider.classList.contains('login-card'))
		{
			blurLoginInputs();
		}
		forgetReminder();
		if (slider.style["-webkit-transform"] == "")
		{
			slider.style["-webkit-transform"] = "tranform3d(0,0,0) rotate(0)";
		}
		return true;
	};
	var initImageGestures = function ()
	{
		var imageContainer = this.getElementsByClassName('image-container')[0];
		if (!imageContainer)
			return;
		gesture.listen("tap", imageContainer, tapCallback);
		gesture.listen("down", imageContainer, returnTrue);
		gesture.listen("up", imageContainer, returnTrue);
		gesture.listen("drag", imageContainer, returnTrue);
		modal.setPinchLauncher(imageContainer,
			function() { upCallback(true); });
	};
	var initCardGestures = function ()
	{
		gesture.listen("swipe", this, swipeCallback);
		gesture.listen("up", this, upCallback);
		//gesture.listen("tap", this, tapCallback);
		gesture.listen("drag", this, dragCallback);
		gesture.listen("hold", this, holdCallback);
		gesture.listen("down", this, downCallback);
		initImageGestures.call(this);
	};
	var expandCard = function ()
	{
		if (slider && slider.isContent && slider.compressing)
		{
			slider.compressing = false;
			slider.expanded = true;
			if (slider.children[0].className.indexOf("expanded") == -1)
				slider.children[0].className += " expanded";
			slider.children[2].innerHTML = "<p>" + slider.card.caption + "</p>";
			toggleClass.call(slider.children[3], "hidden");
			toggleClass.call(slider.children[4], "hidden");
			scrollCallback();
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
			trend: "up",
			user_owned: true
		};
		slider.card.tags_v2.push(objwrap);
		tagCard(tag, document.getElementById("pictags" + slider.card.id));
		formatCardContents();
		analytics.track('Add Tag from Feed', {
			card: slider.card.id,
			surfing: current_tag,
			tag_added: tag
		});
	});
	setStarCallback(function() {
		if (!isAuthorized())
		{
			messageBox("Oops", "You need to login to do that...", "login", stashVotesAndLogin);
			return;
		}
		slider.style['border-color'] = "green";
		slider.lastChild.previousSibling.firstChild.style.opacity = 0.8;
		if (modal.zoom.zoomed)
			modal.callZoom(1);
		setFavIcon(true);
		xhr("/api/favorites/" + slider.card.id, "POST", function() {
			swipeSlider("right", function () {
				setFavIcon(false);
			});
		}, null);
		analytics.track('Favorite from Feed', {
			card: slider.card.id,
			surfing: current_tag
		});
		analytics.page({
				title: slider.card.id + " right",
				url: 'http://beta.tagsurf.co/feed#'+current_tag,
				path: "/feed#"+current_tag,
				referrer: 'http://beta.tagsurf.co/'
		});
	});
	setResizeCb(function() {
		slideContainer.innerHTML = "";
		cardIndex = Math.max(0, cardIndex - 3);
		if (data) {
			buildCard(2);
			expandCard();
		}
	});
	firstPopulate();
	setReminderTimeout();
	analytics.identify(currentUser.id);
};

if (isAuthorized())
{
	var lastPath = sessionStorage.getItem("lastPath");
	if (lastPath) {
		sessionStorage.removeItem("lastPath");
		location.hash = lastPath;
	}
	var shareVotes = sessionStorage.getItem("shareVotes");
	if (shareVotes) {
		sessionStorage.removeItem("shareVotes");
		JSON.parse(shareVotes).forEach(castVote);
	}
}

document.location.hash = document.location.hash.replace('|','~');
// handle facebook redirects
if (document.location.href.indexOf("?") != -1)
	document.location = "http://" +
		document.location.host +
			document.location.pathname;
