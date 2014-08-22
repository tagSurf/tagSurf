var tutorialOn = false;

var startTutorial = function () {
	tutorialOn = true;
	newReminder(welcomeMessage.call(), function() {
		if (tutorialOn)
			newReminder(upvoteMessage.call(), function() {
				if (tutorialOn) {
					newReminder(downvoteMessage.call(), null, "Downvote", 2000, 5000);
					current_deck.topCard().setOneTimeCb("vote", function () { 
						if (tutorialOn)
							newReminder(firstvoteMessage.call(), null, "First Vote", 1000, 5000); 
						tutorialOn = false;
					});
				}
		}, "Upvote", 5000, 5000);
	}, "Welcome", 1000, 6000);
};

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
	bottomMessage.className = isMobile() ? "centered biggest" : "centered really-big" ;
	node.appendChild(topMessage);
	node.appendChild(logo);
	node.appendChild(bottomMessage);
	return node;
};

var upvoteMessage = function() {
	var node = document.createElement('div'),
		upvotebtn = new Image(),
		upvotearrow = new Image();
	upvotebtn.src = "http://assets.tagsurf.co/img/upvote_btn.png";
	upvotebtn.id = "reminder-vote-button-right";
	upvotearrow.src = "http://assets.tagsurf.co/img/upvote_arrow.gif";
	upvotearrow.id = "reminder-upvote-arrow";
	node.innerHTML = isMobile ? "Upvote this <br/>and we'll show it<br/>to more people<br/>surfing this tag"
								: "Upvote this and we'll show it<br/>more to people surfing this tag";
	node.className = isMobile() ? "centered biggest" : "centered really-big" ;
	node.appendChild(upvotearrow);	
	node.appendChild(upvotebtn);
	node.style.marginTop = isMobile() ? "50%" : "22%";
	return node;
};

var downvoteMessage = function() {
	var node = document.createElement('div'),
		downvotebtn = new Image(),
		downvotearrow = new Image();
	downvotebtn.src = "http://assets.tagsurf.co/img/downvote_btn.png";
	downvotebtn.id = "reminder-vote-button-left";
	downvotearrow.src = "http://assets.tagsurf.co/img/downvote_arrow.gif";
	downvotearrow.id = "reminder-downvote-arrow";
	node.innerHTML = "Downvote it<br/>and we'll show it<br/>less";
	node.className = isMobile() ? "centered biggest" : "centered really-big" ;
	node.appendChild(downvotearrow);	
	node.appendChild(downvotebtn);
	node.style.marginTop = isMobile() ? "50%" : "23%";
	return node;
};

var firstvoteMessage = function() {
	var node = document.createElement('div');
	node.innerHTML = "Great job!<br/>Everyone gets a better feed<br/>when you vote";
	node.className = isMobile() ? "centered biggest" : "centered really-big" ;
	node.style.marginTop = isMobile() ? "50%" : "23%";
	return node;
};

var keepgoingPrompt = function() {
	var node = document.createElement('div');
	node.innerHTML = "Keep going and we'll<br/>find you some tags to surf";
	node.className = isMobile() ? "centered biggest" : "centered really-big" ;
	node.style.marginTop = isMobile() ? "50%" : "23%";
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
