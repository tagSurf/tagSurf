var image = {
	width: {
		original: Infinity,
		large: 640,
		medium: 320,
		tiny: 50
	},
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
		for (i = 0; i < image.sizes.length; i++) {
			size = image.sizes[i];
			if (image.cache[size][d.id] && image.width[size] >= minWidth)
				return image.cache[size][d.id];
		}

		// just get the image
		for (i = 2; i >= 0; i--) {
			size = image.sizes[i];
			if (d.image[size].url && image.width[size] >= minWidth) {
				image.cache[size][d.id] = d.image[size].url;
				return image.cache[size][d.id];
			}
		}
	}
};