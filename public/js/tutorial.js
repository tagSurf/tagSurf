var startOrientation = function () {
	// newReminder(swipeReminder.call(), null, "Swipe", 13000);
	newReminder(welcomeMessage.call(), function() {
		newReminder(downvoteMessage.call(), null, "downvote", 3000, 3000);
	}, "Test", 3000, 3000);
};

var welcomeMessage = function() {
	var node = document.createElement('div'),
		upvotebtn = new Image();
	upvotebtn.src = "http://assets.tagsurf.co/img/upvote_btn.png";
	upvotebtn.id = "reminder-vote-button-right";
	node.innerHTML = "<p>Upvote it and we'll<br/>show it to more people<br/>who surf this tag</p>";
	node.className = "centered really-big";
	node.appendChild(upvotebtn);
	node.style.marginTop = "20%";
	return node;
};

var downvoteMessage = function() {
	var node = document.createElement('div'),
		downvotebtn = new Image();
	downvotebtn.src = "http://assets.tagsurf.co/img/downvote_btn.png";
	downvotebtn.id = "reminder-vote-button-left";
	node.innerHTML = "<p>Downvote it and we'll...<br/><br/>well you get the point</p>";
	node.className = "centered really-big";
	node.appendChild(downvotebtn);
	node.style.marginTop = "20%";
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
