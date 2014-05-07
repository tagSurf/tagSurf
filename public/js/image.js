var image = {
	sizes: ["original", "large", "medium", "tiny"],
	cache: {
		original: {},
		large: {},
		medium: {},
		tiny: {}
	},
	get: function(d, minWidth) {
		var i, size;

		// animated cards and unspecified minWidth force original size
		if (d.image.animated || !minWidth) {
			image.cache.original[d.id] = d.image.original.url;
			return d.image.original.url;
		}

		// check cache
		d.image.original.width = Infinity;
		for (i = 0; i < image.sizes.length; i++) {
			size = image.sizes[i];
			if (image.cache[size][d.id] && d.image[size].width >= minWidth)
				return image.cache[size][d.id];
		}

		// just get the image
		for (i = 2; i >= 0; i--) {
			size = image.sizes[i];
			if (d.image[size].url && d.image[size].width >= minWidth) {
				image.cache[size][d.id] = d.image[size].url;
				return image.cache[size][d.id];
			}
		}
	}
};