var castVote = function(card) {
	var tag = card.data.user_stats.tag_voted;
	tag = tag.indexOf(',') != -1 ? tag.split(',').pop() : tag;
	xhr("/api/votes/" + card.data.user_stats.vote + "/" + card.id
		+ "/tag/" + tag, "POST", null, null);
};

var acceptFriend = function(id) {
	xhr("/api/friend/accept/"+id, "POST", refer.populateBuddies, null);
}

var declineFriend = function(id) {
	xhr("/api/friend/decline/"+id, "POST", refer.populateBuddies, null);
}

// window.onpageshow = function(evt) {
// 	if (evt.persisted) {
// 		document.body.style.display = "none";
// 		location.reload();
// 	}
// };

onload = function ()
{
	// Deeplink re-directs
	// Pause on facebook redirect to handle bug in iPhone5 FB Browser
	var id = isAuthorized() ? document.location.hash.split('~')[1] : document.location.pathname.split("/")[3];
	if (isFacebook() && isIos() && !DEBUG) {
		setTimeout(function() { 
				if (isIos() && !isUIWebView() && isAuthorized())
					window.location = "tagSurf://card/" + document.location.hash.split("#")[1];
				else if (isIos() && !isUIWebView() && !isAuthorized())
					window.location = "tagSurf://card/" + 
						document.location.pathname.split("/")[2] + "~" + 
							document.location.pathname.split("/")[3];
		}, 2000);
	}
	else if (isIos() && !isUIWebView() && id && id != 0 && isAuthorized() && !DEBUG)
		window.location = "tagSurf://card/" + document.location.hash.split("#")[1];
	else if (isIos() && !isUIWebView() && !DEBUG)
		window.location = "tagSurf://card/" + document.location.pathname.split("/")[2] + "~" +
							document.location.pathname.split("/")[3];
	
	populateNavbar();

	// defined in util for autocomplete
	// integration with other sliding elements
	tinput = document.getElementById("tag-input");
	current_tag = tinput.value = document.location.hash.slice(1).split("~")[0]
		|| document.location.pathname.split("/")[2] 
		|| document.location.pathname.split("#")[1]
		|| "funny";
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
	// varred in util
	cardCbs = {
		start: function (node) {
			node.x = 0;
			node.sliding = false;
			node.verticaling = false;
			node.supering = false;
			node.animating = false;
			node.compressing = true;
			node.expanded = false;
			node.style['-webkit-transform'] = "";
		},
		swipe: function (direction, distance, dx, dy, pixelsPerSecond) {
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
					swipeSlider(direction, null, 700);
				}
				else if (slider.id == 221281) {
					analytics.track("Swipe Login Card", {
						direction: direction,
						surfing: current_tag
					});
					swipeSlider(direction, null, 700);
				}
				else if (slider.type == "friend_request") {
					var friendId = slider.data.user_stats.friend_id;
					swipeSlider(direction, (direction == "left" ? declineFriend(friendId) : acceptFriend(friendId)), 700);
				}
				else
					swipeSlider(direction, null, 700);
			}
		},
		scroll: function(event) {
			var trueScrollTop = scrollContainer.scrollTop ? scrollContainer.scrollTop
				: (scrollContainer.yDrag ? -scrollContainer.yDrag : 0),
				slider = topCard();
			slider.contents.style['transform-origin'] = "center " + trueScrollTop + 'px';
			slider.contents.style['-webkit-transform-origin'] = "center " + trueScrollTop + 'px';
			slider.contents.lastChild.previousSibling.style.top = (50 + trueScrollTop) + 'px';
		},
		expand: function(event) {
			var trueScrollTop = scrollContainer.scrollTop ? scrollContainer.scrollTop
				: (scrollContainer.yDrag ? -scrollContainer.yDrag : 0),
				slider = topCard();
			slider.contents.style['transform-origin'] = "center " + trueScrollTop + 'px';
			slider.contents.style['-webkit-transform-origin'] = "center " + trueScrollTop + 'px';
			slider.contents.lastChild.previousSibling.style.top = (50 + trueScrollTop) + 'px';
		},
		drag: function (direction, distance, dx, dy, pixelsPerSecond) {
			if (modal.zoom.zoomed) return;
			var slider = topCard();
			if (slider.animating == false) {
				if (slider.expanded == true && 
					(direction == "up" || direction == "down")) {
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
				else if (slider.verticaling == false) {
					slider.x += dx;
					if (isAndroid()) {
						if (!slider.rAFid)
							slider.rAFid = requestAnimFrame(rAF_drag);
					} else {
						slider.contents.style['-webkit-transform'] =
							"translate3d(" + ( slider.x * translationScale)
								+ "px,0,0) rotate(" + ( slider.x * rotationScale) + "deg)";
					}
					if (slider.sliding == false) {
						slider.sliding = true;
						toggleClass.call(slider.contents, "card-swiping", "on");
					}
					if (slider.isContent) {
						var dir = (slider.x > 0) ? 1 : (slider.x < 0) ? -1 : 0;
						if (dir != slider.dir) {
							slider.dir = dir;
							var thumbContainer = slider.contents.lastChild.previousSibling,
								dirColor = "", firstOp = 0, lastOp = 0;
							if (dir == 1) {
								dirColor = "green";
								firstOp = 0.8;
							} else if (dir == -1) {
								dirColor = "#C90016";
								lastOp = 0.8;
							}
							slider.contents.style['border-color'] = dirColor;
							if (slider.supering)
								slider.contents.style['background-color'] = dirColor;
							thumbContainer.firstChild.style.opacity = firstOp;
							thumbContainer.lastChild.style.opacity = lastOp;
						}
					}
				}
			}
		},
		hold: function (duration) {
			// var slider = topCard();
			// if (duration == 3000 && !isAndroid() && !slider.video)
			// {
			// 	slider.supering = true;
			// 	toggleClass.apply(slider.contents, ['super-card', 'on']);
			// }
		},
		tap: function (tapCount) {
			var slider = topCard();
			if (modal.zoom.zoomed || slider.video) return;
			if (tapCount == 1)
			{
				if (slider.compressing == false)
				{
					if (slider.type.indexOf('web') == -1) {
						modal.zoomIn(slider);
					}
					else if (!isDesktop()) {
						var dispatch = document.createEvent("HTMLEvents");
					    DEBUG && console.log("tap registered");
					    dispatch.initEvent("click", true, true);
					    slider.contents.firstChild.dispatchEvent(dispatch);
					}
				}
				else if (slider.expanded == false)
				{
					slider.expand();
				}
			}
		},
		up: function (androidSoftUp) {
			if (modal.zoom.zoomed) return;
			var slider = topCard();
			if (slider.rAFid)
			{
				cancelAnimationFrame(slider.rAFid);
				slider.rAFid = null;
			}
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
						if (slider.isContent) {
							analytics.track("Swipe", {
								card: slider.id,
								direction: "right",	
								surfing: current_tag
							});
							swipeSlider("right", null, 100);
						}
						else if (slider.id == 221281) {
							analytics.track("Swipe Login Card", {
								direction: "right",
								surfing: current_tag
							});
							swipeSlider("right", null, 100);
						}
						else if (slider.type == "friend_request") {
							var friendId = slider.data.user_stats.friend_id;
							swipeSlider("right", acceptFriend(friendId), 100);	
						}
						else
							swipeSlider("right", null, 100);	
					}
					else if (slider.x < -slideThreshold)
					{
						if (slider.isContent) {
							analytics.track("Swipe", {
								card: slider.id,
								direction: "left",	
								surfing: current_tag
							});
							swipeSlider("left", null, 100);
						}
						else if (slider.id == 221281) {
							analytics.track("Swipe Login Card", {
								direction: "left",
								surfing: current_tag
							});
							swipeSlider("left", null, 100);
						}
						else if (slider.type == "friend_request") {
							var friendId = slider.data.user_stats.friend_id;
							swipeSlider("left", declineFriend(friendId), 100);
						}
						else
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
		},
		down: function () {
			if (modal.zoom.zoomed) return;
			var slider = topCard();
			if (slider.contents.classList.contains('login-card'))
			{
				blurLoginInputs();
			}	
			if (slider.contents.style["-webkit-transform"] == "")
			{
				slider.contents.style["-webkit-transform"] = "tranform3d(0,0,0) rotate(0)";
			}
			return true;
		}
	};

	var rAF_drag = function () {
		var slider = topCard();
		slider.contents.style['-webkit-transform'] = 
			"translate3d(" + ( slider.x * translationScale)
				+ "px,0,0) rotate(" + ( slider.x * rotationScale) + "deg)";
		slider.rAFid = requestAnimFrame(rAF_drag);
	};

	drag.makeDraggable(scrollContainer, {
		constraint: "horizontal",
		scroll: cardCbs.scroll
	});

	var staticHash = document.getElementById("static-hash"),
		staticTrending = document.getElementById("static-trending");

	var last_tag;
	cardCbs.notSafe = function() {
		last_tag && switchTag(last_tag);
	};
	var switchTag = function (tagName) {
		if (tagName != current_tag) {
			throbber.on(true);
			clearStack();
			last_tag = current_tag;
			current_tag = tagName;
			setDeck(current_tag);
			analytics.track('Search for Tag', {
				tag: tagName
			});
			if(!isAuthorized()) {
				hasSwitchedTags = true;
				tutorial.on && tutorial.tagSwitchCb();
			}
		}
		tinput.value = tagName || current_tag;
		if (isAuthorized())
			location.hash = tinput.value;
	};

	// autocomplete stuff
	var autocompleteCbs = {
		tapCb: function(tagName, insertCurrent) {
			closeAutoComplete(!!insertCurrent);
			switchTag(tagName);
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
		".raw-wrapper, .zoom-wrapper, .web-wrapper, .raw-web-wrapper, #scroll-container, #scroll-container-container": function() {
			return "height: " + (window.innerHeight - 50) + "px";
		}
	});
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
		toggleClass.call(slider.contents, "card-swiping", "off");
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
			trans(slider.contents,
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
	var swipeSlider = function (direction, voteAlternative, pixelsPerSecond, vote)
	{
		var slider = topCard();
		var vote = (typeof vote === "undefined")? true : vote;
		var swipedCard = slider;
		var translateQuantity = Math.max(slider.contents.clientHeight / 2, 600),
			rotateQuantity = slider.clientHeight > 3000 ? 30 : 60,
			verticalQuantity = 0;
		var isUp = direction == "right";
		var voteDir = isUp ? "up" : "down";
		var transitionDistance = translateQuantity - slider.x;
		var transitionDuration = pixelsPerSecond ? (transitionDistance / pixelsPerSecond) : 250;
		if (slider.type == "waves" || slider.type == "End-Of-Feed")
			return;
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
		analytics.page({
			title: slider.id + " " + direction,
			url: 'http://beta.tagsurf.co/feed#'+current_tag,
			path: "/feed#"+current_tag,
			referrer: 'http://beta.tagsurf.co/'
		});
		trans(swipedCard.wrapper,
			function () {
				swipedCard.animating = false;
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
				console.log("Swiped card #" + swipedCard.id);
				if (vote)
					swipedCard.vote(voteDir, current_tag, voteAlternative);
			},
			"swiping",
			"translate3d(" + translateQuantity + "px," + verticalQuantity
				+ "px,0) rotate(" + rotateQuantity + "deg)");
		slider.animating = true;
		// forgetReminders();
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
		topCard().expand();
	});
	stroke.listen("up", "37", function() {
		var slider = topCard();
		if(topCard().type == "waves" || topCard().type == "End-Of-Feed")
			return;
		cardCbs.drag("left", -3, -3);
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
		}
		if (slider.type == "friend_request") {
			var friendId = slider.data.user_stats.friend_id;
			swipeSlider("left", declineFriend(friendId), 700);
		} else {
			swipeSlider("left");
		}
		hasKeySwiped = true;
	});
	stroke.listen("up", "39", function() {
		var slider = topCard();
		if(topCard().type == "waves" || topCard().type == "End-Of-Feed")
			return;
		cardCbs.drag("right", 3, 3);
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
		}
		if (slider.type == "friend_request") {
			var friendId = slider.data.user_stats.friend_id;
			swipeSlider("right", acceptFriend(friendId), 700);
		} else {
			swipeSlider("right");			
		}
		hasKeySwiped = true;
	});
	stroke.listen("up", null, closeReminders);
	
	// varred in util...
	panicCb = function() { //panic btn callback
		topCard().unshow();
		current_deck.shift();
		forgetReminders();
		analytics.track('Report Inappropriate Content', {
			card: panic.card.id,
			surfing: current_tag
		});
		messageBox("Thanks for the Report",
			"An admin will review that card before anyone sees it again.",
			"OK", null, true);
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
	setAddCallback(function(tag) {
		if (topCard().type != "content")
			return;
		if (tag == "trending")
			messageBox("Oops", "If you'd like to make this trend just upvote it");
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
			messageBox("Oops", "You need to login to favorite this", "login", stashVotesAndLogin);
			return;
		}
		var slider = topCard();
		slider.contents.style['border-color'] = "green";
		slider.contents.lastChild.previousSibling.firstChild.style.opacity = 0.8;
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
	});
	setResizeCb(function() {
		clearStack();
		current_deck.deal();
		topCard().expand();
	});
	
	var firstPopulate = function() {
		var id, h = document.location.hash.slice(1);
		if (h.indexOf('~') != -1)
			id = h.split("~")[1];
		else if (document.location.href.indexOf('share') != -1)
			id = document.location.pathname.split("/")[3];
		if (id && id != 0) {
			xhr("/api/card/" + id, null, function(d) {
				setDeck(current_tag, newCard(d.data));
			});
		} else
			setDeck(current_tag);
	};

	firstPopulate();
	buildVoteButtons(cardCbs.drag, swipeSlider);

	if (currentUser.vote_btns)
		voteButtonsOn();

	analytics.identify(currentUser.id);
	var jiggler = function() {
		tutorial.jiggleTimeout = setTimeout(function() { 
			current_deck.topCard().jiggle() 
		}, 6000);
		setTimeout(function() {
			current_deck.topCard().setOneTimeCb("vote", function () { 
				clearTimeout(tutorial.jiggleTimeout);
				tutorial.jiggleTimeout = null;
			});
		}, 4000);
	}
	// setTimeout(function() {
	// 	var topCard = current_deck.topCard();
	// 	if (topCard && !topCard.showing)
	// 		current_deck.topCard().setOneTimeCb("show", function() {
	// 			reminders[0] && reminders[0].forget(true);
	// 		});
	// 	else if (topCard)
	// 		slowReminder.forget(true);
	// }, 8000);
	
	setTimeout(function() {
		var topCard = current_deck.topCard();
		if (topCard && topCard.showing && isAuthorized())
			if (currentUser && !currentUser.completed_tutorial)
				tutorial.start();
			else if (currentUser)
				return;
		else
			setTimeout(function() {
				var topCard = current_deck.topCard();
				if (topCard && topCard.showing)
					if (currentUser && !currentUser.completed_tutorial)
						tutorial.start();
				else if (currentUser)
					return;
				else
					console.log("Slow connection... we'll get 'em next time");
			}, 4000);
	}, 4000);

	if (!isAuthorized())// && !DEBUG)
		jiggler();
	if (!isAuthorized() && isMobile())
		newReminder(downloadMessage.call(), function() {
			var menuBtn = document.getElementById('appstore-btn');
			menuBtn.classList.remove('hidden');
		}, "Download", 12000, 5000);
};

//This is the first line executed in feed
throbber.on(true);

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
if (document.location.href.indexOf("?") != -1 ||
	document.location.href.indexOf("=") != -1)
	document.location = "http://" +
		document.location.host +
			document.location.pathname;
