var share =
{
	cb: null,
	data: null,
	shareModalOut: false,
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
		img.src = "http://assets.tagsurf.co/img/social_media/" + network + ".png";
		img.className = "share-link-icon";
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
			url = document.createElement("input");
		heading.className = "really-big share-heading-margin";
		heading.innerHTML = "Share This Card";
		share.content.className = "centered";
		urlContainer.id = "url-container"; 
		url.id = "share-url";
		url.type = "text";
		url.className = "big blue inline";
		gesture.listen('down', urlContainer, function () { 
			url.focus();
			url.setSelectionRange(0, url.value.length);
			analytics.track('Select Share URL', {
				card: share.data.id,
				surfing: current_tag
			});
		});
		urlContainer.appendChild(url);
		share.content.appendChild(heading);
		for (var network in share.networks)
			share._icon(network);
		share.content.appendChild(urlContainer);
	},
	_buildButton: function ()
	{
		var shareIcon = document.createElement('img');
		shareIcon.src = "http://assets.tagsurf.co/img/share_icon.png";
		shareIcon.id = "share-icon";
		share.button.id = "share-button";
		gesture.listen('down', share.button, function () {
			shareIcon.src = "http://assets.tagsurf.co/img/share_icon-invert.png";
		});
		gesture.listen('up', share.button, function () {
			shareIcon.src = "http://assets.tagsurf.co/img/share_icon.png";
		});
		gesture.listen('tap', share.button, function () {
			if(share.shareModalOut) {
				modal.topModalOut();
				share.shareModalOut =false;
				analytics.track('Close Share Window', {
					card: share.data.id,
					surfing: current_tag
				});
			}
			else {
				if(panic.panicModalOut)
					panic.close();
				modal.topModalIn(share.content, share.close);
				share.shareModalOut = true;
				analytics.track('Open Share Window', {
					card: share.data.id,
					surfing: current_tag
				});
				document.getElementById("share-url").value = share.url();
				share.cb && share.cb();
			}
		});
		share.button.appendChild(shareIcon);
		document.body.appendChild(share.button);
	},
	close: function() {
		document.getElementById("share-url").blur();
		modal.topModalOut();
		share.shareModalOut = false;
		analytics.track('Close Share Window', {
			card: share.data.id,
			surfing: current_tag
		});
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
