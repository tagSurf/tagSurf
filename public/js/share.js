var share =
{
	cb: null,
	url: null,
	boiler: "Check this out: ",
	button: document.createElement('div'),
	content: document.createElement('div'),
	networks: {
		facebook: "http://www.facebook.com/sharer.php?u=",
		twitter: "https://twitter.com/home?status="
	},
	_icon: function(network) {
		var img = document.createElement("img");
		img.src = "/img/social_media/" + network + ".png";
		img.className = "halfwidth";
		gesture.listen('down', img, function() {
			window.open(share.networks[network] +
				encodeURI(share.boiler + share.url));
		});
		share.content.appendChild(img);
	},
	build: function ()
	{
		share._buildContent();
		share._buildButton();
	},
	_buildContent: function ()
	{
		var heading = document.createElement("div"),
			blurb = document.createElement("div");
		heading.className = "big bold";
		heading.innerHTML = "Share This Card";
		blurb.innerHTML = "Like it? Spread it!";
		share.content.className = "centered";
		share.content.appendChild(heading);
		share.content.appendChild(blurb);
		for (var network in share.networks)
			share._icon(network);
	},
	_buildButton: function ()
	{
		var shareIcon = document.createElement('img');
		shareIcon.src = "/img/share_icon.png";
		shareIcon.id = "share-icon";
		share.button.id = "share-button";
		gesture.listen('down', share.button, function () {
			shareIcon.src = "/img/share_icon-invert.png";
		});
		gesture.listen('up', share.button, function () {
			shareIcon.src = "/img/share_icon.png";
		});
		gesture.listen('tap', share.button, function () {
			modal.topModalIn(share.content);
			share.cb && share.cb();
		});
		share.button.appendChild(shareIcon);
		document.body.appendChild(share.button);
	},
	on: function (tag, id, cb)
	{
		share.cb = cb;
		share.url = "http://" + document.location.host + "/share/" + tag + "/" + id;
		toggleClass.call(share.button, 'share-active', 'on');
	},
	off: function ()
	{
		toggleClass.call(share.button, 'share-active', 'off');
	}
};
share.build();
