var modal = {
	back: document.createElement("div"),
	modal: document.createElement("div"),
	zoom: document.createElement("div"),
	constants: {
		zoomScale: 1.5
	},
	trans: {
		animating: false,
		callback: null,
		on: function(cb) {
			modal.trans.animating = true;
			modal.trans.callback = cb;
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
			".modal": function() {
				return "-webkit-transform: " + "translate3d("
					+ window.innerWidth + "px, 0, 0);";
			}
		});
		modal.back.className = "blackout";
		modal.modal.className = "modal hider";
		modal._buildZoom();
		document.body.appendChild(modal.back);
		document.body.appendChild(modal.modal);
		document.body.appendChild(modal.zoom);
		gesture.listen("tap", modal.zoom, modal.callZoom);
		gesture.listen("tap", modal.back, modal.callBack);
		gesture.listen("swipe", modal.back, modal.callBack);
		gesture.listen("tap", modal.modal, modal.callModal);
		gesture.listen("swipe", modal.modal, modal.callModal);
		gesture.listen("drag", modal.zoom, modal.dragZoom);
		gesture.listen("down", modal.zoom, modal._passThrough);
		gesture.listen("up", modal.modal, modal._passThrough);
		gesture.listen("down", modal.modal, modal._passThrough);
		gesture.listen("drag", modal.modal, modal._passThroughUD);
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
		modal.zoom.style.zIndex = 3;
		gesture_wrapper.appendChild(zNode);
		modal.zoom.appendChild(gesture_wrapper);
		modal.zoom.large = false;
		modal.zoom.zoomed = false;
	},
	_passThrough: function() {
		return true;
	},
	_passThroughUD: function(direction) {
		return (direction == "up" || direction == "down");
	},
	callModal: function(direction) {
		if (modal.trans.animating)
			return modal.trans.on(modal.callModal);
		return modal.modal.cb && modal.modal.cb(direction);
	},
	callBack: function() {
		if (modal.trans.animating)
			return modal.trans.on(modal.callBack);
		return modal.back.cb && modal.back.cb();
	},
	callZoom: function(tapCount) {
		if (modal.trans.animating)
			return modal.trans.on(modal.callZoom);
		if (tapCount == 1)
		{
			if (modal.zoom.large == false)
			{
				return modal.zoom.cb && modal.zoom.cb();
			}
		}
		else if (tapCount == 2)
		{
			var zNode = modal.zoom.firstChild.firstChild;
			modal.trans.on();
			trans(zNode, modal.trans.off, "width 250ms ease-in");
			if (modal.zoom.large == false)
			{
				modal.zoom.large = true;
				zNode.style.width = (modal.constants.zoomScale * zNode.clientWidth) + "px";
			}
			else
			{
				modal.zoom.large = false;
				zNode.style.width = window.innerWidth + "px";
			}
		}
	},
	_backOn: function(degree, cb, injectionNode) {
		modal.back.style.opacity = 1;
		modal.back.className = "blackout " + degree + "fade";
		modal.back.cb = cb;
		modal.trans.on();
		trans(modal.back, modal.trans.off);
		if (injectionNode)
			modal.back.appendChild(injectionNode);
	},
	backOn: function(cb, injectionNode) {
		modal._backOn("black", cb, injectionNode);
	},
	halfOn: function(cb, injectionNode) {
		modal._backOn("half", cb, injectionNode);
	},
	backOff: function(onOff) {
		modal.back.className = "blackout";
		modal.back.cb = null;
		modal.trans.on();
		trans(modal.back, function() {
			onOff && onOff();
			modal.back.style.opacity = 0;
			if (modal.back.firstChild)
				modal.back.removeChild(modal.back.firstChild);
			modal.trans.off();
		});
	},
	backToggle: function(cb, isHalf) {
		var backClass = (isHalf ? "half" : "black") + "fade";
		toggleClass.call(modal.back, backClass);
		if (hasClass(modal.back, backClass)) {
			modal.back.cb = cb;
			modal.back.style.opacity = 1;
		} else {
			modal.back.cb = null;
			modal.trans.on();
			trans(modal.back, function() {
				modal.back.style.opacity = 0;
				if (modal.back.firstChild)
					modal.back.removeChild(modal.back.firstChild);
				modal.trans.off();
			});
		}
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
		modal.trans.on();
		trans(modal.modal, function (event){
			modal.modal.className = "modal hider";
			modal.trans.off();
		});
	},
	zoomIn: function (card, cb) {
		modal.zoom.zoomed = true;
		modal.zoom.firstChild.firstChild.src = image.get(card).url;
		modal.zoom.cb = cb;
		modal.zoom.style.display = "block";
		modal.zoom.style['opacity'] = "1.0";
	},
	zoomOut: function () {
		modal.zoom.zoomed = false;
		modal.zoom.cb = null;
		modal.zoom.style.opacity = 0;
		modal.trans.on();
		trans(modal.zoom, function (event){
			modal.zoom.style.display = "none";
			modal.trans.off();
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
