var image = {
	sizes: ["original", "huge", "large", "medium", "tiny"],
	cache: {
		original: {},
		huge: {},
		large: {},
		medium: {},
		tiny: {}
	},
	load: function(dlist, minWidth) {
		dlist.forEach(function(d) {
			var i = new Image();
			i.src = image.get(d, minWidth).url;
		});
	},
	get: function(d, minWidth) {
		var i, size;

		// animated cards and unspecified minWidth force original size
		if (d.image.animated || !minWidth || image.cache.original[d.id]) {
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