var reminder = {
	container: document.createElement('div'),
	timeout: null,
	cb: null,
	type: null,
	isOn: false,
	forget: function() {
		if(!reminder.timeout) 
			return;
		clearTimeout(reminder.timeout);
		reminder.timeout = null;
		if(isDesktop())
			analytics.track('Forget Desktop ' + reminder.type + ' Reminder');
		else
			analytics.track('Forget Mobile ' + reminder.type + ' Reminder');
	},
	close: function(direction) {
		if(!reminder.isOn)
			return;
		if(direction != "up" && direction != "down") {
			reminder.isOn = false;
			reminder.container.style.opacity = 0;
			reminder.timeout = null;			
			analytics.track('Close ' + reminder.type + ' Reminder');
			reminder.cb && reminder.cb();
		}
		else
			if(DEBUG)
				console.log("Error: reminder close direction == 'up' || 'down'");
	},
	startTimeout: function(time) {
		if(reminder.timeout || !document.getElementById('reminder-container'))
			return;
		reminder.timeout = setTimeout(function () {
			reminder.isOn = true;
			reminder.container.style.visibility = "visible";
			reminder.container.style.zIndex = "100";
			reminder.container.style.opacity = 1;
			if(isDesktop())
				analytics.track('Seen Desktop ' + reminder.type + ' Reminder');
			else
				analytics.track('Seen Mobile ' + reminder.type + ' Reminder');
		}, (time) ? time : 14000);
	},
	create: function(node, cb, type, delay) {
		reminder.cb = (typeof cb === "undefined") ? reminder.cb : cb;
		reminder.type = (typeof type === "undefined") ? "Swipe" : type;
		if(reminder.timeout)
			reminder.forget();
		if(document.getElementById('reminder-container'))
			document.body.removeChild(reminder.container);
		reminder._build(node, type, delay);
	},
	_build: function (node, type, delay) {
		var closeContainer = document.createElement('div'),
			close = document.createElement('img');
		reminder.container.id = "reminder-container";
		close.className = "reminder-close";
		close.src = "http://assets.tagsurf.co/img/Close.png";
		closeContainer.appendChild(close);
		if(node)
			reminder.container.appendChild(node);
		else if(type == "Swipe"){
			var leftImage = new Image(), rightImage = new Image();
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
		}
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
		reminder.container.appendChild(closeContainer);
		document.body.appendChild(reminder.container);
		reminder.startTimeout(delay);
	}
};