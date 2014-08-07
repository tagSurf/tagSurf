var reminder = {
	container: document.createElement('div'),
	timeout: null,
	forget: function() {
		if (reminder.timeout) {
			document.body.removeChild(reminder.container);
			clearTimeout(reminder.timeout);
			reminder.timeout = null;
		}
	},
	close: function(direction) {
		reminder.forget();
		if (reminder.container.isOn && direction != "up" && direction != "down")
		{
			reminder.container.isOn = false;
			reminder.container.style.opacity = 0;			
			trans(reminder.container, function() {
				reminder.container.parentNode.removeChild(reminder.container);
				reminder.timeout = null;
			});
			analytics.track('Close Swipe Reminder');
		}
	},
	startTimeout: function () {
		if(DEBUG || isAuthorized())
			return;
		reminder.timeout = setTimeout(function () {
			reminder.container.isOn = true;
			reminder.container.style.visibility = "visible";
			reminder.container.style.zIndex = "100";
			reminder.container.style.opacity = 1;
			if(isDesktop())
				analytics.track('Seen Desktop Swipe Reminder');
			else
				analytics.track('Seen Mobile Swipe Reminder');
		}, 14000);
	},
	_build: function () {
		var closeContainer = document.createElement('div'),
			close = document.createElement('img');
			leftImage = new Image(), rightImage = new Image();
		reminder.container.id = "reminder-container";
		close.className = "reminder-close";
		close.src = "http://assets.tagsurf.co/img/Close.png";
		closeContainer.appendChild(close);
		reminder.container.appendChild(closeContainer);
		leftImage.id = "reminder-left";
		rightImage.id = "reminder-right";
		if(isDesktop()) {
			var closeInstructions = new Image();
			closeInstructions.className = "close-instructions block";
			closeInstructions.src="http://assets.tagsurf.co/img/clearscreen.png";
			reminder.container.appendChild(closeInstructions);
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
		reminder.container.appendChild(leftImage);
		reminder.container.appendChild(rightImage);
		gesture.listen("drag", reminder.container, function (direction) {
			if (direction != "left" && direction != "right")
			{
				return true;
			}
		});
		gesture.listen("down", reminder.container, returnTrue);
		gesture.listen('down', closeContainer, reminder.close);
		gesture.listen("tap", reminder.container, reminder.close);
		gesture.listen("swipe", reminder.container, reminder.close);
		document.body.appendChild(reminder.container);
	}
};
reminder._build();