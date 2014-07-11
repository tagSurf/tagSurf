var modal = {
	back: document.createElement("div"),
	modal: document.createElement("div"),
	prompt: document.createElement("div"),
	topModal: document.createElement("div"),
	zoom: document.createElement("div"),
	constants: {
		zoomScale: 1.5
	},
	trans: {
		animating: false,
		callback: null,
		on: function(cb) {
			modal.trans.animating = true;
			if (cb) modal.trans.callback = cb;
		},
		off: function() {
			modal.trans.animating = false;
			if (modal.trans.callback) {
				modal.trans.callback();
				modal.trans.callback = null;
			}
		}
	},
	build: function() {
		addCss({
			".modalout": function() {
				return "-webkit-transform: " + "translate3d("
					+ window.innerWidth + "px, 0, 0);";
			}
		});
		modal.back.className = "blackout disabled";
		modal.modal.className = "modal disabled";
		modal.topModal.className = "modal disabled";
		modal.topModal.style.zIndex = 20;
		modal._buildZoom();
		modal._buildPrompt();
		document.body.appendChild(modal.back);
		document.body.appendChild(modal.modal);
		document.body.appendChild(modal.topModal);
		document.body.appendChild(modal.prompt);
		document.body.appendChild(modal.zoom);
		gesture.listen("tap", modal.back, modal.callBack);
		gesture.listen("swipe", modal.back, modal.callBack);

		gesture.listen("tap", modal.modal, modal.callModal);
		gesture.listen("swipe", modal.modal, modal.callModal);

		gesture.listen("tap", modal.topModal, modal.callTopModal);
		gesture.listen("swipe", modal.topModal, modal.callTopModal);

		gesture.listen("tap", modal.zoom, modal.callZoom);
		gesture.listen("drag", modal.zoom, modal.dragZoom);
		gesture.listen("down", modal.zoom, returnTrue);
	},
	_buildZoom: function() {
		var zNode = document.createElement('img'), 
			gesture_wrapper = document.createElement('div');
		zNode.className = 'basic-zoom';
		zNode.style.left = "0px";
		zNode.style.top = "10px";
		zNode.style.width = "100%";
		modal.zoom.style.display = "none";
		modal.zoom.className = "zoom_wrapper";
		gesture_wrapper.className = "raw_wrapper";
		gesture_wrapper.style.height = (window.innerHeight - 110) + 'px';
		modal.zoom.style.zIndex = 11;
		if(screen.width <1024)
			modal.zoom.style.height = (window.innerHeight - 50) + 'px';
		else
			modal.zoom.style.height = (window.innerHeight - 40) + 'px';
		gesture_wrapper.appendChild(zNode);
		modal.zoom.appendChild(gesture_wrapper);
		modal.zoom.large = false;
		modal.zoom.zoomed = false;
	},
	_buildPrompt: function () {
		var prompt_container = document.createElement('div');
		prompt_container.className = "prompt_container";
		prompt_container.appendChild(modal.prompt);
		modal.prompt.className = "modal_prompt disabled";
	},
	zoomModal: function () {
		return modal.modal.zcb && modal.modal.zcb();
	},
	callModal: function(direction) {
		return modal.modal.cb && modal.modal.cb(direction);
	},
	callTopModal: function(direction) {
		return modal.topModal.cb && modal.topModal.cb(direction);
	},
	callPrompt: function(direction) {
		return modal.prompt.cb && modal.prompt.cb(direction);
	},
	callBack: function() {
		return modal.back.cb && modal.back.cb();
	},
	callZoom: function(tapCount) {
		var zNode = modal.zoom.firstChild.firstChild;
		if (tapCount == 1)
		{
			if (modal.zoom.large == false)
			{
				return modal.zoom.cb && modal.zoom.cb();
			}
			else
			{
				modal.zoom.large = false;
				trans(zNode, null, "width 250ms ease-in");
				zNode.style.width = window.innerWidth + "px";
				return modal.zoom.cb && modal.zoom.cb();
			}
		}
		else if (tapCount == 2)
		{
			if (modal.zoom.large == false)
			{
				modal.zoom.large = true;
				trans(zNode, null, "width 250ms ease-in");
				zNode.style.width = (modal.constants.zoomScale * zNode.clientWidth) + "px";
			}
			else
			{
				modal.zoom.large = false;
				trans(zNode, null, "width 250ms ease-in");
				zNode.style.width = window.innerWidth + "px";
			}
		}
	},
	_backOn: function(degree, cb, injectionNode, opacity) {
		if (modal.trans.animating) {
			return modal.trans.on(function() {
				modal._backOn(degree, cb, injectionNode, opacity);
			});
		}
		modal.back.style.opacity = opacity ? opacity : 1;
		modal.back.className = "blackout " + degree + "fade";
		modal.back.cb = cb;
		if (!modal.back.on) {
			modal.back.on = true;
			modal.trans.on();
			trans(modal.back, modal.trans.off);
		}
		if (injectionNode)
			modal.back.appendChild(injectionNode);
	},
	backOn: function(cb, injectionNode, opacity) {
		modal._backOn("black", cb, injectionNode, opacity);
	},
	halfOn: function(cb, injectionNode) {
		modal._backOn("half", cb, injectionNode);
	},
	backOff: function(onOff) {
		if (modal.trans.animating) {
			return modal.trans.on(function() {
				modal.backOff(onOff);
			});
		}
		modal.back.className = "blackout";
		modal.back.cb = null;
		if (modal.back.on) {
			modal.back.on = false;
			modal.trans.on();
			trans(modal.back, function() {
				onOff && onOff();
				modal.back.className = "blackout disabled";
				if (modal.back.firstChild)
					modal.back.removeChild(modal.back.firstChild);
				modal.trans.off();
			});
		} else {
			onOff && onOff();
			if (modal.back.firstChild)
				modal.back.removeChild(modal.back.firstChild);
		}
	},
	backToggle: function(cb, isHalf) {
		var backClass = (isHalf ? "half" : "black") + "fade";
		toggleClass.call(modal.back, backClass);
		if (hasClass(modal.back, backClass)) {
			isHalf ? modal.halfOn(cb) : modal.backOn(cb);
		} else
			modal.backOff();
	},
	modalIn: function(node, cb, zcb) {
		modal.modal.on = true;
		modal.modal.innerHTML = "";
		modal.modal.appendChild(node);
		modal.modal.style.display = "block";
		modal.modal.cb = cb || modal.modalOut;
		modal.modal.zcb = zcb;
		modal.modal.className = "modal modalout disabled";
		setTimeout(function() {
			modal.modal.className = "modal modalslide";
		}, 0);
	},
	modalOut: function() {
		modal.modal.on = false;
		modal.modal.className = "modal modalout";
		modal.modal.cb = null;
		trans(modal.modal, function (event){
			modal.modal.className = "modal disabled";
			modal.modal.style.display = "none";
		});
	},
	topModalIn: function(node, cb) {
		modal.topModal.on = true;
		modal.topModal.innerHTML = "";
		modal.topModal.appendChild(node);
		modal.topModal.style.display = "block";
		modal.topModal.cb = cb || modal.topModalOut;
		modal.topModal.className = "modal modalout disabled";
		setTimeout(function() {
			modal.topModal.className = "modal modalslide";
		}, 0);
		if (!modal.back.on) {
			modal.backOn();
			modal.topModal.backed = true;
		}
	},
	topModalOut: function() {
		modal.topModal.on = false;
		modal.topModal.className = "modal modalout";
		modal.topModal.cb = null;
		trans(modal.topModal, function (event){
			modal.topModal.className = "modal disabled";
			modal.topModal.style.display = "none";
		});
		if (modal.topModal.backed) {
			modal.topModal.backed = false;
			modal.backOff();
		}
	},
	promptIn: function(node, cb) {
		if (modal.prompt.on)
			return;
		modal.prompt.on = true;
		modal.prompt.innerHTML = "";
		modal.prompt.appendChild(node);
		modal.prompt.cb = cb || modal.promptOut;
		modal.backOn();
		modal.prompt.className = "modal_prompt disabled";
		setTimeout(function() {
			modal.prompt.className = "modal_prompt opaque";
		}, 0);
	},
	promptOut: function() {
		modal.prompt.on = false;
		modal.prompt.className = "modal_prompt";
		modal.prompt.cb = null;
		modal.prompt.style.opacity = 0;
		modal.backOff();
		trans(modal.prompt, function (event){
			modal.prompt.className = "modal_prompt disabled";
		});
	},
	zoomIn: function (card, cb) {
		modal.zoom.zoomed = true;
		modal.zoom.firstChild.firstChild.src = image.get(card).url;
		modal.zoom.cb = cb || modal.zoomOut;
		modal.zoom.style.display = "block";
		modal.zoom.style['opacity'] = "1.0";
	},
	zoomOut: function () {
		modal.zoom.zoomed = false;
		modal.zoom.cb = null;
		modal.zoom.style.opacity = 0;
		trans(modal.zoom, function (event){
			modal.zoom.style.display = "none";
		});
	},
	dragZoom: function (direction, distance, dx, dy) {
		var zNodeContainer = modal.zoom,
			atTop = (zNodeContainer.scrollTop === 0),
			atRight = (zNodeContainer.scrollLeft === 0),
			atBottom = (zNodeContainer.scrollHeight - zNodeContainer.scrollTop 
				=== zNodeContainer.clientHeight),
			atLeft = (zNodeContainer.scrollWidth - zNodeContainer.scrollLeft
				=== zNodeContainer.clientWidth);
		if ((atTop && direction == "down") ||
			(atBottom && direction == "up") ||
			(atLeft && direction == "left") ||
			(atRight && direction == "right"))
		{
			return;
		}
		return true;
	}
};
modal.build();
