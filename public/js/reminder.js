var reminder = {
	reminderContainer : document.createElement('div'),
	reminderTimeout : null,
	forgetReminder : function() {
		if (reminder.reminderTimeout) {
			document.body.removeChild(reminder.reminderContainer);
			clearTimeout(reminder.reminderTimeout);
			reminder.reminderTimeout = null;
		}
	},
	closeReminder : function(direction) {
		var remindContainer = reminder.reminderContainer;
		reminder.forgetReminder();
		if (remindContainer.isOn && direction != "up" && direction != "down")
		{
			remindContainer.isOn = false;
			remindContainer.style.opacity = 0;			
			trans(remindContainer, function() {
				remindContainer.parentNode.removeChild(remindContainer);
				reminder.reminderTimeout = null;
			});
			analytics.track('Close Swipe Reminder');
		}
	},
	setReminderTimeout : function () {
		var closeContainer = document.createElement('div'),
			close = document.createElement('img'),
			remindContainer = reminder.reminderContainer;
			leftImage = new Image(), rightImage = new Image();
		remindContainer.id = "reminder-container";
		close.className = "reminder-close";
		close.src = "http://assets.tagsurf.co/img/Close.png";
		closeContainer.appendChild(close);
		remindContainer.appendChild(closeContainer);
		leftImage.id = "reminder-left";
		rightImage.id = "reminder-right";
		if(isDesktop()) {
			var closeInstructions = new Image();
			closeInstructions.className = "close-instructions block";
			closeInstructions.src="http://assets.tagsurf.co/img/clearscreen.png";
			remindContainer.appendChild(closeInstructions);
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
		remindContainer.appendChild(leftImage);
		remindContainer.appendChild(rightImage);
		gesture.listen("drag", remindContainer, function (direction) {
			if (direction != "left" && direction != "right")
			{
				return true;
			}
		});
		gesture.listen("down", remindContainer, returnTrue);
		gesture.listen('down', closeContainer, reminder.closeReminder);
		gesture.listen("tap", remindContainer, reminder.closeReminder);
		gesture.listen("swipe", remindContainer, reminder.closeReminder);
		document.body.appendChild(remindContainer);
		if(DEBUG || isAuthorized())
			return;
		reminder.reminderTimeout = setTimeout(function () {
			remindContainer.isOn = true;
			remindContainer.style.visibility = "visible";
			remindContainer.style.zIndex = "100";
			remindContainer.style.opacity = 1;
			if(isDesktop())
				analytics.track('Seen Desktop Swipe Reminder');
			else
				analytics.track('Seen Mobile Swipe Reminder');
		}, 14000);
	}
};