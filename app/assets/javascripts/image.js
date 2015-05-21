var image = {
	sizes: ["original", "huge", "large", "medium", "tiny"],
	cache: {
		original: {},
		huge: {},
		large: {},
		medium: {},
		tiny: {}
	},
	_load: {
		max: 10,
		count: 0,
		list: []
	},
	loadCount: function() {
		return image._load.count;
	},
	clearLoadList: function() {
		image._load.list = [];
	},
	load: function(cardList, minWidth, cb, eb) {
		var load = image._load;
		cardList.forEach(function(c) {
			if (c.type == "friend_request" || c.video)
				cb && cb(c);
			if (c.type.indexOf("content") == -1 || current_deck.known_keys[c.id])
				return;
			c._image_load_cb = c._image_load_cb || cb;
			c._image_load_eb = c._image_load_eb || eb;
			if (load.count >= load.max) {
				load.list.push(c);
				return;
			}
			load.count += 1;
			var i = new Image();
			i.src = image.get(c, minWidth).url;
			var loadNext = function() {
				load.count -= 1;
				if (load.count < load.max && load.list.length) {
					var loadList = load.list;
					load.list = [];
					image.load(loadList, minWidth, cb, eb);
				}
			};
			i.onload = function() {
				c._image_load_cb && c._image_load_cb(c);
				loadNext();
			};
			i.onerror = function() {
				c._image_load_eb && c._image_load_eb(c);
				loadNext();
			};
		});
	},
	get: function(card, minWidth, isGallery) {
		var i, size, c = (card && card.data) ? card.data : card;
		if(!c)
			return;
		// animated cards and unspecified minWidth force original size
		if ((!isGallery && c && c.image.animated) || !minWidth || image.cache.original[c.id]) {
			image.cache.original[c.id] = c.image.original;
			return c.image.original;
		}

		// check cache
		for (i = 0; i < image.sizes.length; i++) {
			size = image.sizes[i];
			if (image.cache[size][c.id] && c.image[size].width >= minWidth)
				return image.cache[size][c.id];
		}

		// just get the image
		for (i = 2; i >= 0; i--) {
			size = image.sizes[i];
			if (c.image[size].url && c.image[size].width >= minWidth) {
				image.cache[size][c.id] = c.image[size];
				return image.cache[size][c.id];
			}
		}
		image.cache.original[c.id] = c.image.original;
		return c.image.original;
	}
};