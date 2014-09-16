var modal = {
	back: document.createElement("div"),
	modal: document.createElement("div"),
	prompt: document.createElement("div"),
	topModal: document.createElement("div"),
	zoom: document.createElement("div"),
	constants: {
		zoomScale: 2.00,
		zoomMax: 4.5,
		animationDuration: 500
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

		gesture.listen("tap", modal.zoom, modal.callZoom, true);
		gesture.listen("drag", modal.zoom, modal.dragZoom, true);
		gesture.listen("pinch", modal.zoom, modal.pinchZoom, true);
		gesture.listen("down", modal.zoom, returnTrue, true);
	},
	_buildZoom: function() {
		var zNode = document.createElement('img'), 
			gesture_wrapper = document.createElement('div');
		zNode.className = 'basic-zoom';
		modal.zoom.className = "zoom-wrapper";
		gesture_wrapper.className = "raw-wrapper";
		gesture_wrapper.appendChild(zNode);
		modal.zoom.appendChild(gesture_wrapper);
		modal.zoom.large = false;
		modal.zoom.zoomed = false;
		addCss({
			".raw-wrapper": function() {
				return "height: " + (window.innerHeight - 110) + 'px';
			},
			".zoom-wrapper": function() {
				modal.zoom.maxWidth = modal.constants.zoomMax
					* window.innerWidth;
				modal.zoom.z2width = modal.constants.zoomScale
					* window.innerWidth;
				return "height: " + (window.innerHeight - 40) + 'px';
			}
		});
	},
	_buildPrompt: function () {
		var prompt_container = document.createElement('div');
		prompt_container.className = "prompt-container";
		prompt_container.appendChild(modal.prompt);
		modal.prompt.className = "modal-prompt disabled";
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
	zoomToWidth: function(width, fromPinch, midpoint) {
		var wiw = window.innerWidth, wih = window.innerHeight,
			scrollToCoords, w = width || wiw,
			zNode = modal.zoom.firstChild.firstChild,
			zNodeWidth = parseInt(zNode.style.width) || zNode.scrollWidth,
			zNodeHeight = parseInt(zNode.scrollHeight),
			zoomST = modal.zoom.scrollTop,
			zoomSL = modal.zoom.scrollLeft,
			dw = w - zNodeWidth, percentDw = (dw / zNodeWidth),
			dh = (zNodeHeight * percentDw) - zNodeHeight, 
			direction = (zNodeWidth > w ?  "decreasing" : "increasing");
		var animateScrollZoom = function () {
			var zoomToWidth = w, node = zNode, 
				now = Date.now(), dt = now - modal.zoom.zoomTime, 
				tick = dt / modal.constants.animationDuration,
				currentWidth = modal.zoom.current || zNodeWidth,
				changedWidth = dw * tick, changedHeight = dh * tick,
				newWidth = currentWidth + changedWidth;
				modal.zoom.zoomTime = now;
				if (newWidth > window.innerWidth &&
					((direction == "increasing" && currentWidth < zoomToWidth)
					|| (direction == "decreasing" && currentWidth > zoomToWidth)))
				{
					modal.zoom.current = newWidth;
					node.style.width = newWidth + 'px';
					modal.zoom.scrollLeft += changedWidth / 2;
					modal.zoom.scrollTop += changedHeight / 2;
					modal.zoom.rAFid = requestAnimFrame(animateScrollZoom);
				}
				else
				{
					cancelAnimationFrame(modal.zoom.rAFid);
					modal.zoom.rAFid = null;
				}
			};
		if (w < window.innerWidth) {
			modal.zoom.current = window.innerWidth;
			modal.zoomOut();
		} else if (w != zNode.clientWidth) {
			if (!fromPinch) {
				modal.zoom.zoomTime = Date.now();
				modal.zoom.rAFid = requestAnimFrame(animateScrollZoom);
			}
			else
			{
				scrollToCoords = !midpoint ? 
					{ top:(zoomST + dh/2), 
						left:(zoomSL + dw/2) }
					: { top:((zoomST + midpoint.y)*percentDw - wih/2),
						left:((zoomSL + midpoint.x)*percentDw - wiw/2) };
				console.log(scrollToCoords, midpoint);
				modal.zoom.current = w;
				zNode.style.width = w + "px";
				modal.zoom.scrollTop = scrollToCoords.top;
				modal.zoom.scrollLeft = scrollToCoords.left;
			}
			modal.zoom.large = (w >= modal.zoom.z2width);
		}
	},
	callZoom: function(tapCount) {
		if (tapCount == 1) {
			modal.zoomToWidth();
			return modal.zoom.cb && modal.zoom.cb();
		} else if (tapCount == 2)
			modal.zoomToWidth(!modal.zoom.large && modal.zoom.z2width);
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
		modal.modal.innerHTML = "";
		modal.modal.appendChild(node);
		modal.modal.style.display = "block";
		modal.modal.cb = cb || modal.modalOut;
		modal.modal.zcb = zcb;
		if (!modal.modal.on) {
			modal.modal.on = true;
			modal.modal.className = "modal modalout disabled";
			setTimeout(function() {
				modal.modal.className = "modal modalslide";
			}, 0);
		}
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
	promptIn: function(node, cb, back) {
		if (modal.prompt.on)
			return;
		back = (typeof back === "undefined") ? true : back;
		modal.prompt.on = true;
		modal.prompt.innerHTML = "";
		modal.prompt.appendChild(node);
		modal.prompt.cb = cb || modal.promptOut;
		modal.prompt.className = "modal-prompt disabled";
		setTimeout(function() {
			modal.prompt.className = "modal-prompt opaque";
		}, 0);
		if (!modal.back.on && back) {
			modal.backOn();
			modal.prompt.backed = true;
		}
	},
	promptOut: function() {
		modal.prompt.on = false;
		modal.prompt.className = "modal-prompt";
		modal.prompt.cb = null;
		modal.prompt.style.opacity = 0;
		trans(modal.prompt, function (event){
			modal.prompt.className = "modal-prompt disabled";
		});
		if (modal.prompt.backed) {
			modal.prompt.backed = false;
			modal.backOff();
		}
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
	setZoomVerticalPosition: function (startVerticalPosition, startWidth,
		optionalStart) {
			var optional = optionalStart || (modal.zoom.scrollWidth > 0 ? 
				modal.zoom.scrollWidth : window.innerWidth);
			modal.zoom.firstChild.firstChild.style.webkitTransform =
				'scale3d(1,1,1)';
			modal.zoom.scrollTop = startVerticalPosition * optional / startWidth;
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
	},
	pinchZoom: function (normalizedDistance, midpoint) {
		if (!modal.zoom.zoomed) return;
		var zNode = modal.zoom.firstChild.firstChild;
		if (normalizedDistance) {
			modal.zoom.current = modal.zoom.current || zNode.clientWidth;
			modal.zoomToWidth(Math.min(modal.zoom.current * normalizedDistance,
				modal.zoom.maxWidth), true, midpoint);
		} else
			modal.zoom.current = zNode.clientWidth;
	},
	setPinchLauncher: function (node, onZoomCb) {
		gesture.listen("pinch", node, function(normalizedDistance) {
			var trueScrollTop = scrollContainer.scrollTop ? scrollContainer.scrollTop
				: (scrollContainer.yDrag ? -scrollContainer.yDrag : 0);
			if (normalizedDistance) {
				onZoomCb && onZoomCb();
				if (normalizedDistance > 1) {
					if (!modal.zoom.zoomed) {
						modal.zoomIn(currentMedia);
						modal.setZoomVerticalPosition(trueScrollTop, node.scrollWidth);
						modal.zoom.current = window.innerWidth;
					}
					modal.pinchZoom(normalizedDistance);
				}
			} else
				modal.pinchZoom();
		});
	}
};
modal.build();
