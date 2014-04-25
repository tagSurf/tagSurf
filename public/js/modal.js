var modal = {
	back: document.createElement("div"),
	modal: document.createElement("div"),
	build: function() {
		addCss(".modal { -webkit-transform: translate3d("
			+ window.innerWidth + "px, 0, 0); }");
		modal.back.className = "blackout";
		modal.modal.className = "modal";
		document.body.appendChild(modal.back);
		document.body.appendChild(modal.modal);
		gesture.listen("tap", modal.back, modal.callBack);
		gesture.listen("swipe", modal.back, modal.callBack);
		gesture.listen("tap", modal.modal, modal.callModal);
		gesture.listen("swipe", modal.modal, modal.callModal);
		gesture.listen("up", modal.modal, modal._passThrough);
		gesture.listen("down", modal.modal, modal._passThrough);
		gesture.listen("drag", modal.modal, modal._passThroughUD);
	},
	_passThrough: function() {
		return true;
	},
	_passThroughUD: function(direction) {
		return (direction == "up" || direction == "down");
	},
	callModal: function(direction) {
		return modal.modal.cb && modal.modal.cb(direction);
	},
	callBack: function() {
		return modal.back.cb && modal.back.cb();
	},
	backOn: function(cb) {
		modal.back.className = "blackout blackfade";
		modal.back.cb = cb;
	},
	halfOn: function(cb, injectionNode) {
		if (injectionNode)
			modal.back.appendChild(injectionNode);
		modal.back.className = "blackout halffade";
		modal.back.cb = cb;
	},
	backOff: function(onOff) {
		modal.back.className = "blackout";
		modal.back.cb = null;
		if (onOff || modal.back.firstChild) {
			onTrans(modal.back, function() {
				onOff && onOff();
				if (modal.back.firstChild)
					modal.back.removeChild(modal.back.firstChild);
			});
		}
	},
	backToggle: function(cb, isHalf) {
		var backClass = (isHalf ? "half" : "black") + "fade";
		toggleClass.call(modal.back, backClass);
		modal.back.cb = modal.back.hasClass(backClass) ? cb : null;
	},
	modalIn: function(node, cb) {
		modal.modal.innerHTML = "";
		modal.modal.appendChild(node);
		modal.modal.cb = cb;
		modal.modal.className = "modal modalslide";
	},
	modalOut: function() {
		modal.modal.className = "modal";
		modal.modal.cb = null;
	}
};
modal.build();