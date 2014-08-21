var reminders = [];

var reminder_proto = {
	forget: function() {
		if(!this.timeout) 
			return;
		if(this.isOn){
			this.close();
			return;
		}
		clearTimeout(this.timeout);
		this.timeout = null;
		if(isDesktop())
			analytics.track('Forget Desktop ' + this.type + ' Reminder');
		else
			analytics.track('Forget Mobile ' + this.type + ' Reminder');
	},
	close: function(direction) {
		var self = this;
		if(!self.isOn)
			return;
		if(direction != "up" && direction != "down") {
			var container = document.getElementById(self.type + '-reminder-container');
			self.isOn = false;
			self.container.style.opacity = 0;
			setTimeout(function () { document.body.removeChild(self.container);}, 100);
			self.timeout = null;
			for(var i = 0; i < reminders.length; ++i){
				if (reminders[i] == self)
					reminders.splice(i,1);
			}			
			analytics.track('Close ' + self.type + ' Reminder');
			self.cb && self.cb();
		}
		else
			if(DEBUG)
				console.log("Error: reminder close direction == 'up' || 'down'");
	},
	show: function() {
		for (var i = 0; i < reminders.length; ++i)
			if(reminders[i].isOn && (reminders[i].zIndex >= this.zIndex))
				this.zIndex = reminders[i].zIndex + 1;
		this.isOn = true;
		this.container.style.zIndex = this.zIndex;
		this.container.style.visibility = "visible";
		this.container.style.opacity = 1;
		if(isDesktop())
			analytics.track('Seen Desktop ' + this.type + ' Reminder');
		else
			analytics.track('Seen Mobile ' + this.type + ' Reminder');
	},
	startTimeout: function(time) {
		var self = this;
		if(this.timeout || !document.getElementById(this.type + '-reminder-container'))
			return;
		this.timeout = setTimeout(function () { 
			if(self.duration) 
				setTimeout(function() { self.close(); }, self.duration);
			self.show();  
		}, (time) ? time : 14000);
	},
	_build: function () {
		var self = this,
			container = this.container = document.createElement('div'),
			closeContainer = document.createElement('div'),
			close = document.createElement('img');
		container.id = this.type + "-reminder-container";
		container.className = "reminder-container";
		container.style.visibility = "hidden";
		container.style.opacity = 0;
		close.className = "reminder-close";
		close.src = "http://assets.tagsurf.co/img/Close.png";
		closeContainer.appendChild(close);
		if(this.node)
			container.appendChild(this.node);
		else if (DEBUG)
			console.log("Error: no contents for reminder container");
		gesture.listen("drag", self.container, function (direction) {
			if (direction != "left" && direction != "right")
			{
				return true;
			}
		});
		container.appendChild(closeContainer);
		document.body.appendChild(container);
		gesture.listen("down", self.container, returnTrue);
		gesture.listen('down', closeContainer, function() { self.close(); });
		gesture.listen("tap", self.container, function() { self.close(); });
		gesture.listen("swipe", self.container, function() { self.close(); });
		this.startTimeout(this.delay);
	}
};

var newReminder = function(node, cb, type, delay, duration) {
	var reminder = reminders[reminders.length] = Object.create(reminder_proto);
	reminder.container = document.createElement('div');
	reminder.timeout = null;
	reminder.isOn = false;
	reminder.cb = cb;
	reminder.type = type;
	reminder.delay = delay;
	reminder.node = node;
	reminder.duration = duration;
	reminder.zIndex = 100;
	reminder._build();
	return reminder;
};

var forgetReminders = function() {
	reminders.forEach(function (reminder) { reminder.forget(); });
};

var closeReminders = function() {
	reminders.forEach(function (reminder) { reminder.close(); });
};
