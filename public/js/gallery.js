var starCallback, slideGallery, addHistoryItem, gallerize = function(gallery) {
	addCss(".modal { -webkit-transform: translate3d("
		+ window.innerWidth + "px, 0, 0); }");

	var now = new Date();
	var day = 1000 * 60 * 60 * 24;
	var week = day * 7;
	var week2 = week * 2;
	var blackout, modal, bigpic, picdesc, pictag, current_image;
	var grid = document.createElement("div");
	grid.className = "grid";

	if (gallery == "history") {
		var history_slider = document.createElement("div");
		history_slider.id = "history_slider";
		history_slider.className = "modal";
		history_slider.appendChild(grid);
		var blackback = document.createElement("div");
		blackback.id = "blackback";
		blackback.className = "blackout";
		document.body.appendChild(blackback);
		document.body.appendChild(history_slider);
		addCss("#history_slider { -webkit-transform: translate3d(0, -"
			+ (history_slider.offsetHeight + 100) + "px, 0); } .grid { height: "
			+ (history_slider.offsetHeight - 10) + "px; }");
		slideGallery = function() {
			current_image && modal.onclick();
			history_slider.style.opacity = "1";
			toggleClass.call(history_slider, "modalslide");
			toggleClass.call(document.getElementById("blackback"), "blackfade");
		};
		addHistoryItem = function(item) {
			addImage(item, true);
		};
	} else document.body.appendChild(grid);

	var buildModal = function() {
		blackout = document.getElementById("blackout");
		if (blackout) { // modal already exists
			blackout = document.getElementById("blackout");
			modal = document.getElementById("picbox");
			bigpic = document.getElementById("bigpic");
			picdesc = document.getElementById("picdesc");
			pictag = document.getElementById("pictag");
			return;
		}

		blackout = document.createElement("div");
		blackout.className = "blackout";

		modal = document.createElement("div");
		modal.id = "picbox"
		modal.className = "modal";

		bigpic = document.createElement("img");
		bigpic.id = bigpic.className = "bigpic";
		modal.appendChild(bigpic);

		picdesc = document.createElement("div");
		picdesc.id = "picdesc";
		picdesc.className = "centered";
		modal.appendChild(picdesc);

		var pictagbox = document.createElement("div");
		pictagbox.className = "centered padded";
		pictag = document.createElement("span");
		pictag.id = pictag.className = "pictag";
		pictagbox.appendChild(pictag);
		modal.appendChild(pictagbox);

		modal.onclick = function() {
			current_image = null;
			setFavIcon(location.pathname == "/favorites");
			blackout.className = blackout.className.replace(" blackfade", "");
			modal.className = modal.className.replace(" modalslide", "");
		};
		document.body.appendChild(blackout);
		document.body.appendChild(modal);
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
		modal.className += " modalslide";
		blackout.className += " blackfade";
		bigpic.src = d.image_link_original;
		picdesc.innerHTML = d.title;
		pictag.innerHTML = "#" + d.tagged_as[0];
		setFavIcon(current_image.is_favorite);
	};
	var addImage = function(d, front) {
		var n = document.createElement("div");
		n.className = "box";
		n.style.backgroundImage = "url('" + d.image_link_original + "')";
		n.style.border = "1px solid " + (d.user_vote ? "green" : "red");

		var top = document.createElement("div");
		top.className = "overlay tag";
		top.innerHTML = "#" + d.tagged_as[0];

		var spacer = document.createElement("div");
		spacer.style.paddingTop = "70%";

		var trending = d.up_votes > d.down_votes * 2;

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
	// TODO: remove when APIs solidify...
	var gmap = { history: "history/paginated", favorites: "favorites" };
	var getPath = function() {
		if (gallery == "tag")
			return "/api/media/" + location.hash.slice(1);
		return "/api/" + (gmap[gallery] || gallery) + "/" + chunk_size + "/" + chunk_offset;
	};
	var populateGallery = function() {
		xhr(getPath(), function(response_data) {
			response_data.data.forEach(function(d) {
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
		});
		chunk_offset += chunk_size;
	};

	populateGallery();
	buildModal();

	window.onscroll = function(e) {
		if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight)
			populateGallery();
	};

	document.getElementById("favorites-btn").onclick = function() {
		if (current_image) {
			if (gallery == "history") {
				if (!current_image.is_favorite) {
					current_image.is_favorite = true;
					xhr("/api/favorites/" + current_image.id, null, "POST");
				} else {
					current_image.is_favorite = false;
					xhr("/api/favorites/" + current_image.id, null, "DELETE");
				}
				setFavIcon(current_image.is_favorite);
			} else if (gallery == "favorites") {
				xhr("/api/favorites/" + current_image.id, null, "DELETE");
				grid.removeChild(current_image.node);
				modal.onclick();
			}
		} else if (starCallback)
			starCallback();
		else
			window.open("/favorites");
	};
};

var setStarCallback = function(cb) {
	starCallback = cb;
};