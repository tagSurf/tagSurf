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
		//Special share treatment for landing page cards
		if (share.data.id == 272733 || share.data.id == 272738)
			return encodeURI("http://tagsurf.co");
		else if (current_tag)
			return encodeURI("http://" + hostname + "/share/"
				+ current_tag + "/" + share.data.id);
		else
			return encodeURI("http://" + hostname + "/share/"
				+ share.data.tags[0] + "/" + share.data.id);
	},
	networks: {
		facebook: function() {
			var d = share.data, u = share.url(), share_tag;
			if(current_tag)
				share_tag=current_tag;
			else
				share_tag=share.data.tags[0];
			analytics.track('Share to facebook', {
				card: share.data.id,
				surfing: current_tag
			});
			return "https://www.facebook.com/dialog/feed"
				+ "?app_id=676135635790285" + "&link=" + u
				// + "&picture=" + encodeURI(image.get(d, window.innerWidth - 40).url)
				+ "&name=" + encodeURI(d.caption)
				+ "&description=%23" + share_tag
				// + "&caption=" + document.location.hostname
				+ "&redirect_uri=" + u;
		},
		twitter: function() {
			analytics.track('Share to twitter', {
				card: share.data.id,
				surfing: current_tag
			});
			return "https://twitter.com/home?status=" + share.url();
		}
	},
	_icon: function(network) {
		var img = document.createElement("img");
		img.src = "/img/social_media/" + network + ".png";
		img.className = "share_link_icon";
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
			blurb = document.createElement("div"),
			urlContainer = document.createElement("div"),
			url = document.createElement("div"),
			clipboardButton = document.createElement("div")
			clipboard = document.createElement("img"),
			clipboardButtonCallBack = function() {
				var url = document.getElementById('share-url'), r;
				url.contentEditable = true;
				r = document.createRange(); 
				r.selectNodeContents(url);
				var sel = window.getSelection();
				sel.addRange(r);
				document.designMode = "on";
				console.log(r.toString());
				console.log(document.queryCommandEnabled('Copy'));
			};

		heading.className = "really-big share_heading_margin";
		heading.innerHTML = "Share This Card";
		share.content.className = "centered";
		urlContainer.id = "url-container"; 
		url.id = "share-url";
		url.className = "big blue inline";
		clipboardButton.id = "clipboard-button";
		clipboardButton.className = "inline";
		clipboard.id = "clipboard-icon";
		clipboard.src = "/img/clipboard_icon.png";
		urlContainer.appendChild(url);
		clipboardButton.appendChild(clipboard);
		urlContainer.appendChild(clipboardButton);
		share.content.appendChild(heading);
		//Activate clipboard button
		gesture.listen('down', clipboardButton, function () {
			clipboard.src = "/img/clipboard_icon-invert.png";
		});
		gesture.listen('up', clipboardButton, function () {
			clipboard.src = "/img/clipboard_icon.png";
		});
		gesture.listen('tap', clipboardButton, clipboardButtonCallBack);
		for (var network in share.networks)
			share._icon(network);
		share.content.appendChild(urlContainer);
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
			document.getElementById("share-url").innerHTML = share.url();
			share.cb && share.cb();
		});
		share.button.appendChild(shareIcon);
		document.body.appendChild(share.button);
	},
	on: function (data, cb)
	{
		if (cb)
			share.cb = cb;
		if (data)
			share.data = data;
		toggleClass.call(share.button, 'share-active', 'on');
	},
	off: function ()
	{
		toggleClass.call(share.button, 'share-active', 'off');
	}
};
share.build();
