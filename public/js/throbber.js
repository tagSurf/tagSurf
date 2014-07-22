var throbber =
{
	active: false,
	gif: document.createElement('img'),
	back: document.createElement('div'),
	_build: function ()
	{
		
		throbber.gif.src = "/img/spin_throbber.gif";
		throbber.gif.className = "throbber";
		throbber.back.className = "throbber-back";
		throbber.back.style['opacity'] = 0;
		throbber.gif.onload = function() {
			throbber.gif.style['left'] = ((window.innerWidth - throbber.gif.offsetWidth) / 2) + "px";
		};
		document.body.appendChild(throbber.back);
		document.body.appendChild(throbber.gif);
	},
	on: function (addClass, addNode)
	{
		if (throbber.active)
			return;
		throbber.active = true;
		throbber.back.style['opacity'] = 1;
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
		throbber.gif.style['opacity'] = "1.0";
	},
	off: function ()
	{
		throbber.active = false;
		trans(throbber.gif, function () {
			throbber.active = false;
		})
		throbber.gif.style['opacity'] = "0";
		throbber.back.style['opacity'] = "0";
	}
};
throbber._build();
