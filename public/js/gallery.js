var current_image, favGrid, starCallback, slideGallery,
	addHistoryItem, gallerize = function(gallery) {
	var picbox, topbar, bigpic, picdesc, pictag;
	var history_slider, grid = document.createElement("div");
	grid.className = "grid";
	if (gallery == "favorites")
		favGrid = grid;

	if (gallery == "history") {
		history_slider = document.createElement("div");
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

	var voteMeter = function(d, trending, fullRound) {
		var bottom = document.createElement("div");
		bottom.className = "overlay votes";
		if (fullRound) bottom.className += " round";
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
		return bottom;
	};
	var buildPicBox = function() {
		picbox = document.getElementById("picbox");
		if (picbox) { // image detail modal frame already exists
			topbar = document.getElementById("topbar");
			bigpic = document.getElementById("bigpic");
			picdesc = document.getElementById("picdesc");
			pictag = document.getElementById("pictag");
			return;
		}

		picbox = document.createElement("div");
		picbox.id = "picbox";

		topbar = document.createElement("div");
		topbar.id = "topbar";
		topbar.innerHTML = "<div id='votemeter'></div>"
			+ "<span class='blue'>#</span>"
			+ "<span id='toptag'></span>";
		picbox.appendChild(topbar);

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
	var votize = function(n, d) {
		n.className += ((d.user_stats.vote == "up")
			? " green" : " red") + "line";
	};
	var showImage = function(d) {
		current_image = d;
		modal.modalIn(picbox, function(direction) {
			if (!direction || !isNaN(direction) || direction == "right") {
				current_image = null;
				setFavIcon(false);
				modal.backOff();
				modal.modalOut();
			}
		});
		votize(modal.modal, d);
		modal.backOn();

		topbar.firstChild.innerHTML = "";
		topbar.firstChild.appendChild(voteMeter(d, d.trend == "up", true));
		topbar.children[2].innerHTML = d.tags[0];

		bigpic.src = image.get(d, window.innerWidth - 40);
		picdesc.innerHTML = d.caption;
		pictag.innerHTML = "#" + d.tags[0];
		setFavIcon(current_image.user_stats.has_favorited);
	};
	var addImage = function(d, front) {
		var n = document.createElement("div");
		n.id = gallery + d.id;
		n.className = "box";
		n.style.backgroundImage = "url('" +
			image.get(d, (window.innerWidth - 40) / 3) + "')";
		votize(n, d);

		var top = document.createElement("div");
		top.className = "overlay tag";
		top.innerHTML = "#" + d.user_stats.tag_voted;

		var spacer = document.createElement("div");
		spacer.style.paddingTop = "70%";

		n.appendChild(top);
		n.appendChild(spacer);
		n.appendChild(voteMeter(d, d.trend == "up"));
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
				addHeader(d.user_stats.time_discovered);
				addImage(d);
			});
			populating = false;
		});
		chunk_offset += chunk_size;
	};

	buildPicBox();
	populateGallery();

	var scroller = history_slider || grid;
	gesture.listen("down", scroller, function () {return true;});
	gesture.listen("drag", scroller, function (direction, distance, dx, dy) {
		var atBottom = (scroller.scrollHeight - scroller.scrollTop 
			=== scroller.clientHeight),
		atTop = (scroller.scrollTop === 0);
		if ((scroller.scrollTop + scroller.offsetHeight) 
			>= (scroller.scrollHeight - 100))
			populateGallery();
		if((atTop && direction == "down") ||
			(atBottom && direction == "up"))
			return false;
		return true;
	});

	document.getElementById("favorites-btn").onclick = function() {
		if (current_image) {
			if (current_image.gallery == "history") {
				if (favGrid)
					var favNode = document.getElementById("favorites" + current_image.id);
				if (!current_image.user_stats.has_favorited) {
					current_image.user_stats.has_favorited = true;
					xhr("/api/favorites/" + current_image.id, "POST");
					favGrid && favGrid.insertBefore(favNode, favGrid.firstChild);
				} else {
					current_image.user_stats.has_favorited = false;
					xhr("/api/favorites/" + current_image.id, "DELETE");
					favGrid && favGrid.removeChild(favNode);
				}
				setFavIcon(current_image.user_stats.has_favorited);
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
