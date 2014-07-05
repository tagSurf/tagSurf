var share =
{
	cb: null,
	url: null,
	data: null,
	button: document.createElement('img'),
	content: document.createElement('div'),
	networks: {
		facebook: function() {
			var d = share.data;
			return "https://www.facebook.com/dialog/feed"
				+ "?app_id=676135635790285" + "&link=" + share.url
				+ "&picture=" + encodeURI(image.get(d, window.innerWidth - 40).url)
				+ "&name=tagSurf&caption=" + d.tags[0]
				+ "&description=" + encodeURI(d.caption);
		},
		twitter: function() {
			return "https://twitter.com/home?status=" + share.url;
		}
	},
	_icon: function(network) {
		var img = document.createElement("img");
		img.src = "/img/social_media/" + network + ".png";
		img.className = "halfwidth";
		gesture.listen('down', img, function() {
			window.open(share.networks[network]());
		});
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
			share.cb && share.cb();
		});
		document.body.appendChild(share.button);
	},
	on: function (data, cb)
	{
		share.cb = cb;
		share.data = data;
		share.url = encodeURI("http://" + document.location.host
			+ "/share/" + share.data.tags[0] + "/" + share.data.id);
		toggleClass.call(share.button, 'share-active', 'on');
	},
	off: function ()
	{
		toggleClass.call(share.button, 'share-active', 'off');
	}
};
share.build();
