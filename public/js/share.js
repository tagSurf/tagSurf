var share =
{
	active: false,
	button: document.createElement('div'),
	callback: null,
	build: function ()
	{
		share.button.src = "/img/share-icon.gif";
		share.button.id = "share-button";
		gesture.listen('down', share.button, function () {
			share.button.src = "/img/share-icon-invert.gif";
		});
		gesture.listen('up', share.button, function () {
			share.button.src = "/img/share-icon.gif";
		});
		gesture.listen('tap', share.button, function () {
			share.button.src = "/img/share-icon.gif";
		});
		document.body.appendChild(share.gif);
	},
	on: function (callback)
	{
		share.callback = callback ? callback : null;
		toggleClass.call(share.button, 'share-active');
	},
	off: function ()
	{
		toggleClass.call(share.button, 'share-active');
		if (share.callback)
		{
			share.callback();
		}
	},
	share: function (content)
	{
	}
};
share.build();
