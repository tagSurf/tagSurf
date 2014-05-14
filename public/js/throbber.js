var throbber =
{
	gif: document.createElement('img'),
	_build: function ()
	{
		throbber.gif.src = "/img/spin_throbber.gif";
		throbber.gif.className = "throbber";
	},
	on: function (addClass, addNode)
	{
		if (addNode) addNode.appendChild(throbber.gif);
		else document.body.appendChild(throbber.gif);
		if (addClass) throbber.gif.classList.add(addClass);
		else
		{
			throbber.gif.style['top'] = ((window.innerHeight - throbber.gif.offsetHeight) /2) + "px";
		}
		throbber.gif.style['left'] = ((window.innerWidth - throbber.gif.offsetWidth) /2) + "px";
		throbber.gif.style['visibility'] = "visible";
		throbber.gif.style['opacity'] = "1.0";
	},
	off: function ()
	{
		trans(throbber.gif, function () {
			throbber.gif.style['visibility'] = "hidden";
			throbber.gif.className = "throbber";
			throbber.gif.parentNode.removeChild(throbber.gif);	
		})
		throbber.gif.style['opacity'] = "0";
	}
};
throbber._build();
