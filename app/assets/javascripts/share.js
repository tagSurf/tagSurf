var share = {
	cb: null,
	card: null,
	shareModalOut: false,
	button: document.createElement('div'),
	content: document.createElement('div'),
	url: function() {
		var hostname = document.location.hostname;
		if (hostname.indexOf("localhost") != -1)
			hostname = "beta.tagsurf.co";
		//Special share treatment for landing page cards
		if (share.card.id == 272733 || share.card.id == 272738)
			return encodeURI("http://tagsurf.co");
		else if (current_tag)
			return encodeURI("http://" + hostname + "/share/"
				+ current_tag + "/" + share.card.id);
		else
			return encodeURI("http://" + hostname + "/share/"
				+ Object.keys(share.card.tags[0])[0] + "/" + share.card.id);
	},
	networks: {
		facebook: function() {
			var c = share.card, u = share.url(), share_tag;
			if(current_tag)
				share_tag = current_tag;
			else
				share_tag = Object.keys(share.card.tags[0])[0];
			analytics.track('Share to facebook', {
				card: share.card.id,
				surfing: current_tag
			});
			return "https://www.facebook.com/dialog/feed"
				+ "?app_id=676135635790285" + "&link=" + u
				// + "&picture=" + encodeURI(image.get(d, window.innerWidth - 40).url)
				+ "&name=" + encodeURI(isGallery() ? c.caption : c.data.caption)
				+ "&description=%23" + share_tag
				// + "&caption=" + document.location.hostname
				+ "&redirect_uri=" + u;
		},
		twitter: function() {
			analytics.track('Share to twitter', {
				card: share.card.id,
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
			url = document.createElement("input"),
			closebtn = document.createElement("img");
		heading.className = "really-big share-heading-margin";
		heading.innerHTML = "Share This Card";
		closebtn.src = "http://assets.tagsurf.co/img/Close.png";
		closebtn.className = "modal-close-button";
		closebtn.id = "share-close-button";
		share.content.className = "centered";
		urlContainer.id = "url-container"; 
		url.id = "share-url";
		url.type = "text";
		url.className = "big blue inline";
		gesture.listen('down', urlContainer, function () { 
			url.focus();
			url.setSelectionRange(0, url.value.length);
			analytics.track('Select Share URL', {
				card: share.card.id,
				surfing: current_tag
			});
		});
		urlContainer.appendChild(url);
		share.content.appendChild(heading);
		for (var network in share.networks)
			share._icon(network);
		share.content.appendChild(urlContainer);
		share.content.appendChild(closebtn);
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
			setTimeout(function(){
				shareIcon.src = "http://assets.tagsurf.co/img/share_icon.png";
			}, 200);
		});
		gesture.listen('tap', share.button, function () {
			if(isUIWebView) {
				window.location = "nativeShare://" + share.url());
			}
			else if(share.shareModalOut) {
				modal.topModalOut();
				share.shareModalOut =false;
				analytics.track('Close Share Window', {
					card: share.card.id,
					surfing: current_tag
				});
			}
			else {
				if(panic.panicModalOut)
					panic.close();
				modal.topModalIn(share.content, share.close);
				share.shareModalOut = true;
				analytics.track('Open Share Window', {
					card: share.card.id,
					surfing: current_tag
				});
				document.getElementById("share-url").value = share.url();
				share.cb && share.cb();
			}
		});
		share.button.appendChild(shareIcon);
		document.body.appendChild(share.button);
	},
	open: function() {
		if(panic.panicModalOut)
			panic.close();
		modal.topModalIn(share.content, share.close);
		share.shareModalOut = true;
		analytics.track('Open Share Window', {
			card: share.card.id,
			surfing: current_tag
		});
		document.getElementById("share-url").value = share.url();
		share.cb && share.cb();
	},
	close: function() {
		document.getElementById("share-url").blur();
		modal.topModalOut();
		share.shareModalOut = false;
		analytics.track('Close Share Window', {
			card: share.card.id,
			surfing: current_tag
		});
	},
	on: function (card, cb)
	{
		if (cb)
			share.cb = cb;
		if (card)
			share.card = card;
		toggleClass.call(share.button, 'share-active', 'on');
	},
	off: function ()
	{
		toggleClass.call(share.button, 'share-active', 'off');
	}
};
share.build();
