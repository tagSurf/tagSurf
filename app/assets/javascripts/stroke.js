var stroke = {
	keys: {},
	cbs: { up: {}, down: {} },
	init: function() {
		window.onkeydown = function (e) {
			e = e || window.event;
			var code = e.keyCode || e.which,
				ac = stroke.cbs.down.always,
				cb = stroke.cbs.down[code],
				now = Date.now(),
				kobj = stroke.keys[code] =
					(stroke.keys[code] && !stroke.keys[code].up)
					? stroke.keys[code] : { duration: 0 };
			if (kobj.down)
				kobj.duration += (now - kobj.down);
			kobj.down = now;
			ac && ac(kobj);
			cb && cb(kobj);
		};
		window.onkeyup = function (e) {
			e = e || window.event;
			var code = e.keyCode || e.which,
				now = Date.now(),
				kobj = stroke.keys[code]
					= stroke.keys[code] || { down: now },
				ac = stroke.cbs.up.always,
				cb = stroke.cbs.up[code];
			kobj.up = now;
			kobj.duration += kobj.up - kobj.down;
			ac && ac(kobj);
			cb && cb(kobj);
		};
	},
	isDown: function(keyCode) {
		var kobj = stroke.keys[keyCode],
			isDown = kobj && !kobj.up;
		return isDown;
	},
	listen: function(evt, keyCode, cb) {
		stroke.cbs[evt][keyCode || 'always'] = cb;
	},
	unlisten: function(evt, keyCode) {
		delete stroke.cbs[evt][keyCode || 'always'];
	}
};
stroke.init();