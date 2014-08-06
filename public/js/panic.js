var panic = {
	cb: null,
	data: null,
	panicModalOut: false,
	button: document.createElement("div"),
	content: document.createElement("div"),
	build: function () {
		panic._buildContent();
		panic._buildButton();
	},
	_buildContent: function () {
		var panicMessage = document.createElement("div"),
			getAwayButton = document.createElement("div"),
			closebtn = document.createElement('img');
		panicMessage.className = "really-big share-heading-margin";
		panicMessage.innerHTML = "Is this card too much for you?";
		getAwayButton.innerHTML = "Get this card away from me!";
		getAwayButton.className = "msgbox-btn";
		getAwayButton.id = "get-away-button";
		closebtn.src = "http://assets.tagsurf.co/img/Close.png";
		closebtn.className = "modal-close-button";
		closebtn.id = "panic-close-button";
		gesture.listen("tap", getAwayButton, function() {
			xhr("/api/media/" + panic.data.id + "/report", "POST");
			panic.cb && panic.cb();
			panic.close();
		});
		gesture.listen("down", getAwayButton, function () {
		    getAwayButton.classList.add('ts-active-button');
	    });
		gesture.listen("up", getAwayButton, function () {
		    getAwayButton.classList.remove('ts-active-button');
	    });
		panic.content.appendChild(panicMessage);
		panic.content.appendChild(getAwayButton);
		panic.content.appendChild(closebtn);
		panic.content.className = "centered";
	},
	_buildButton: function () {
		var panicIcon = document.createElement("img");
		panicIcon.src = "http://assets.tagsurf.co/img/panic_icon.png";
		panicIcon.id = "panic-icon";
		panic.button.id = "panic-button";
		gesture.listen('down', panic.button, function () {
			panicIcon.src = "http://assets.tagsurf.co/img/panic_icon-invert.png";
		});
		gesture.listen('up', panic.button, function () {
			panicIcon.src = "http://assets.tagsurf.co/img/panic_icon.png";
		});
		gesture.listen("tap", panic.button, function () {
			if (panic.panicModalOut) {
				panic.close();
				analytics.track('Close Panic Window', {
					card: panic.data.id,
					surfing: current_tag
				});
			}
			else {
				if (share.shareModalOut)
					share.close();
				modal.topModalIn(panic.content, panic.close);
				panic.panicModalOut = true;
				analytics.track('Open Panic Window', {
					card: panic.data.id,
					surfing: current_tag
				});
			}
		});
		panic.button.appendChild(panicIcon);
		document.body.appendChild(panic.button);
	},
	close: function() {
		modal.topModalOut();
		panic.panicModalOut = false;
		analytics.track('Close Panic Window', {
			card: panic.data.id,
			surfing: current_tag
		});
	},
	on: function (data, cb) {
		panic.cb = cb;
		panic.data = data;
		toggleClass.call(panic.button, "panic-active", "on");
	},
	off: function () {
		toggleClass.call(panic.button, "panic-active", "off");
	}
};
panic.build();
