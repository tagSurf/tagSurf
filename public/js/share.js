var share =
{
	url: null,
	button: document.createElement('img'),
	content: document.createElement('div'),
	build: function ()
	{
		var heading = document.createElement("div");
		heading.className = "big bold";
		heading.innerHTML = "Share This Card";

		var blurb = document.createElement("div");
		blurb.innerHTML = "Like it? Spread it!";

		var facebook = document.createElement("img");
		facebook.src = "/img/social_media/facebook.png";
		facebook.className = "halfwidth";
		var twitter = document.createElement("img");
		twitter.src = "/img/social_media/twitter.png";
		twitter.className = "halfwidth";

		share.content.className = "centered";
		share.content.appendChild(heading);
		share.content.appendChild(blurb);
		share.content.appendChild(facebook);
		share.content.appendChild(twitter);

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
