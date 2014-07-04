var share =
{
	url: null,
	button: document.createElement('img'),
	content: document.createElement('div'),
	build: function ()
	{
		share.content.innerHTML = "hello there";

		share.button.id = "share-button";
		share.button.src = "/img/share_icon.png";
		gesture.listen('down', share.button, function () {
			share.button.src = "/img/share_icon_invert.png";
		});
		gesture.listen('up', share.button, function () {
			share.button.src = "/img/share_icon.png";
		});
		gesture.listen('tap', share.button, function () {
			modal.topModalIn(share.content);
		});
		document.body.appendChild(share.button);
	},
	on: function (tag, id)
	{
		share.url = "/share/" + tag + "/" + id;
		toggleClass.call(share.button, 'share-active', 'on');
	},
	off: function ()
	{
		toggleClass.call(share.button, 'share-active', 'off');
	}
};
share.build();
