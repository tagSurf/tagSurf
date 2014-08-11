var startFirstOrientation = function () {
	var swipeReminder, swipeReminderContents;
	swipeReminder = newReminder(welcomeMessage.call(), null, "Welcome", 3000);
};

var welcomeMessage = function() {
	var node = document.createElement('div');
	node.innerHTML = "<p>Hi I'm tagSurf<br><br><br> Follow me to the best stuff on the Internet</p>";
	node.className = "centered really-big";
	node.style.marginTop = "20%";
	return node;
}

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
