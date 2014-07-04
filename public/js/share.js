var share =
{
	url: null,
	boiler: "Check this out: ",
	button: document.createElement('img'),
	content: document.createElement('div'),
	networks: {
		facebook: "http://www.facebook.com/sharer.php?u=",
		twitter: "https://twitter.com/home?status="
	},
	_icon: function(network) {
		var img = document.createElement("img");
		img.src = "/img/social_media/" + network + ".png";
		img.className = "halfwidth";
		img.onclick = function() {
			window.open(share.networks[network] +
				encodeURI(share.boiler + share.url));
		};
		share.content.appendChild(img);
	},
	build: function ()
	{
		var heading = document.createElement("div");
		heading.className = "big bold";
		heading.innerHTML = "Share This Card";
		var blurb = document.createElement("div");
		blurb.innerHTML = "Like it? Spread it!";
		share.content.className = "centered";
		share.content.appendChild(heading);
		share.content.appendChild(blurb);
		for (var network in share.networks)
			share._icon(network);

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
		share.url = "http://" + document.location.host + "/share/" + tag + "/" + id;
		toggleClass.call(share.button, 'share-active', 'on');
	},
	off: function ()
	{
		toggleClass.call(share.button, 'share-active', 'off');
	}
};
share.build();
