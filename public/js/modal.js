var modal = {
	black: document.createElement("div"),
	modal: document.createElement("div"),
	build: function() {
		addCss(".modal { -webkit-transform: translate3d("
			+ window.innerWidth + "px, 0, 0); }");
		modal.black.className = "blackout";
		modal.modal.className = "modal";
		document.body.appendChild(modal.black);
		document.body.appendChild(modal.modal);
	},
	blackOn: function(cb) {
		modal.black.className = "blackout blackfade";
		modal.black.onclick = cb;
	},
	halfOn: function(cb) {
		modal.black.className = "blackout halffade";
		modal.black.onclick = cb;
	},
	blackOff: function() {
		modal.black.className = "blackout";
		modal.black.onclick = null;
	},
	blackToggle: function() {
		toggleClass.call(modal.black, "blackfade");
	},
	modalIn: function(node, cb) {
		modal.modal.innerHTML = "";
		modal.modal.appendChild(node);
		modal.modal.onclick = cb;
		modal.modal.className = "modal modalslide";
	},
	modalOut: function() {
		modal.modal.className = "modal";
		modal.modal.onclick = null;
	}
};
modal.build();