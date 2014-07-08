var share =
{
	cb: null,
	data: null,
	button: document.createElement('div'),
	content: document.createElement('div'),
	url: function() {
		var hostname = document.location.hostname;
		if (hostname.indexOf("localhost") != -1)
			hostname = "beta.tagsurf.co";
		return encodeURI("http://" + hostname + "/share/"
			+ share.data.tags[0] + "/" + share.data.id);
	},
	networks: {
		facebook: function() {
			var d = share.data, u = share.url();
			return "https://www.facebook.com/dialog/feed"
				+ "?app_id=676135635790285" + "&link=" + u
				+ "&picture=" + encodeURI(image.get(d, window.innerWidth - 40).url)
				+ "&name=" + encodeURI(d.caption)
				+ "&description=%23" + d.tags[0]
				+ "&caption=" + document.location.hostname
				+ "&redirect_uri=" + u;
		},
		twitter: function() {
			return "https://twitter.com/home?status=" + share.url();
		}
	},
	_icon: function(network) {
		var img = document.createElement("img");
		img.src = "/img/social_media/" + network + ".png";
		img.className = "halfwidth";
		gesture.listen('down', img, function() {
			window.open(share.networks[network]());
			modal.topModalOut();
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
	on: function (data, cb)
	{
		share.cb = cb;
		share.data = data;
		toggleClass.call(share.button, 'share-active', 'on');
	},
	off: function ()
	{
		toggleClass.call(share.button, 'share-active', 'off');
	}
};
share.build();
