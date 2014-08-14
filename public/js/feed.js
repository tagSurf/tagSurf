var castVote = function(card) {
	xhr("/api/votes/" + card.data.user_stats.vote + "/" + card.id
		+ "/tag/" + card.data.user_stats.tag_voted, "POST", null, null);
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
	
	var topCard = function() {
		return cardDecks[current_tag].topCard();
	};
	var scrollCallback = function(event)
	{
		var trueScrollTop = scrollContainer.scrollTop ? scrollContainer.scrollTop
			: (scrollContainer.yDrag ? -scrollContainer.yDrag : 0),
			slider = topCard();
		slider.contents.style['transform-origin'] = "center " + trueScrollTop + 'px';
		slider.contents.style['-webkit-transform-origin'] = "center " + trueScrollTop + 'px';
		slider.contents.lastChild.previousSibling.style.top = (50 + trueScrollTop) + 'px';
	};
	drag.makeDraggable(scrollContainer, {
		constraint: "horizontal",
		scroll: scrollCallback
	});

	var staticHash = document.getElementById("static-hash"),
		staticTrending = document.getElementById("static-trending");

	// autocomplete stuff
	var autocompleteCbs = {
		tapCb: function(tagName, insertCurrent) {
			closeAutoComplete(tagName, !!insertCurrent);
			if (tagName != current_tag) {
				shareSwap = true;
				current_tag = tagName;
				current_deck = getDeck(current_tag);
				current_deck.build(null, insertCurrent ? topCard() : null);
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
	});
	var setStartState = function (node)
	{
		node.x = 0;
		node.sliding = false;
		node.verticaling = false;
		node.supering = false;
		node.animating = false;
		node.compressing = true;
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
	var revertSlider = function ()
	{
		var slider = topCard();
		if (slider.isContent) {
			var thumbContainer = slider.contents.lastChild.previousSibling;
			slider.contents.style['border-color'] = "#353535";
			slider.contents.style['background-color'] = "#353535";
			slider.contents.lastChild.display = "none";

			if (thumbContainer.firstChild.style.opacity > 0)
			{
				thumbContainer.firstChild.style.opacity = 0;
			}
			if (thumbContainer.lastChild.style.opacity > 0)
			{
				thumbContainer.lastChild.style.opacity = 0;
			}
		}
		if (slider.x != 0) {
			trans(slider.wrapper,
				function (event) {
					slider.animating = false;
				},
				"swiping",
				"translate3d(0,0,0) rotate(0deg)"
			);
			slider.animating = true;
		}
		revertStateReset(slider);
	};
	var upCallback = function (androidSoftUp)
	{
		if (modal.zoom.zoomed) return;
		var slider = topCard();
		toggleClass.apply(slider.contents,['super-card', 'off']);
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
		var slider = topCard();
		var swipedCard = slider;
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
		trans(swipedCard.wrapper,
			function () {
				swipedCard.animating = false;
				gesture.unlisten(swipedCard.wrapper.parentNode);
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
				swipedCard.vote(voteDir, current_tag, voteAlternative);
				current_deck.refresh();
			},
			"swiping",
			"translate3d(" + translateQuantity + "px," + verticalQuantity
				+ "px,0) rotate(" + rotateQuantity + "deg)");
		slider.animating = true;
		forgetReminders();
	};
	var keyInertia = 0, 
		scrollDirection,
		scrollScrollContainer = function (time) {
			var inertialDecrement = 4, scrollTopIncrement;
			if (stroke.isDown(40))
			{
				if (keyInertia < 50)
					keyInertia += 5;
				scrollContainer.scrollTop += (1 * keyInertia);
				requestAnimFrame(scrollScrollContainer);
			}
			else if (stroke.isDown(38))
			{
				if (keyInertia < 50)
					keyInertia += 5;
				scrollContainer.scrollTop -= (2 * keyInertia);
				requestAnimFrame(scrollScrollContainer);
			}
			else if (keyInertia > 10)
			{
				if (scrollDirection == "down")
				{
					if (stroke.keys['40'].duration > 100)
						inertialDecrement = 6;
					scrollTopIncrement = 2 * keyInertia;
				}
				if (scrollDirection == "up")
				{
					if (stroke.keys['38'].duration > 100)
						inertialDecrement = 6;
					scrollTopIncrement = -2 * keyInertia;
				}
				keyInertia -= inertialDecrement;
				scrollContainer.scrollTop += scrollTopIncrement;
				requestAnimFrame(scrollScrollContainer);
			}
			else if (keyInertia <= 10)
			{
				keyInertia = 0;
				scrollDirection = "";
			}
		};
	['38','40'].forEach(function(index) {
		var strokeCallback = function(keyObject) {
			scrollDirection = index == '38' ? "up" : "down";
			requestAnimFrame(scrollScrollContainer);
		};
		['up','down'].forEach(function(direction) {
			stroke.listen(direction, index, strokeCallback);
		});
	});
	stroke.listen("up", "32", function() {
		topCard().expand(scrollCallback);
	});
	stroke.listen("up", "37", function() {
		var slider = topCard();
		dragCallback("left", -3, -3);
		flashVoteButton("left");
		if (slider.id == 221281) {	
			analytics.track("Key Swipe Login Card", {
				direction: "left",
				surfing: current_tag
			});
		}
		else {
			analytics.track("Key Swipe", {
				card: slider.id,
				direction: "left",
				surfing: current_tag
			});
			analytics.page({
				title: slider.id + " left",
				url: 'http://beta.tagsurf.co/feed#'+current_tag,
				path: "/feed#"+current_tag,
				referrer: 'http://beta.tagsurf.co/'
			});
		}
		swipeSlider("left");
		// slider id will change to next card 
		if (slider.id == 221281)
			analytics.track("Seen Login Card");
	});
	stroke.listen("up", "39", function() {
		var slider = topCard();
		dragCallback("right", 3, 3);
		flashVoteButton("right");
		if (slider.id == 221281) {
			analytics.track("Key Swipe Login Card", {
				direction: "right",
				surfing: current_tag
			});
		}
		else {
			analytics.track("Key Swipe", {
				card: slider.id,
				direction: "right",	
				surfing: current_tag
			});
			analytics.page({
				title: slider.id + " right",
				url: 'http://beta.tagsurf.co/feed#'+current_tag,
				path: "/feed#"+current_tag,
				referrer: 'http://beta.tagsurf.co/'
			});

		}
		swipeSlider("right");
		// slider id will change to next card 
		if (slider.id == 221281)
			analytics.track("Seen Login Card");
	});
	stroke.listen("up", null, closeReminders);
	var swipeCallback = function (direction, distance, dx, dy, pixelsPerSecond)
	{
		if (modal.zoom.zoomed) return;
		var slider = topCard();
		if (!slider.animating && (direction == "up" || direction == "down") && slider.expanded)
			gesture.triggerSwipe(scrollContainer, direction, distance, dx, dy, pixelsPerSecond);
		else if (!slider.animating && (direction == "left" || direction == "right")) {
			if (slider.isContent) {
				analytics.track("Swipe", {
					card: slider.id,
					direction: direction,	
					surfing: current_tag
				});
				analytics.page({
					title: slider.id + " " + direction,
					url: 'http://beta.tagsurf.co/feed#'+current_tag,
					path: "/feed#"+current_tag,
					referrer: 'http://beta.tagsurf.co/'
				});
			}
			else if (slider.id == 221281)
				analytics.track("Swipe Login Card", {
					direction: direction,
					surfing: current_tag
				});
			swipeSlider(direction, null, 700);
			// slider id will change to next card 
			if (slider.id == 221281)
				analytics.track("Seen Login Card");
		}
	};
	var dragCallback = function (direction, distance, dx, dy)
	{
		if (modal.zoom.zoomed) return;
		var slider = topCard();
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
					var thumbContainer = slider.contents.lastChild.previousSibling;
					slider.sliding = true;
					slider.x += dx;
					if (slider.isContent) {
						if ( slider.x > 0)
						{
							slider.contents.style['border-color'] = "green";
							if (slider.supering == true)
							{
								slider.contents.style['background-color'] = 'green';
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
							slider.contents.style['border-color'] = "#C90016";
							if (slider.supering == true)
							{
								slider.contents.style['background-color'] = '#C90016';
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
					slider.wrapper.style['-webkit-transform'] = 
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
				modal.zoomIn(slider.contents);
			}
			else if (slider.expanded == false)
			{
				slider.expand(scrollCallback);
			}
		}
	};
	var holdCallback = function (duration) {
		var slider = topCard();
		if (duration == 3000)
		{
			slider.supering = true;
			toggleClass.apply(slider.contents, ['super-card', 'on']);
		}
	};
	// varred in util...
	panicCb = function() { //panic btn callback
		swipeSlider("left");
		forgetReminders();
		analytics.track('Report Inappropriate Content', {
			card: panic.id,
			surfing: current_tag
		});
		messageBox("Thanks for the Report", "An admin will review that card before anyone sees it again.", "Ok", null, true);
	};
/*	var setSlider = function() {
		var slider = topCard();
		setCurrentMedia(slider, forgetReminders, function() { //panic btn callback
			swipeSlider("left");
			forgetReminders();
			analytics.track('Report Inappropriate Content', {
				card: panic.id,
				surfing: current_tag
			});
			messageBox("Thanks for the Report", "An admin will review that card before anyone sees it again.", "Ok", null, true);
		});
		if (slider.expandTimeout) {
			slider.clearExpandTimeout();
		}
		slider.setExpandTimeout();
	};
	var dataThrobTest = function ()
	{
		var c_wrapper, c_container, msg, img;
		if (slideContainer.firstChild && slideContainer.firstChild.throbbing) {
			setSlider();
			return current_deck.build();
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
			c_container.id = "End-Of-Feed";
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
				current_deck.build();
			return;
		}
		return true;
	};
	var firstCardLoaded = false;

	// TODO: change this stuff
	if (slider == card) {
		slider.setSource();
		firstCardLoaded = false;
		imageContainer.firstChild.onload = function() {
			firstCardLoaded = true;
			if(slider.parentNode.nextSibling.firstChild)
				slider.parentNode.nextSibling.firstChild.setSource();
			if(slider.parentNode.nextSibling.nextSibling.firstChild)
				slider.parentNode.nextSibling.nextSibling.firstChild.setSource();
			throbber.off();
			scrollContainer.style.opacity = 1;
			analytics.track('Finished Pageload');
			preloadCards();
		};
	}
	imageContainer.firstChild.onerror = function() {
		analytics.track('Card Load Error', {card: slider.id});
		slideContainer.removeChild(slider.parentNode.nextSibling);
		slideContainer.removeChild(slider.parentNode.nextSibling);
		slideContainer.removeChild(card.parentNode);
		cardIndex -= 2;
		refreshCards(null, 2, cardIndex);
	};*/
	var blurLoginInputs = function ()
	{
		var listInputs = document.forms[0].getElementsByClassName('su-input'),
			listLength = listInputs.length, index = 0;
		for (;index < listLength; ++index)
		{
			listInputs[index].blur();
		}
	};

/*	var buildCard = function (zIndex)
	{
		if (!dataThrobTest())
			return;
		var c = data[cardIndex];

		// if (c.type == "content")
		// 	buildContentCard(c, zIndex);
		// else if (c.type == "login") 
		// 	buildLoginCard(c, zIndex);
		// else
		// 	alert("unknown card type: " + c.type);	

		++cardIndex;
		if (data.length == cardIndex + buffer_minimum)
			current_deck.build(true);
		if (zIndex)
			buildCard(zIndex - 1);
		else if (getOrientation() == "landscape" && window.innerHeight < 700)
			topCard().expand(scrollCallback);
	};*/
	var downCallback = function ()
	{
		if (modal.zoom.zoomed) return;
		var slider = topCard();
		if (slider.contents.classList.contains('login-card'))
		{
			blurLoginInputs();
		}	
		forgetReminders();
		if (slider.contents.style["-webkit-transform"] == "")
		{
			slider.contents.style["-webkit-transform"] = "tranform3d(0,0,0) rotate(0)";
		}
		return true;
	};
	setAddCallback(function(tag) {
		topCard().tagCard(tag);
		analytics.track('Add Tag from Feed', {
			card: topCard().id,
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
		var slider = topCard();
		slider.wrapper.style['border-color'] = "green";
		slider.lastChild.previousSibling.firstChild.style.opacity = 0.8;
		if (modal.zoom.zoomed)
			modal.callZoom(1);
		setFavIcon(true);
		xhr("/api/favorites/" + slider.id, "POST", function() {
			swipeSlider("right", function () {
				setFavIcon(false);
			});
		}, null);
		analytics.track('Favorite from Feed', {
			card: slider.id,
			surfing: current_tag
		});
		analytics.page({
				title: slider.id + " right",
				url: 'http://beta.tagsurf.co/feed#'+current_tag,
				path: "/feed#"+current_tag,
				referrer: 'http://beta.tagsurf.co/'
		});
	});
	setResizeCb(function() {
		slideContainer.innerHTML = "";
		current_deck.deal();
		topCard().expand();
	});
	
	var firstPopulate = function() {
		var feed, id, pair, h = document.location.hash.slice(1),
			cbs = {
				build: function() {
					throbber.off();
					scrollContainer.style.opacity = 1;
				},
				start: setStartState,
				swipe: swipeCallback,
				expand: scrollCallback,
				drag: dragCallback,
				hold: holdCallback,
				tap: tapCallback,
				up: upCallback,
				down: downCallback
			};
		if (h.indexOf('~') != -1) {
			pair = h.split("~");
			id = pair[1];
			xhr("/api/card/" + id, null, function(d) {
				var firstCard = newCard(d);
				firstCard.show(cbs);
				current_deck = getDeck(current_tag, firstCard, cbs);
			});
		} else if (document.location.href.indexOf('share') != -1) {
			id = document.location.pathname.split("/")[3];
			xhr("/api/card/" + id, null, function(d) {
				var firstCard = newCard(d);
				firstCard.show(cbs);
				current_deck = getDeck(current_tag, firstCard, cbs);
			});
		} else
			current_deck = getDeck(current_tag, null, cbs);
	};

	firstPopulate();
	buildVoteButtons(dragCallback, swipeSlider);
	
	if(currentUser.vote_btns){
		voteButtonsOn();
	}
	analytics.identify(currentUser.id);
	if(!isAuthorized() && !DEBUG)
		newReminder(null, null, "Swipe", 13000);
};

//This is the first line executed in feed
throbber.on();

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
		// TODO: batch these
		JSON.parse(shareVotes).forEach(castVote);
	}
}

document.location.hash = document.location.hash.replace('|','~');
// handle facebook redirects
if (document.location.href.indexOf("?") != -1)
	document.location = "http://" +
		document.location.host +
			document.location.pathname;
