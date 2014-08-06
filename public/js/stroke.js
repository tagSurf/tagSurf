var stroke = {
	keys: {},
	cbs: { up: {}, down: {} },
	init: function() {
		console.log("stroke.init");
		window.onkeydown = function (e) {
			e = e || window.event;
			var code = e.keyCode || e.which;
			keys[code] = { down: Date.now() };
			cbs.down[code](keys[code]);
		}
		window.onkeyup = function (e) {
			e = e || window.event;
			var code = e.keyCode || e.which,
				keyobj = keys[code];
			keyobj.up = Date.now();
			keyobj.duration = keyobj.up - keyobj.down;
			cbs.up[code](keyobj);
		}
	},
	listen: function(evt, keyCode, cb) {
		console.log("stroke.listen:", evt, keyCode, cb);
		cbs[evt][keyCode] = cb;
	},
	unlisten: function(evt, keyCode) {
		console.log("stroke.unlisten:", evt, keyCode);
		delete cbs[evt][keyCode];
	}
};
stroke.init();