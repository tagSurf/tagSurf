var throbber = {
	active: false,
	backed: false,
	gif: document.createElement('img'),
	back: document.createElement('div'),
	_build: function ()
	{
		throbber.gif.src = "http://assets.tagsurf.co/img/spin_throbber.gif";
		throbber.gif.className = "throbber";
		throbber.gif.onload = function() {
			addCss({
				".throbber": function() {
					return "left: " + ((window.innerWidth
						- throbber.gif.offsetWidth) / 2) + "px;";
				}
			});
		};
		throbber.back.className = "throbber-back";
		addCss({
			".throbber-back": function() {
				return "width: " + window.innerWidth + "px; height: "
					+ (window.innerHeight - 50) + "px;";
			}
		});
		if (throbber.backed) {
			throbber.back.appendChild(throbber.gif);
			document.body.appendChild(throbber.back);
		}
		else 
			document.body.appendChild(throbber.gif);
	},
	on: function (backed, addClass)
	{
		if (throbber.active)
			return;
		throbber.active = true;
		throbber.backed = backed;
		throbber._build();
		if (addClass)
		{
			if (!throbber.gif.classList.contains(addClass))
			{
				throbber.gif.classList.add(addClass);
				throbber.gif.onload();
			}
		}
		else
		{
			throbber.gif.style['top'] = ((window.innerHeight - throbber.gif.offsetHeight) /2) + "px";
		}	
		if (throbber.backed) {	
			throbber.back.style.opacity = 1;
		}
		throbber.gif.style.opacity = 1;
	},
	off: function ()
	{
		if (!throbber.active)
			return;
		throbber.active = false;
		// trans(throbber.gif, function () {
		// 	throbber.active = false;
		// })
		if (throbber.backed) {
			throbber.back.style.opacity = 0;
			throbber.gif.style.opacity = 0;
			setTimeout(function () { document.body.removeChild(throbber.back); }, 300);
		}
		else {
			throbber.gif.style.opacity = 0;
			setTimeout(function () { document.body.removeChild(throbber.gif); }, 300);
		}
	}
};
