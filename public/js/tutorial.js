var tutorial = {
	on: false,
	paused: false,
	jiggleTimeout: null,
	start: function() {
		tutorial.on = true;
		var welcome = newReminder(welcomeMessage.call(), function() {
			var upvote = newReminder(upvoteMessage.call(), function() {
				var downvote = newReminder(downvoteMessage.call(), null, "Downvote", 2000, 5000);
				tutorial.jiggleTimeout = setTimeout(function() { 
					current_deck.topCard().jiggle() 
				}, 10000);
				current_deck.topCard().setOneTimeCb("vote", function () { 
					var firstvote = newReminder(firstvoteMessage.call(), startPhase2, "First Vote", 1000, 5000);
					clearTimeout(tutorial.jiggleTimeout); 
					tutorial.jiggleTimeout = null;
				});
			}, "Upvote", 5000, 5000);
		}, "Welcome", 1000, 6000);
		welcome.setCb("show", function() {
			if(isUIWebView())
				this.container.style.paddingTop = "30px"; 
		});
	},
	pause: function() {
		if(!reminders[0] || !tutorial.on)
			return
		analytics.track("Pause Tutorial", {
			reminder: reminders[0].type
		});
		reminders[0].close()
		forgetReminders();
		var pauseReminder = newReminder(resumeMessage.call(), null, "Resume", 1000, 2000),
			offset = document.getElementById('nav').clientHeight;
		pauseReminder.container.style.marginTop = offset + "px";
		pauseReminder.setCb("show", function() {
			var closebtn = pauseReminder.container.lastChild.children[0];
			closebtn.style.bottom = (isDesktop() || isTablet() ? 20 : 15) + offset + "px";
		});
		tutorial.on = false;
		tutorial.paused = true;
	},
	resume: function(timeout) {
		if(!reminders[0])
			return;
		analytics.track("Resume Tutorial", {
			reminder: reminders[0].type
		});
		tutorial.on = true;
		tutorial.paused = false;
		reminders[0].startTimeout(timeout);
		current_deck.removeLoginCards();
	}
};

// Sequence Managers
// these funcs manage sequence and fx for tutorial
// (The opening set is controlled from tutorial.start())
var startPhase2 = function() {
	current_deck.removeLoginCards();
	newReminder(keepgoingPrompt.call(), null, "Keep Going", 10000, 5000); 	
	current_deck.topCard().setOneTimeCb("vote", function() { 
		reminders[0] && reminders[0].forget(true); 
	});
	current_deck.removeLoginCards();
	remindSwipe();
};

var remindSwipe = function() {
	current_deck.removeLoginCards();
	current_deck.cards[4] && current_deck.cards[4].setOneTimeCb("vote", function() {
		if(isDesktop() && !hasKeySwiped) {
			var swipeRemind = newReminder(desktopSwipeReminder.call(), function() {
					tutorial.jiggleTimeout = setTimeout(function() { current_deck.topCard().jiggle() }, 2000);
					remindSwipe();
				}, "Swipe", 1000, 6000);
			!tutorial.on && swipeRemind.forget();
		}
		else if ((isMobile() || isTablet()) && !hasSwiped) {		
			var swipeRemind = newReminder(swipeMessage.call(), function() {
				newReminder(swipeGif.call(), function() {
					tutorial.jiggleTimeout = setTimeout(function() { current_deck.topCard().jiggle() }, 2000);
					remindSwipe();
				}, "Swipe-Gif", 0, 6000)
			}, "Swipe", 1000, 3000);
			!tutorial.on && swipeRemind.forget();
		}
		else if (!isDesktop()) {
			var rmButtonsReminder = newReminder(rmVoteBtnsMessage.call(), null, "Vote Btns", 1000, 5000),
				offset = document.getElementById('nav').clientHeight;
			rmButtonsReminder.container.style.marginTop = offset + "px";
			rmButtonsReminder.setCb("show", function() {
				var closebtn = rmButtonsReminder.container.lastChild.children[0];
				closebtn.style.bottom = (isDesktop() || isTablet() ? 20 : 15) + offset + "px";
			});
			!tutorial.on && rmButtonsReminder.forget();
		}
	});
};

var featureTour = function() {
	newReminder(tourMessage.call(), function() {
		var offset,
			addTagReminder = newReminder(addTagMessage.call(), function() {
				var offset,
					favoriteReminder = newReminder(favoriteMessage.call(), function() {
						var shareReminder = newReminder(shareMessage.call(), function() {
							newReminder(reportMessage.call(), function(){
								var offset,
									thatsAllReminder = newReminder(thatsAllMessage.call(), null, "Add Tag", 1000, 5000);
								offset = document.getElementById('nav').clientHeight;
								thatsAllReminder.container.style.marginTop = offset + "px";
								thatsAllReminder.setCb("show", function() {
									var closebtn = thatsAllReminder.container.lastChild.children[0];
									closebtn.style.bottom = (isDesktop() || isTablet() ? 20 : 15) + offset + "px";
								});								
							}, "Report", 1000, 5000);
						}, "Share", 1000, 5000);
						shareReminder.setCb("show", function() {
						 	var closebtn = shareReminder.container.lastChild.children[0];
						 	closebtn.className += " reminder-close-left";
						});
				}, "Favorite", 1000, 5000);
				offset = document.getElementById('nav').clientHeight;
				favoriteReminder.container.style.marginTop = offset + "px";
				favoriteReminder.setCb("show", function() {
					var closebtn = favoriteReminder.container.lastChild.children[0];
					closebtn.style.bottom = (isDesktop() || isTablet() ? 20 : 15) + offset + "px";
				});
		}, "Add Tag", 1000, 5000);
		offset = document.getElementById('nav').clientHeight;
		addTagReminder.container.style.marginTop = offset + "px";
		addTagReminder.setCb("show", function() {
			var closebtn = addTagReminder.container.lastChild.children[0];
			closebtn.style.bottom = (isDesktop() || isTablet() ? 20 : 15) + offset + "px";
		});
	}, "Tour Start", 2000, 5000);
}

// Message Builders
// these funcs all build nodes for tutorial screen reminders
var welcomeMessage = function() {
	var node = document.createElement('div'),
		topMessage = document.createElement('div'),
		logo = document.createElement('img'),
		bottomMessage = document.createElement('div');
	topMessage.innerHTML = "Welcome to";
	topMessage.className = isMobile() ? "centered biggest" : "centered really-big";
	topMessage.style.marginTop = isMobile() ? "18%" : "7%";
	logo.src = "http://assets.tagsurf.co/img/ts_logo_stacked_gray_trans.png";
	logo.className = "tutorial-logo";
	bottomMessage.innerHTML = isMobile() ? "A place to surf the<br/>top social content<br/>on the web" 
											: "A place to surf the top<br/>social content on the web";
	bottomMessage.className = isMobile() ? "centered biggest" : "centered really-big";
	node.appendChild(topMessage);
	node.appendChild(logo);
	node.appendChild(bottomMessage);
	return node;
};

var upvoteMessage = function() {
	var node = document.createElement('div'),
		pausebtn = document.createElement('div'),
		upvotebtn = new Image(),
		upvotearrow = new Image();
	upvotebtn.src = "http://assets.tagsurf.co/img/upvote_btn.png";
	upvotebtn.id = "reminder-vote-button-right";
	upvotearrow.src = "http://assets.tagsurf.co/img/upvote_arrow.gif";
	upvotearrow.id = "reminder-upvote-arrow";
	node.innerHTML = isMobile ? "Upvote this<br/>and we'll show it<br/>to more people<br/>surfing this tag" : "Upvote this and we'll show it<br/>more to people surfing this tag";
	node.className = isMobile() ? "centered biggest" : "centered really-big";
	node.appendChild(upvotearrow);	
	node.appendChild(upvotebtn);
	node.style.marginTop = isMobile() ? "50%" : "22%";
	pausebtn.id = "pause-btn";
	pausebtn.className = "no-fill-btn pointer";
	if(!isDesktop())
		pausebtn.className += " thumb-clear";
	pausebtn.innerHTML = "Pause Tutorial";
	gesture.listen("down", pausebtn, function() {
		pausebtn.classList.add("active-no-fill-btn");
	});
	gesture.listen("up", pausebtn, function() {
		pausebtn.classList.remove("active-no-fill-btn");
	});
	gesture.listen("tap", pausebtn, function() {
		tutorial.pause();
	});
	node.appendChild(pausebtn);
	return node;
};

var downvoteMessage = function() {
	var node = document.createElement('div'),
		pausebtn = document.createElement('div'),
		downvotebtn = new Image(),
		downvotearrow = new Image();
	downvotebtn.src = "http://assets.tagsurf.co/img/downvote_btn.png";
	downvotebtn.id = "reminder-vote-button-left";
	downvotearrow.src = "http://assets.tagsurf.co/img/downvote_arrow.gif";
	downvotearrow.id = "reminder-downvote-arrow";
	node.innerHTML = "Downvote it<br/>and we'll show it<br/>less";
	node.className = isMobile() ? "centered biggest" : "centered really-big";
	node.appendChild(downvotearrow);	
	node.appendChild(downvotebtn);
	node.style.marginTop = isMobile() ? "50%" : "23%";
	pausebtn.className = "no-fill-btn pointer";
	if(!isDesktop())
		pausebtn.className += " thumb-clear";
	gesture.listen("down", pausebtn, function() {
		pausebtn.classList.add("active-no-fill-btn");
	});
	gesture.listen("up", pausebtn, function() {
		pausebtn.classList.remove("active-no-fill-btn");
	});
	gesture.listen("tap", pausebtn, function() {
		tutorial.pause();
	});
	pausebtn.id = "pause-btn";
	pausebtn.innerHTML = "Pause Tutorial";
	node.appendChild(pausebtn);
	return node;
};

var resumeMessage = function() {
	var node = document.createElement('div'),
		menuarrow = new Image();
	menuarrow.src = "http://assets.tagsurf.co/img/up_pointer_arrow_white.gif";
	menuarrow.id = "menu-up-arrow";
	node.innerHTML = "Resume Tutorial<br/>From Options Menu";
	node.className = isMobile() ? "centered biggest" : "centered really-big";
	node.appendChild(menuarrow);	
	node.style.marginTop = isMobile() ? "50%" : "23%";
	return node;
};

var firstvoteMessage = function() {
	var node = document.createElement('div'),
		pausebtn = document.createElement('div');
	node.innerHTML = "Great job!<br/>Your votes improve<br/>the feed for<br/>everyone";
	node.className = isMobile() ? "centered biggest" : "centered really-big";
	node.style.marginTop = isMobile() ? "50%" : "20%";
	pausebtn.className = "no-fill-btn pointer";
	gesture.listen("down", pausebtn, function() {
		pausebtn.classList.add("active-no-fill-btn");
	});
	gesture.listen("up", pausebtn, function() {
		pausebtn.classList.remove("active-no-fill-btn");
	});
	gesture.listen("tap", pausebtn, function() {
		tutorial.pause();
	});
	pausebtn.id = "pause-btn";
	pausebtn.innerHTML = "Pause Tutorial";
	node.appendChild(pausebtn);
	return node;
};

var keepgoingPrompt = function() {	
	var node = document.createElement('div'),
		pausebtn = document.createElement('div');
	node.innerHTML = isMobile() ? "Keep voting and<br/>we'll find you some<br/>tags to surf" 
									: "Keep voting and we'll<br/>find you some tags to surf";
	node.className = isMobile() ? "centered biggest" : "centered really-big";
	node.style.marginTop = isMobile() ? "50%" : "20%";
	pausebtn.className = "no-fill-btn pointer";
	gesture.listen("down", pausebtn, function() {
		pausebtn.classList.add("active-no-fill-btn");
	});
	gesture.listen("up", pausebtn, function() {
		pausebtn.classList.remove("active-no-fill-btn");
	});
	gesture.listen("tap", pausebtn, function() {
		tutorial.pause();
	});
	pausebtn.id = "pause-btn";
	pausebtn.innerHTML = "Pause Tutorial";
	node.appendChild(pausebtn);
	return node;
};

var rmVoteBtnsMessage = function() {
	var node = document.createElement('div'),
		menuarrow = new Image();
	menuarrow.src = "http://assets.tagsurf.co/img/up_pointer_arrow_white.gif";
	menuarrow.id = "menu-up-arrow";
	node.innerHTML = "Looking great!<br/><br/>You can turn off<br/>vote buttons in options";
	node.className = isMobile() ? "centered biggest" : "centered really-big";
	node.appendChild(menuarrow);	
	node.style.marginTop = isMobile() ? "50%" : "20%";
	return node;
};

var desktopSwipeReminder = function () {
	var leftImage = new Image(), rightImage = new Image(),
		pausebtn = document.createElement('div'),
		message = document.createElement('div'),
		node = document.createElement('div');
	leftImage.id = "reminder-left";
	rightImage.id = "reminder-right";
	node.className = isMobile() ? "centered biggest" : "centered really-big";
	node.style.marginTop = isMobile() ? "50%" : "23%";
	message.innerHTML = "You can also vote<br/>with your keyboard<br/>arrow keys";
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
	node.appendChild(leftImage);
	node.appendChild(rightImage);
	node.appendChild(message);
	pausebtn.id = "pause-btn";
	pausebtn.className = "no-fill-btn pointer";
	pausebtn.innerHTML = "Pause Tutorial";
	gesture.listen("down", pausebtn, function() {
		pausebtn.classList.add("active-no-fill-btn");
	});
	gesture.listen("up", pausebtn, function() {
		pausebtn.classList.remove("active-no-fill-btn");
	});
	gesture.listen("tap", pausebtn, function() {
		tutorial.pause();
	});
	node.appendChild(pausebtn);
	return node;
};

var swipeGif = function () {
	var gif = new Image(),
		node = document.createElement('div'),
		pausebtn = document.createElement('div');
	gif.id = "swipe-gif";
	gif.src = "http://assets.tagsurf.co/img/swipe.gif";	
	node.className = isMobile() ? "centered biggest" : "centered really-big";
	node.style.marginTop = isMobile() ? "50%" : "23%";
	pausebtn.className = "no-fill-btn pointer";
	pausebtn.id = "pause-btn";
	pausebtn.innerHTML = "Pause Tutorial";
	gesture.listen("down", pausebtn, function() {
		pausebtn.classList.add("active-no-fill-btn");
	});
	gesture.listen("up", pausebtn, function() {
		pausebtn.classList.remove("active-no-fill-btn");
	});
	gesture.listen("tap", pausebtn, function() {
		tutorial.pause();
	});
	node.appendChild(gif);
	node.appendChild(pausebtn);
	return node;	
}

var swipeMessage = function() {
	var node = document.createElement('div'),
		pausebtn = document.createElement('div');
	node.innerHTML = "You can also<br/>swipe to vote<br/>like this...";
	node.className = isMobile() ? "centered biggest" : "centered really-big";
	node.style.marginTop = isMobile() ? "50%" : "20%";
	pausebtn.className = "no-fill-btn pointer";
	gesture.listen("down", pausebtn, function() {
		pausebtn.classList.add("active-no-fill-btn");
	});
	gesture.listen("up", pausebtn, function() {
		pausebtn.classList.remove("active-no-fill-btn");
	});
	gesture.listen("tap", pausebtn, function() {
		tutorial.pause();
	});
	pausebtn.id = "pause-btn";
	pausebtn.innerHTML = "Pause Tutorial";
	node.appendChild(pausebtn);
	return node;
};

var tagSwitchMessage = function() {
	var node = document.createElement('div'),
		pausebtn = document.createElement('div');
	node.innerHTML = "Now you're surfing!<br/><br/>tagSurf is all about<br/>discovering trending<br/>social content through hashtags";
	node.className = isMobile() ? "centered biggest" : "centered really-big";
	node.style.marginTop = isMobile() ? "40%" : "20%";
	pausebtn.className = "no-fill-btn pointer";
	gesture.listen("down", pausebtn, function() {
		pausebtn.classList.add("active-no-fill-btn");
	});
	gesture.listen("up", pausebtn, function() {
		pausebtn.classList.remove("active-no-fill-btn");
	});
	gesture.listen("tap", pausebtn, function() {
		tutorial.pause();
	});
	pausebtn.id = "pause-btn";
	pausebtn.innerHTML = "Pause Tutorial";
	node.appendChild(pausebtn);
	return node;
};

var tourMessage = function() {
	var node = document.createElement('div'),
		pausebtn = document.createElement('div');
	node.innerHTML = "Let's take 5<br/>and go over<br/>some more<br/>features";
	node.className = isMobile() ? "centered biggest" : "centered really-big";
	node.style.marginTop = isMobile() ? "50%" : "20%";
	pausebtn.className = "no-fill-btn pointer";
	gesture.listen("down", pausebtn, function() {
		pausebtn.classList.add("active-no-fill-btn");
	});
	gesture.listen("up", pausebtn, function() {
		pausebtn.classList.remove("active-no-fill-btn");
	});
	gesture.listen("tap", pausebtn, function() {
		tutorial.pause();
	});
	pausebtn.id = "pause-btn";
	pausebtn.innerHTML = "Pause Tutorial";
	node.appendChild(pausebtn);
	return node;
};

var addTagMessage = function() {
	var node = document.createElement('div'),
		pausebtn = document.createElement('div'),
		offset = document.getElementById('nav').clientHeight,
		menuarrow = new Image();
	menuarrow.src = "http://assets.tagsurf.co/img/up_pointer_arrow_white.gif";
	menuarrow.id = "menu-up-arrow";
	menuarrow.className = "left-arrow";
	node.innerHTML = "Add a new tag<br/>to share this<br/>in another feed";
	node.className = isMobile() ? "centered biggest" : "centered really-big";
	node.style.marginTop = isMobile() ? "40%" : "18%";
	pausebtn.className = "no-fill-btn pointer";
	pausebtn.id = "pause-btn";
	pausebtn.style.bottom = (isDesktop() || isTablet() ? 20 : 15) + offset + "px";
	pausebtn.innerHTML = "Pause Tutorial";
	gesture.listen("down", pausebtn, function() {
		pausebtn.classList.add("active-no-fill-btn");
	});
	gesture.listen("up", pausebtn, function() {
		pausebtn.classList.remove("active-no-fill-btn");
	});
	gesture.listen("tap", pausebtn, function() {
		tutorial.pause();
	});
	node.appendChild(menuarrow);	
	node.appendChild(pausebtn);
	return node;
};

var favoriteMessage = function() {
	var node = document.createElement('div'),
		pausebtn = document.createElement('div'),
		offset = document.getElementById('nav').clientHeight,
		menuarrow = new Image();
	menuarrow.src = "http://assets.tagsurf.co/img/up_pointer_arrow_white.gif";
	menuarrow.id = "menu-up-arrow";
	menuarrow.className = "right-arrow";
	node.innerHTML = "Star things you<br/>really really like<br/>to save them<br/>in your favorites";
	node.className = isMobile() ? "centered biggest" : "centered really-big";
	node.style.marginTop = isMobile() ? "40%" : "18%";
	pausebtn.className = "no-fill-btn pointer";
	pausebtn.id = "pause-btn";
	pausebtn.style.bottom = (isDesktop() || isTablet() ? 20 : 15) + offset + "px";
	pausebtn.innerHTML = "Pause Tutorial";
	gesture.listen("down", pausebtn, function() {
		pausebtn.classList.add("active-no-fill-btn");
	});
	gesture.listen("up", pausebtn, function() {
		pausebtn.classList.remove("active-no-fill-btn");
	});
	gesture.listen("tap", pausebtn, function() {
		tutorial.pause();
	});
	node.appendChild(menuarrow);	
	node.appendChild(pausebtn);
	return node;
};

var shareMessage = function() {
	var node = document.createElement('div'),
		pausebtn = document.createElement('div'),
		sharebtn = new Image(),
		pointerarrow = new Image();
	node.innerHTML = "Find something<br/>you like?<br/><br/>Share it with your<br/>friends!";
	node.className = isMobile() ? "centered biggest" : "centered really-big";
	node.style.marginTop = isMobile() ? "40%" : "20%";
	sharebtn.className = "reminder-share-btn";
	sharebtn.src = "http://assets.tagsurf.co/img/share_icon.png";
	pointerarrow.src = "http://assets.tagsurf.co/img/down_pointer_arrow_white.gif";
	pointerarrow.id = "right-down-arrow";
	pausebtn.className = "no-fill-btn pointer";
	gesture.listen("down", pausebtn, function() {
		pausebtn.classList.add("active-no-fill-btn");
	});
	gesture.listen("up", pausebtn, function() {
		pausebtn.classList.remove("active-no-fill-btn");
	});
	gesture.listen("tap", pausebtn, function() {
		tutorial.pause();
	});
	pausebtn.id = "pause-btn";
	pausebtn.innerHTML = "Pause Tutorial";
	node.appendChild(pausebtn);
	node.appendChild(sharebtn);
	node.appendChild(pointerarrow);
	return node;
};

var reportMessage = function() {
	var node = document.createElement('div'),
		pausebtn = document.createElement('div'),
		reportbtn = new Image(),
		pointerarrow = new Image();
	node.innerHTML = isMobile() ? "Help us keep the<br/>#feeds clean<br/><br/>Report<br/>inappropriate<br/>content here" 
								:"Help us keep the<br/>#feeds clean<br/><br/>Report inappropriate<br/>content here";
	node.className = isMobile() ? "centered biggest" : "centered really-big";
	node.style.marginTop = isMobile() ? "40%" : "20%";
	reportbtn.className = "reminder-report-btn";
	reportbtn.src = "http://assets.tagsurf.co/img/panic_icon.png";
	pointerarrow.src = "http://assets.tagsurf.co/img/down_pointer_arrow_white.gif";
	pointerarrow.id = "left-down-arrow";
	pausebtn.className = "no-fill-btn pointer";
	gesture.listen("down", pausebtn, function() {
		pausebtn.classList.add("active-no-fill-btn");
	});
	gesture.listen("up", pausebtn, function() {
		pausebtn.classList.remove("active-no-fill-btn");
	});
	gesture.listen("tap", pausebtn, function() {
		tutorial.pause();
	});
	pausebtn.id = "pause-btn";
	pausebtn.innerHTML = "Pause Tutorial";
	node.appendChild(pausebtn);
	node.appendChild(reportbtn);
	node.appendChild(pointerarrow);
	return node;
};

var thatsAllMessage = function() {
	var node = document.createElement('div'),
		menuarrow = new Image();
	menuarrow.src = "http://assets.tagsurf.co/img/up_pointer_arrow_white.gif";
	menuarrow.id = "menu-up-arrow";
	node.innerHTML = "That's all folks<br/><br/>Signup or log in<br/>for more features<br/>and Surf On!";
	node.className = isMobile() ? "centered biggest" : "centered really-big";
	node.appendChild(menuarrow);	
	node.style.marginTop = isMobile() ? "40%" : "18%";
	return node;
};
