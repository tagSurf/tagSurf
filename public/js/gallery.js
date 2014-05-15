var gnodes = {}, current_image, favGrid, slideGallery,
	addHistoryItem, gallerize = function(gallery) {
	var picbox, topbar, bigpic, picdesc, pictag;
	var history_slider, grid = document.createElement("div");
	grid.className = "grid";
	gnodes[gallery] = {};
	if (gallery == "favorites")
		favGrid = grid;

//	if (gallery == "history") {
	if (false) { // disabled history slider
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
			addImage(item, getHeader(item.user_stats.time_discovered));
		};
	} else {
		addCss({
			".grid": function() {
				return "height: " + (window.innerHeight - 50) + "px;";
			}
		});
		document.body.appendChild(grid);
	}

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
	var getHeader = function(headerName, gall, g) {
		headerName = headerName || "Just Now";
		g = g || grid;
		var nospace = (gall || gallery) + headerName.replace(/ /g, "");
		var h = document.getElementById(nospace);
		if (!h) {
			h = document.createElement("div");
			h.id = nospace;
			h.className = "header";
			h.innerHTML = headerName;
			h.cells = [];
			(headerName == "Just Now" && g.firstChild) ?
				g.insertBefore(h, g.firstChild) : g.appendChild(h);
		}
		return h;
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

		bigpic.src = image.get(d, window.innerWidth - 40).url;
		picdesc.innerHTML = d.caption;
		pictag.innerHTML = "#" + d.tags[0];
		setFavIcon(current_image.user_stats.has_favorited);
	};
	var updateFavorited = function() {
		var gall, ndata;
		for (gall in gnodes) {
			ndata = gnodes[gall][current_image.id];
			if (ndata)
				ndata.user_stats.has_favorited
					= current_image.user_stats.has_favorited;
		}
		setFavIcon(current_image.user_stats.has_favorited);
	};
	var removeFavImage = function() {
		var cid = current_image.id;
		current_image.user_stats.has_favorited = false;
		xhr("/api/favorites/" + cid, "DELETE");
		if (favGrid) {
			var n = document.getElementById("favorites" + cid);
			var c = n.header.cells;
			var i = c.indexOf(cid);
			n.header.cells = c.slice(0, i).concat(c.slice(i + 1));
			if (!n.header.cells.length) favGrid.removeChild(n.header);
			favGrid.removeChild(n);
		}
	};
	var addImage = function(d, header, gall, g) {
		d.gallery = gall = gall || gallery;
		g = grid || g;
		var n = document.createElement("div");
		n.id = gall + d.id;
		n.className = "box";
		n.style.backgroundImage = "url('" +
			image.get(d, (window.innerWidth - 40) / 3).url + "')";
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

		n.header = header;
		n.header.cells.push(d.id);
		var afterHeader = header.nextSibling;
		afterHeader ? g.insertBefore(n, g.afterHeader) : g.appendChild(n);
		gnodes[gall][d.id] = d;
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
		throbber.on('throbber-bottom');
		xhr(getPath(), null, function(response_data) {
			response_data.data.forEach(function(d) {
				addImage(d, getHeader(d.user_stats.time_discovered));
			});
			populating = false;
			throbber.off();
		});
		chunk_offset += chunk_size;
	};

	buildPicBox();
	populateGallery();

//	var scroller = gallery == "history" ? history_slider : grid;
	var scroller = grid; // disabled history slider
	gesture.listen("up", scroller, returnTrue);
	gesture.listen("down", scroller, returnTrue);
	gesture.listen("drag", scroller, function (direction, distance, dx, dy) {
		var atBottom = (scroller.scrollHeight - scroller.scrollTop 
			=== scroller.clientHeight),
		atTop = (scroller.scrollTop === 0);
		if ((scroller.scrollTop + scroller.offsetHeight) 
			>= (scroller.scrollHeight - 200))
			populateGallery();
		if((atTop && direction == "down") ||
			(atBottom && direction == "up"))
			return false;
		return true;
	});

	document.getElementById("favorites-btn").onclick = function() {
		if (current_image) {
			if (current_image.gallery == "history") {

				// removed history slider, eliminating gallery interactions
				/*if (!current_image.user_stats.has_favorited) {
					current_image.user_stats.has_favorited = true;
					xhr("/api/favorites/" + current_image.id, "POST");
					if (favGrid)
						addImage(JSON.parse(JSON.stringify(current_image)),
							getHeader(current_image.user_stats.time_discovered,
							"favorites", favGrid));
				} else
					removeFavImage();*/
				current_image.user_stats.has_favorited = true;
				xhr("/api/favorites/" + current_image.id, "POST");
				updateFavorited();
			} else if (current_image.gallery == "favorites") {
				removeFavImage();
				updateFavorited();
				modal.callModal();
			}
		} else if (starCallback)
			starCallback();
	};
};
