var current_image, starCallback, slideGallery, addHistoryItem, gallerize = function(gallery) {
	var now = new Date();
	var day = 1000 * 60 * 60 * 24;
	var week = day * 7;
	var week2 = week * 2;
	var picbox, bigpic, picdesc, pictag;
	var grid = document.createElement("div");
	grid.className = "grid";

	if (gallery == "history") {
		var history_slider = document.createElement("div");
		history_slider.id = "history_slider";
		history_slider.appendChild(grid);
		grid.className = "histgrid";
		document.body.appendChild(history_slider);
		addCss({
			"#history_slider": function() {
				return "-webkit-transform: translate3d(0, -"
					+ (history_slider.offsetHeight + 100) + "px, 0);";
			},
			".histgrid": function() {
				return "height: " + (history_slider.offsetHeight - 10) + "px;";
			},
			".grid": function() {
				return "height: " + (window.innerHeight - 50) + "px;";
			}
		});
		slideGallery = function() {
			current_image && modal.callModal();
			history_slider.style.opacity = "1";
			toggleClass.call(history_slider, "modalslide");
		};
		addHistoryItem = function(item) {
			addImage(item, true);
		};
	} else document.body.appendChild(grid);

	var buildPicBox = function() {
		picbox = document.getElementById("picbox");
		if (picbox) { // image detail modal frame already exists
			bigpic = document.getElementById("bigpic");
			picdesc = document.getElementById("picdesc");
			pictag = document.getElementById("pictag");
			return;
		}

		picbox = document.createElement("div");
		picbox.id = "picbox";

		bigpic = document.createElement("img");
		bigpic.id = "bigpic";
		picbox.appendChild(bigpic);

		picdesc = document.createElement("div");
		picdesc.id = "picdesc";
		picdesc.className = "centered";
		picbox.appendChild(picdesc);

		var pictagbox = document.createElement("div");
		pictagbox.className = "padded pictags";
		pictag = document.createElement("span");
		pictag.id = "pictag";
		pictagbox.appendChild(pictag);
		picbox.appendChild(pictagbox);
	};
	var addHeader = function(headerName) {
		var nospace = gallery + headerName.replace(/ /g, "");
		if (document.getElementById(nospace))
			return;
		var h = document.createElement("div");
		h.id = nospace;
		h.className = "header";
		h.innerHTML = headerName;
		grid.appendChild(h);
	};
	var showImage = function(d) {
		current_image = d;
		modal.modalIn(picbox, function(direction) {
			if (!direction || !isNaN(direction) || direction == "right") {
				current_image = null;
				setFavIcon(location.pathname == "/favorites");
				modal.backOff();
				modal.modalOut();
			}
		});
		modal.backOn();
		bigpic.src = d.image_link_medium || d.image_link_original;
		picdesc.innerHTML = d.title;
		pictag.innerHTML = "#" + d.tags[0];
		setFavIcon(current_image.is_favorite);
	};
	var addImage = function(d, front) {
		var n = document.createElement("div");
		n.className = "box";
		n.style.backgroundImage = "url('" +
			(d.image_link_tiny || d.image_link_medium || d.image_link_original) + "')";
		n.style.border = "2px solid " +
			((d.user_stats.vote == "up") ? "green" : "red");

		var top = document.createElement("div");
		top.className = "overlay tag";
		top.innerHTML = "#" + d.user_stats.tag_voted;

		var spacer = document.createElement("div");
		spacer.style.paddingTop = "70%";

		var trending = d.trend == "up";

		var bottom = document.createElement("div");
		bottom.className = "overlay votes";
		bottom.style.background = trending ? "red" : "green";

		var vote_meter = document.createElement("div");
		if (trending) {
			vote_meter.className = "yesvotes";
			vote_meter.style.width = (100 * d.up_votes / d.total_votes) + "%";
		} else {
			vote_meter.className = "novotes";
			vote_meter.style.width = (100 * d.down_votes / d.total_votes) + "%";
		}
		bottom.appendChild(vote_meter);

		var vote_count = document.createElement("div");
		vote_count.className = "votecount";
		vote_count.innerHTML = d.total_votes;
		bottom.appendChild(vote_count);

		n.appendChild(top);
		n.appendChild(spacer);
		n.appendChild(bottom);
		n.onclick = function() {
			showImage(d);
		};
		d.node = n;
		front ? grid.insertBefore(n, grid.firstChild) : grid.appendChild(n);
	};

	// gallery feed builder
	var chunk_size = 20;
	var chunk_offset = 0;
	var populating = false;
	var getPath = function() {
		if (gallery == "tag")
			return "/api/media/" + location.hash.slice(1);
		return "/api/" + gallery + "/paginated/" + chunk_size + "/" + chunk_offset;
	};
	var populateGallery = function() {
		if (populating)
			return;
		populating = true;
		xhr(getPath(), null, function(response_data) {
			response_data.data.forEach(function(d) {
				d.gallery = gallery;
				var diff = now - new Date(d.date);
				if (diff < day)
					addHeader("Today");
				else if (diff < week)
					addHeader("This Week");
				else if (diff < week2)
					addHeader("Last Week");
				else
					addHeader("Earlier");
				addImage(d);
			});
			populating = false;
		});
		chunk_offset += chunk_size;
	};

	buildPicBox();
	populateGallery();

	grid.onscroll = function(e) {
		if ((grid.scrollTop + grid.scrollHeight) >= grid.offsetHeight)
			populateGallery();
	};

	document.getElementById("favorites-btn").onclick = function() {
		if (current_image) {
			if (current_image.gallery == "history") {
				if (!current_image.is_favorite) {
					current_image.is_favorite = true;
					xhr("/api/favorites/" + current_image.id, "POST");
					if (location.pathname == "/favorites")
						grid.insertBefore(current_image.node, grid.firstChild);
				} else {
					current_image.is_favorite = false;
					xhr("/api/favorites/" + current_image.id, "DELETE");
					if (location.pathname == "/favorites")
						grid.removeChild(current_image.node);
				}
				setFavIcon(current_image.is_favorite);
			} else if (current_image.gallery == "favorites") {
				xhr("/api/favorites/" + current_image.id, "DELETE");
				grid.removeChild(current_image.node);
				modal.callModal();
			}
		} else if (starCallback)
			starCallback();
	};
};

var setStarCallback = function(cb) {
	starCallback = cb;
};