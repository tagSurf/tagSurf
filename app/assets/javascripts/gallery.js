var gnodes = {}, current_image, favGrid, slideGallery,
	addHistoryItem, gallerize = function(gallery) {
	var picbox, topbar, bigpic, picdesc, pictags;
	var grid = document.createElement("div");
	var gridwrapper = document.createElement("div");
	grid.className = "grid";
	gridwrapper.className = "gridwrapper";
	gnodes[gallery] = {};
	if (gallery == "favorites") favGrid = grid;
	addCss({
		".gridwrapper": function() {
			return "height: " + (window.innerHeight - 50) +
				"px; width:" + window.innerWidth + "px";
		}
	});
	if (!isMobile() && !isTablet() && !isNarrow())
	 	addCss({
	 		".modal": function() {
	 			return "width: 75%; margin: auto;";
	 		}
	 	});
	gridwrapper.appendChild(grid);
	document.body.appendChild(gridwrapper);

	var voteMeter = function(d, fullRound) {
		var trending = d.trend == "up";
		var bottom = document.createElement("div");
		bottom.className = "overlay votes";
		if (fullRound) bottom.className += " round";
		bottom.style.background = trending ? "red" : "#00a651";

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
		vote_count.innerHTML = d.score;
		bottom.appendChild(vote_count);
		return bottom;
	};
	var buildPicBox = function() {
		picbox = document.getElementById("picbox");
		if (picbox) { // image detail modal frame already exists
			topbar = document.getElementById("topbar");
			bigpic = document.getElementById("bigpic");
			picdesc = document.getElementById("picdesc");
			pictags = document.getElementById("pictags");
			return;
		}
		var closebtn = document.createElement('img');
		closebtn.src = "http://assets.tagsurf.co/img/Close.png";
		closebtn.className = "modal-close-button hidden";
		closebtn.id = "gallery-close-button";

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
		gesture.listen("up", bigpic, returnTrue);
		gesture.listen("down", bigpic, returnTrue);
		gesture.listen("drag", bigpic, returnTrue);
		gesture.listen("tap", bigpic, function() {
			if(picbox.dragging)
				return true; 
			else {
				modal.zoomModal();
				toggleClass.call(closebtn, "hidden");
			}
		});
		gesture.listen("swipe", bigpic, function (direction, distance, dx, dy, pixelsPerSecond) {
			if (direction != "up" && direction != "down")
			{
				modal.callModal();
			}
			else
			{
				gesture.triggerSwipe(modal.modal, direction, distance, dx, dy, pixelsPerSecond);
			}
		});
		modal.setPinchLauncher(bigpic);
		bigpic.onload = function (event)
		{
			if (modal.modal.offsetHeight < picbox.scrollHeight)
			{
				modal.modal.style['overflow-y'] = "scroll";
				drag.makeDraggable(modal.modal, {
					constraint: "horizontal",
					up: function (direction) {
						if (direction == 'left' ||
							direction == 'right')
						{
							modal.callModal();
						}
					},
				});
			}
			else
			{
				modal.modal.style['overflow-y'] = "auto";
				picbox.style['-webkit-transform'] = "translate3d(0,0,0)";
				gesture.unlisten(picbox);
			}
		};
		picbox.appendChild(bigpic);

		picdesc = document.createElement("div");
		picdesc.id = "picdesc";
		picdesc.className = "centered";
		picbox.appendChild(picdesc);

		pictags = document.createElement("div");
		pictags.id = pictags.className = "pictags";
		picbox.appendChild(pictags);

		gesture.listen("tap", closebtn, function() { 
			modal.callModal();
		});
		document.body.appendChild(closebtn);
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
	var buildTagBlock = function(objwrap, tagName) {
		var p = document.createElement("div");
		p.className = "pictagcell";
		var t = document.createElement("div");
		t.className = "smallpadded midsize tcell";
		t.innerHTML = "#" + tagName;
		p.appendChild(t);
		if (objwrap[tagName].user_owned) {
			var delNode = document.createElement("div");
			delNode.className = "smallpadded delNode tcell";
			delNode.innerHTML = "x";
			p.appendChild(delNode);
		}
		// voteMeters in galleries go away until we have more users
		// p.appendChild(voteMeter(objwrap[tagName]));
		gesture.listen("down", p , function() {
			p.classList.add("active-pictag");
		});
		gesture.listen("up", p, function() {
			p.classList.remove("active-pictag");
		});
		gesture.listen("tap", p, function() {
			if (objwrap[tagName].user_owned) {
				rmTag(tagName);
				pictags.removeChild(p);
			} else
				location = "/feed#" + tagName;
		});
		pictags.appendChild(p);
	};
	var showImage = function(d) {
		current_image = d;
		setCurrentMedia(current_image);
		closebtn = document.getElementById('gallery-close-button');
		toggleClass.call(closebtn, "hidden");
		modal.modalIn(picbox, function(direction) {
			if (!direction || !isNaN(direction) || direction == "right") {
				pushTags();
				current_image = null;
				setFavIcon(false);
				setCurrentMedia();
				closebtn.classList.add('hidden');
				modal.backOff();
				modal.modalOut();
			}
		}, function() { modal.zoomIn(d, function() {
				modal.zoomOut();
			}); 
		});
		votize(modal.modal, d);
		modal.backOn();

		topbar.firstChild.innerHTML = "";
		topbar.firstChild.appendChild(voteMeter(d, true));
		topbar.children[2].innerHTML = d.tags[0];

		bigpic.src = image.get(d, window.innerWidth - 40).url;
		picdesc.innerHTML = d.caption;
		
		// tags_v2 example:
		/*
			[
				{
					"pics": {
						"total_votes":15,
						"down_votes":1,
						"up_votes":14,
						"score":14,
						"is_trending":false,
						"trend":"down"
					}
				},
				{
					"trending": {
						"total_votes":0,
						"down_votes":0,
						"up_votes":0,
						"score":0,
						"is_trending":false,
						"trend":"up"
					}
				},
				{
					"": {
						"total_votes":4,
						"down_votes":3,
						"up_votes":1,
						"score":1,
						"is_trending":false,
						"trend":"down"
					}
				}
			]
		*/
		// the API shouldn't return data formatted like this
		pictags.innerHTML = "";
		d.tags_v2.forEach(function(objwrap) {
			for (var tagName in objwrap) if (tagName)
				buildTagBlock(objwrap, tagName);
		});
		setFavIcon(current_image.user_stats.has_favorited);
	};
	setAddCallback(function(tag) {
		var objwrap = {};
		objwrap[tag] = {
			total_votes: 0,
			down_votes: 0,
			up_votes: 0,
			score: 0,
			is_trending: false,
			trend: "up",
			user_owned: true
		};
		current_image.tags_v2.push(objwrap);
		buildTagBlock(objwrap, tag);
		analytics.track('Add Tag from Gallery', {
			card: current_image.id,
			gallery: current_image.gallery,
			tag_added: tag
		});
	});
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
		xhr("/api/favorites/" + cid, "DELETE", null, null);
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
			image.get(d, (window.innerWidth - 40) / 3, true).url + "')";
		votize(n, d);

		var top = document.createElement("div");
		top.className = "overlay tag";
		top.innerHTML = "#" + d.user_stats.tag_voted;

		var spacer = document.createElement("div");
		var boxWidth = Math.round((window.innerWidth - 6) * .2975),
			spacerHeight = (boxWidth - 28),
			spacerHeightPercent = Math.round(100 * (spacerHeight / boxWidth));
		spacer.style.paddingTop = spacerHeightPercent + "%";

		n.appendChild(top);
		n.appendChild(spacer);
		n.appendChild(voteMeter(d));
		if (d.image.animated)
			spacer.className = "playoverlay";
		gesture.listen("down", n, function() {
			gesture.triggerDown(gridwrapper);
			return true;
		});
		gesture.listen("drag", n, function(direction, distance, dx, dy) {
			gesture.triggerDrag(gridwrapper, direction, distance, dx, dy);
			return true;
		});
		gesture.listen("swipe", n, function(direction, distance, dx, dy, pixelsPerSecond) {
			gesture.triggerSwipe(gridwrapper, direction, distance, dx, dy, pixelsPerSecond);
		});
		gesture.listen("up", n, function() {
			gesture.triggerUp(gridwrapper);
			return true;
		});
		gesture.listen("tap", n, function() {
			gridwrapper.dragging || showImage(d);
		});

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
		throbber.on(false, 'throbber-bottom');
		xhr(getPath(), null, function(response_data) {
			response_data.data.forEach(function(d) {
				addImage(d, getHeader(gallery == "favorites" ?
					d.user_stats.time_favorited : d.user_stats.time_discovered));
			});
			populating = false;
			throbber.off();
		}, function() { populating = false; });
		chunk_offset += chunk_size;
	};

	buildPicBox();
	populateGallery();

	drag.makeDraggable(gridwrapper, {
		constraint: "horizontal",
		swipe: populateGallery,
		drag: function(direction, distance, dx, dy) {
			var trueScrollTop = gridwrapper.scrollTop ? gridwrapper.scrollTop
				: (gridwrapper.yDrag ? -gridwrapper.yDrag : 0);
			if (((trueScrollTop + gridwrapper.offsetHeight) >= gridwrapper.scrollHeight - 60)
				&& (!direction || direction == "down"))
				populateGallery();
		}
	});

	document.getElementById("favorites-btn").onclick = function() {
		if (current_image) {
			if (current_image.gallery == "history") {
				current_image.user_stats.has_favorited =
					!current_image.user_stats.has_favorited;
				xhr("/api/favorites/" + current_image.id,
					current_image.user_stats.has_favorited
						? "POST" : "DELETE", null, null);
				updateFavorited();
				if (current_image.user_stats.has_favorited){
					analytics.track('Favorite from Gallery',{
						card: current_image.id,
						gallery: current_image.gallery
					});
				} else {
					analytics.track('Unfavorite from Gallery',{
						card: current_image.id,
						gallery: current_image.gallery
					});
				};
			} else if (current_image.gallery == "favorites") {
				removeFavImage();
				updateFavorited();
				modal.callModal();
				analytics.track('Unfavorite from Gallery',{
					card: current_image.id,
					gallery: current_image.gallery
				});
			}
		} else if (starCallback)
			starCallback();
	};
};