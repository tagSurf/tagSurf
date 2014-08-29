var throbber = {
	active: false,
	backed: false,
	built: false,
	gif: document.createElement('img'),
	back: document.createElement('div'),
	_build: function ()
	{
		if (!throbber.built) {
			throbber.built = true;
			throbber.gif.src = "http://assets.tagsurf.co/img/spin_throbber.gif";
			throbber.gif.className = "throbber";
			throbber.gif.onload = function() {
				addCss({
					".throbber": function() {
						return "left: " + ((window.innerWidth
							- throbber.gif.offsetWidth) / 2)
							+ "px; bottom: " + ((window.innerHeight
							- throbber.gif.offsetHeight) / 2) + "px";
					}
				});
			};
			throbber.back.className = "throbber-back";
		}
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
		if (addClass && !throbber.gif.classList.contains(addClass))
			throbber.gif.classList.add(addClass);
		if (throbber.backed)
			throbber.back.style.opacity = 1;
		throbber.gif.style.opacity = 1;
	},
	off: function ()
	{
		if (!throbber.active)
			return;
		throbber.active = false;
		throbber.gif.style.opacity = 0;
		if (throbber.backed) {
			throbber.back.style.opacity = 0;
			setTimeout(function () { document.body.removeChild(throbber.back); }, 300);
		}
		else
			setTimeout(function () { document.body.removeChild(throbber.gif); }, 300);
	}
};
