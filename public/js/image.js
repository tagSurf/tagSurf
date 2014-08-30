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
	load: function(dlist, minWidth, cb, eb) {
		var load = image._load;
		dlist.forEach(function(d) {
			if (d.type != "content")
				return;
			d._image_load_cb = d._image_load_cb || cb;
			d._image_load_eb = d._image_load_eb || eb;
			if (load.count >= load.max) {
				load.list.push(d);
				return;
			}
			load.count += 1;
			var i = new Image();
			i.src = image.get(d, minWidth).url;
			var loadNext = function() {
				load.count -= 1;
				if (load.count < load.max && load.list.length) {
					var loadList = load.list;
					load.list = [];
					image.load(loadList, minWidth);
				}
			};
			i.onload = function() {
				d._image_load_cb && d._image_load_cb(d);
				loadNext();
			};
			i.onerror = function() {
				d._image_load_eb && d._image_load_eb(d);
				loadNext();
			};
		});
	},
	get: function(card, minWidth, isGallery) {
		var i, size, d = card && card.data ? card.data : card;
		if(!d)
			return;
		// animated cards and unspecified minWidth force original size
		if ((!isGallery && d && d.image.animated) || !minWidth || image.cache.original[d.id]) {
			image.cache.original[d.id] = d.image.original;
			return d.image.original;
		}

		// check cache
		for (i = 0; i < image.sizes.length; i++) {
			size = image.sizes[i];
			if (image.cache[size][d.id] && d.image[size].width >= minWidth)
				return image.cache[size][d.id];
		}

		// just get the image
		for (i = 2; i >= 0; i--) {
			size = image.sizes[i];
			if (d.image[size].url && d.image[size].width >= minWidth) {
				image.cache[size][d.id] = d.image[size];
				return image.cache[size][d.id];
			}
		}
		image.cache.original[d.id] = d.image.original;
		return d.image.original;
	}
};