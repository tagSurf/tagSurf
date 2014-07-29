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
		var panicBlurb = document.createElement("div"),
			panicButton = document.createElement("button");
		panicBlurb.innerHTML = "Is this card too much for you?";
		panicButton.innerHTML = "Get this card away from me!";
		gesture.listen("tap", panicButton, function() {
			panic.cb && panic.cb();
		});
		panic.content.appendChild(panicBlurb);
		panic.content.appendChild(panicButton);
	},
	_buildButton: function () {
		var panicIcon = document.createElement("img");
		panicIcon.src = "/img/panic.png";
		panicIcon.id = "panic-icon";
		panic.button.id = "panic-button";
		gesture.listen("tap", panic.button, function () {
			if (panic.panicModalOut) {
				modal.topModalOut();
				panic.panicModalOut = false;
			} else {
				modal.topModalIn(panic.content, function() {
					modal.topModalOut();
					panic.panicModalOut = false;
				});
				panic.panicModalOut = true;
			}
		});
		panic.button.appendChild(panicIcon);
		document.body.appendChild(panic.button);
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
