var tutorial = {
	on: false,
	paused: false,
	start: function() {
		tutorial.on = true;
		newReminder(welcomeMessage.call(), function() {
			newReminder(upvoteMessage.call(), function() {
				newReminder(downvoteMessage.call(), null, "Downvote", 2000, 5000);
				current_deck.topCard().setOneTimeCb("vote", function () { 
					newReminder(firstvoteMessage.call(), buildKeepGoing, "First Vote", 1000, 5000); 
					// tutorial.on = false;
					});
			}, "Upvote", 5000, 5000);
		}, "Welcome", 1000, 6000);
	},
	pause: function() {
		if(!reminders[0] || !tutorial.on)
			return
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
		tutorial.on = true;
		tutorial.paused = false;
		reminders[0].startTimeout(timeout);
	}
};

var buildKeepGoing = function() {
	var keepgoing = newReminder(keepgoingPrompt.call(), null, "Keep Going", 15000, 5000);
	current_deck.topCard().setOneTimeCb("vote", function() { keepgoing.forget(true); });
}

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
	bottomMessage.innerHTML = isMobile() ? "A place to surf the <br/> top social content<br/>on the web" 
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
	node.innerHTML = isMobile ? "Upvote this<br/>and we'll show<br/>you more things<br/>like it"
								: "Upvote this and we'll show you<br/>more things like it";
	node.className = isMobile() ? "centered biggest" : "centered really-big";
	node.appendChild(upvotearrow);	
	node.appendChild(upvotebtn);
	node.style.marginTop = isMobile() ? "50%" : "22%";
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

var downvoteMessage = function() {
	var node = document.createElement('div'),
		pausebtn = document.createElement('div'),
		downvotebtn = new Image(),
		downvotearrow = new Image();
	downvotebtn.src = "http://assets.tagsurf.co/img/downvote_btn.png";
	downvotebtn.id = "reminder-vote-button-left";
	downvotearrow.src = "http://assets.tagsurf.co/img/downvote_arrow.gif";
	downvotearrow.id = "reminder-downvote-arrow";
	node.innerHTML = "Downvote it<br/>and we'll show<br/>less of this<br/>stuff";
	node.className = isMobile() ? "centered biggest" : "centered really-big";
	node.appendChild(downvotearrow);	
	node.appendChild(downvotebtn);
	node.style.marginTop = isMobile() ? "50%" : "23%";
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

var resumeMessage = function() {
	var node = document.createElement('div'),
		menuarrow = new Image();
	menuarrow.src = "/img/up_pointer_arrow_white.gif";
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
	node.style.marginTop = isMobile() ? "50%" : "23%";
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
	node.innerHTML = isMobile() ? "Keep going and<br/>we'll find you some<br/>tags to surf" 
									: "Keep going and we'll<br/>find you some tags to surf";
	node.className = isMobile() ? "centered biggest" : "centered really-big";
	node.style.marginTop = isMobile() ? "50%" : "23%";
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

var swipeReminder = function () {
	var leftImage = new Image(), rightImage = new Image(),
		node = document.createElement('div');
	leftImage.id = "reminder-left";
	rightImage.id = "reminder-right";
	if(isDesktop()) {
		var closeInstructions = new Image();
		closeInstructions.className = "close-instructions block";
		closeInstructions.src="http://assets.tagsurf.co/img/clearscreen.png";
		node.appendChild(closeInstructions);
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
	node.appendChild(leftImage);
	node.appendChild(rightImage);
	return node;
};
