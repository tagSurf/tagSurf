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
			panicButton = document.createElement("button");
		panicMessage.className = "really-big share-heading-margin";
		panicMessage.innerHTML = "Is this card too much for you?";
		panicButton.innerHTML = "Get this card away from me!";
		gesture.listen("tap", panicButton, function() {
			panic.cb && panic.cb();
			panic.close();
		});
		panic.content.appendChild(panicMessage);
		panic.content.appendChild(panicButton);
		panic.content.className = "centered";
	},
	_buildButton: function () {
		var panicIcon = document.createElement("img");
		panicIcon.src = "/img/panic.png";
		panicIcon.id = "panic-icon";
		panic.button.id = "panic-button";
		gesture.listen("tap", panic.button, function () {
			if (panic.panicModalOut)
				panic.close();
			else {
				modal.topModalIn(panic.content, panic.close);
				panic.panicModalOut = true;
			}
		});
		panic.button.appendChild(panicIcon);
		document.body.appendChild(panic.button);
	},
	close: function() {
		modal.topModalOut();
		panic.panicModalOut = false;
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
