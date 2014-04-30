var image = {
	width: {
		original: Infinity,
		medium: 320,
		tiny: 50
	},
	sizes: ["original", "medium", "tiny"],
	cache: {
		original: {},
		medium: {},
		tiny: {}
	},
	get: function(d, minWidth) {
		var i, size;

		// animated cards force original size
		if (d.image.animated)
			return d.image.original.url;

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