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
	load: function(dlist, minWidth) {
		var load = image._load;
		dlist.forEach(function(d) {
			if (d.type != "content")
				return;
			if (load.count >= load.max) {
				load.list.push(d);
				return;
			}
			load.count += 1;
			var i = new Image();
			i.src = image.get(d, minWidth).url;
			i.onload = i.onerror = function() {
				load.count -= 1;
				if (load.count < load.max && load.list.length) {
					var loadList = load.list;
					load.list = [];
					image.load(loadList, minWidth);
				}
			};
		});
	},
	get: function(card, minWidth, isGallery) {
		var i, size, d = card.data ? card.data : card;

		// animated cards and unspecified minWidth force original size
		if ((!isGallery && d.image.animated) || !minWidth || image.cache.original[d.id]) {
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