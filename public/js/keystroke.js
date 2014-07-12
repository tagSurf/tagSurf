var keystroke = {
	keyCode: null,
	returnDefault: false,
	keyDown: false,
	holdTime: null,
	listen: function(){
		window.onkeydown = function (e) {
			keystroke.keyDown = true;
			var startTime = Date.now();
			e = e || window.event;
			keystroke.keyCode = e.keyCode || e.which;
			window.onkeyup = function (e) {
				e = e || window.event;
				var upCode = e.keyCode || e.which;
				if(upCode == keystroke.keyCode){
					keystroke.holdTime = Date.now() - startTime;
					keystroke.keyDown = false;
					console.log(keystroke.holdTime);
				}
				else
					return;
			};
		};
	},
	unlisten: function(){
		window.onkeydown = null;
		window.onkeyup = null;
		return; 
	}
};
keystroke.listen();