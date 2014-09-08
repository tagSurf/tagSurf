var reminders = [];

var reminder_proto = {
	forget: function(remove) {
		if(!this.timeout) 
			return;
		if(this.isOn){
			this.close();
			return;
		}
		clearTimeout(this.timeout);
		this.timeout = null;
		if (remove)
			this.remove();
		if(isDesktop())
			analytics.track('Forget Desktop ' + this.type + ' Reminder');
		else
			analytics.track('Forget Mobile ' + this.type + ' Reminder');
	},
	remove: function() {
		var self = this;
		if (this.built)
			setTimeout(function () { document.body.removeChild(self.container);}, 100);
		this.timeout = null;
		if (reminders.indexOf(this) != -1)
			reminders.splice(reminders.indexOf(this), 1);
	},
	close: function(direction) {
		var self = this;
		if(!self.isOn)
			return;
		if(direction != "up" && direction != "down") {
			var container = document.getElementById(self.type + '-reminder-container');
			self.isOn = false;
			self.container.style.opacity = 0;
			this.remove();			
			if(isDesktop())
				analytics.track('Close Desktop ' + this.type + ' Reminder');
			else
				analytics.track('Close ' + this.type + ' Reminder');
			self.closeCb && self.closeCb();
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
		this.showCb && this.showCb();
	},
	setCb: function(type, cb){
		switch(type) {
			case "show":
				this.showCb = cb ? cb : this.showCb;
				break;
			case "close":
				this.closeCb = cb ? cb : this.closeCb;
				break;
		}
	},
	startTimeout: function(time) {
		var self = this;
		if(this.timeout || !document.getElementById(this.type + '-reminder-container'))
			return;
		this.timeout = setTimeout(function () { 
			if(self.duration) 
				setTimeout(function() { self.close(); }, self.duration);
			self.show();  
		}, (time) ? time : self.delay);
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
		this.built = true;
	}
};

var newReminder = function(node, cb, type, delay, duration) {
	var reminder = reminders[reminders.length] = Object.create(reminder_proto);
	reminder.container = document.createElement('div');
	reminder.timeout = null;
	reminder.isOn = false;
	reminder.built = false;
	reminder.closeCb = cb;
	reminder.type = type;
	reminder.delay = delay;
	reminder.node = node;
	reminder.duration = duration;
	reminder.zIndex = 100;
	reminder._build();
	return reminder;
};

var forgetReminders = function(remove) {
	reminders.forEach(function (reminder) { reminder.forget(remove); });
};

var closeReminders = function() {
	reminders.forEach(function (reminder) { reminder.close(); });
};

var slowReminder = null;

setTimeout(function() {
	slowReminder = newReminder(slowMessage.call(), null, "Slow", 10000, 5000);
}, 2000);

var slowMessage = function() {
	var node = document.createElement('div'),
		reloadbtn = document.createElement('div'),
		waitbtn = document.createElement('div');
	node.innerHTML = "Opps<br/>Looks like our<br/>connection is<br/>lagging";
	node.className = isMobile() ? "centered biggest" : "centered really-big";
	node.style.marginTop = isMobile() ? "35%" : "18%";
	node.style.marginTop = isUIWebView() ? "50%" : node.style.marginTop;
	waitbtn.className = "no-fill-btn pointer";
	gesture.listen("down", waitbtn, function() {
		waitbtn.classList.add("active-no-fill-btn");
	});
	gesture.listen("up", waitbtn, function() {
		waitbtn.classList.remove("active-no-fill-btn");
	});
	gesture.listen("tap", waitbtn, function() {
		reminders[0].close();
		newReminder(reallySlowMessage.call(), null, "Really Slow", 10000, 5000);
	});
	waitbtn.id = "wait-btn";
	waitbtn.innerHTML = "Keep Waiting";
	node.appendChild(waitbtn);	
	reloadbtn.className = "no-fill-btn pointer";
	gesture.listen("down", reloadbtn, function() {
		reloadbtn.classList.add("active-no-fill-btn");
	});
	gesture.listen("up", reloadbtn, function() {
		reloadbtn.classList.remove("active-no-fill-btn");
	});
	gesture.listen("tap", reloadbtn, function() {
		location.reload();
	});
	reloadbtn.id = "reload-btn";
	reloadbtn.innerHTML = "Reload Page";
	node.appendChild(reloadbtn);
	return node;
};

var reallySlowMessage = function() {
	var node = document.createElement('div'),
		reloadbtn = document.createElement('div');
	node.innerHTML = "Still Lagging...<br/><br/>Let's try again";
	node.className = isMobile() ? "centered biggest" : "centered really-big";
	node.style.marginTop = isMobile() ? "50%" : "24%";
	node.style.marginTop = isUIWebView() ? "70%" : node.style.marginTop;
	reloadbtn.className = "no-fill-btn pointer";
	gesture.listen("down", reloadbtn, function() {
		reloadbtn.classList.add("active-no-fill-btn");
	});
	gesture.listen("up", reloadbtn, function() {
		reloadbtn.classList.remove("active-no-fill-btn");
	});
	gesture.listen("tap", reloadbtn, function() {
		location.reload();
	});
	reloadbtn.id = "reload-btn";
	reloadbtn.style.bottom = "26%";
	reloadbtn.innerHTML = "Reload Page";
	node.appendChild(reloadbtn);
	return node;
};
