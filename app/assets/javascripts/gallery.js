var gnodes = {},  
	favGrid, 
	slideGallery,
	addHistoryItem,
	referrals_made = false,
	populateGallery = null,
	chunk_offset = 0,
	srclnk,
	srcbtn,
	gallerize = function(gallery) {
		var picbox, topbar, bigpic, picdesc, pictags, link, refbtn, refbox, srcicon;
		var grid = document.createElement("div");
		var gridwrapper = document.createElement("div");
		grid.className = "grid";
		gridwrapper.className = "gridwrapper";
		gnodes[gallery] = {};
		if (gallery == "favorites") favGrid = grid;
		addCss({
			".gridwrapper": function() {
				return "height: " + (window.innerHeight - 39) +
					"px; width:" + window.innerWidth + "px";
			}
		});
		if (!isMobile() && !isTablet() && !isNarrow())
		 	addCss({
		 		".modal": function() {
		 			return "width: 75%; margin: auto;";
		 		}
		 	});

		document.body.appendChild(gridwrapper);

		if (gallery == "shares"){
			var selector = document.createElement('div'),
				from_box = document.createElement('div'),
				to_box = document.createElement('div'),
				to_badge = document.createElement('div'),
				from_badge = document.createElement('div');

			selector.id = "gallery-toggler";
			to_box.id = "to-selector";
			to_box.innerHTML = "inbox";
			to_box.className = 'inline selected-cell';
			to_badge.id = "to-badge";
			to_badge.className = 'badge-icon small-badge inline hidden';
			from_box.id = "from-selector";		
			from_box.innerHTML = "sent";
			from_box.className = 'inline';
			from_badge.id = "from-badge";
			from_badge.className = 'badge-icon small-badge inline hidden';
			to_box.appendChild(to_badge);
			from_box.appendChild(from_badge);
			selector.appendChild(to_box);
			selector.appendChild(from_box);
			gridwrapper.appendChild(selector);

			gesture.listen("down", to_box, function(){
				toggleClass.call(to_box, "active-cell");
			});
			gesture.listen("up", to_box, function(){
				toggleClass.call(to_box, "active-cell");
			});
			gesture.listen("tap", to_box, function() {
				if(!referrals_made)
					return;
				toggleClass.call(to_box, "selected-cell");
				toggleClass.call(from_box, "selected-cell");
				referrals_made = false;
				grid.innerHTML = "";
				chunk_offset = 0;
				populateGallery();
			});

			gesture.listen("down", from_box, function(){
				toggleClass.call(from_box, "active-cell");
			});
			gesture.listen("up", from_box, function(){
				toggleClass.call(from_box, "active-cell");
			});
			gesture.listen("tap", from_box, function() {
				if(referrals_made)
					return;
				toggleClass.call(from_box, "selected-cell");
				toggleClass.call(to_box, "selected-cell");
				referrals_made = true;
				grid.innerHTML = "";
				chunk_offset = 0;
				populateGallery();
			});
		}
		
		gridwrapper.appendChild(grid);

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
				refbtn = document.getElementById("ref-btn");
				srclnk = document.getElementById("source-link");
				srcbtn = document.getElementById("source-btn");
				srcicon = document.getElementById("source-icon");
				picdesc = document.getElementById("picdesc");
				pictags = document.getElementById("pictags");
				refbox = document.getElementById("referrals");
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
			link = document.createElement('a');
			link.id = "web_link";
			link.setAttribute('target', '_blank');
			gesture.listen("up", bigpic, returnTrue);
			gesture.listen("down", bigpic, returnTrue);
			gesture.listen("drag", bigpic, returnTrue);
			gesture.listen("tap", bigpic, function() {
				if(picbox.dragging)
					return true; 
				else if ((current_gallery_image.type.indexOf('web') != -1) && !isDesktop()) {
					var dispatch = document.createEvent("HTMLEvents");
					dispatch.initEvent("click", true, true);
				    link.dispatchEvent(dispatch);
				} else if (current_gallery_image.type.indexOf('web') == -1) {
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

			//  Refer button stuff
			refbtn = document.createElement("div");
			refbtn.id = "ref-btn";
			refbtn.className = "msgbox-btn";
			refbtn.innerHTML = "Recommend!";
			refbtn.style.marginTop = "10px";
			picbox.appendChild(refbtn);

			gesture.listen("tap", refbtn, function() {
				refer.open();
			});
			gesture.listen("down", refbtn, function () {
			    refbtn.classList.add('ts-active-button');
		    });
			gesture.listen("up", refbtn, function () {
			    refbtn.classList.remove('ts-active-button');
		    });

			// Source icon stuff
			srclnk = document.createElement('a');
			srclnk.setAttribute("target", "_blank");
			srclnk.id = "source-link";
			srcbtn = document.createElement('div');
			srcbtn.id = "source-btn";
			srcicon = document.createElement('img');
			srcicon.id = "source-icon";

			srcbtn.appendChild(srcicon);
			srclnk.appendChild(srcbtn);
			picbox.appendChild(srclnk);

			gesture.listen("down", srclnk, function() {
				srcbtn.style.opacity = 0.5;
			});
			gesture.listen("up", srclnk, function() {
				srcbtn.style.opacity = 1;
			});
			gesture.listen("tap", srclnk, function() {
				if(isDesktop()) return;
				var dispatch = document.createEvent("HTMLEvents");
			    dispatch.initEvent("click", true, true);
			    srclnk.dispatchEvent(dispatch);
			});

			picdesc = document.createElement("div");
			picdesc.id = "picdesc";
			picdesc.className = "centered";
			picbox.appendChild(picdesc);

			refbox = document.createElement("div");
			refbox.id = "referrals";
			refbox.className = "hidden";
			picbox.appendChild(refbox);

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

		var populateReferral = function(ref, card_id) {
			if(!ref)
				return;
			var cell = document.createElement('div'),
				pic = document.createElement('img'),
				usr = document.createElement('div'),
				bumpBtn = document.createElement('div'),
				bumpIcon = document.createElement('img'),
				badge = document.createElement('div'),
				referrer_id = ref.user_id;
			cell.className = "gallery-user-cell";
			pic.className = "gallery-user-pic inline";
			pic.src = "http://assets.tagsurf.co/img/UserAvatar.png";
			usr.className = "gallery-user-name inline";
			usr.innerHTML = ref.username.split("@")[0];
			bumpBtn.className = "gallery-bump-btn";
			bumpIcon.className = "gallery-bump-icon";
			bumpIcon.src = ref.bumped ? "http://assets.tagsurf.co/img/bumped.png" 
				: "http://assets.tagsurf.co/img/bump_white.png";
			bumpBtn.appendChild(bumpIcon);
			
			badge.className = "badge-icon ref-badge hidden";
			if (!ref.seen && ref.seen !== null)
				toggleClass.apply(badge, ["hidden", "off"]);

			cell.appendChild(badge);
			cell.appendChild(pic);
			cell.appendChild(usr);
			cell.appendChild(bumpBtn);
			refbox.appendChild(cell);

			if (referrals_made && !ref.bumped)
				toggleClass.apply(bumpIcon, ["hidden", "on"]);
			
			if(!referrals_made && !ref.bumped) {
				gesture.listen("tap", bumpBtn, function() {
				    bumpIcon.src = "http://assets.tagsurf.co/img/bumped.png";
				    gesture.unlisten(bumpBtn);
				    toggleClass.apply(badge, ["hidden", "on"]);
				    xhr("/api/bump/" + card_id + "/" + referrer_id, "POST", null, null);
				});
				gesture.listen("down", bumpBtn, function () {
				    bumpBtn.classList.add('gallery-bump-btn-active');
			    });
				gesture.listen("up", bumpBtn, function () {
				    bumpBtn.classList.remove('gallery-bump-btn-active');
			    });
			}
		};


		var showImage = function(d) {
			current_gallery_image = d;
			setCurrentMedia(current_gallery_image);
			closebtn = document.getElementById('gallery-close-button');
			toggleClass.call(closebtn, "hidden");
			modal.modalIn(picbox, function(direction) {
				if (!direction || !isNaN(direction) || direction == "right") {
					pushTags();
					current_gallery_image = null;
					setFavIcon(false);
					setCurrentMedia();
					closebtn.classList.add('hidden');
					modal.backOff();
					modal.modalOut();
					if (document.getElementById('web_link'))
						picbox.replaceChild(bigpic, link);
				}
			}, function() { modal.zoomIn(d, function() {
					modal.zoomOut();
					toggleClass.call(closebtn, "hidden");
				}); 
			});
			votize(modal.modal, d);
			modal.backOn();

			topbar.firstChild.innerHTML = "";
			topbar.firstChild.appendChild(voteMeter(d, true));
			topbar.children[2].innerHTML = Object.keys(d.tags[0])[0];

			if (current_gallery_image.type.indexOf('web') != -1) {
				picbox.replaceChild(link, bigpic);
				link.appendChild(bigpic);
				if (isAndroid() && current_gallery_image.deep_link)
					link.setAttribute('href', current_gallery_image.deep_link);
				else if (current_gallery_image.web_link)
					link.setAttribute('href', current_gallery_image.web_link);
			}
			bigpic.src = image.get(d, window.innerWidth - 40).url;
			picdesc.innerHTML = d.caption;
			pictags.innerHTML = "";
			d.tags.forEach(function(objwrap) {
				for (var tagName in objwrap) if (tagName)
					buildTagBlock(objwrap, tagName);
			});
			setFavIcon(current_gallery_image.user_stats.has_favorited);

			srclnk.href = d.deep_link ? d.deep_link : d.web_link;
			srcicon.src = d.source_icon;

			if (d.referral && gallery == "shares") {
				refbox.innerHTML = referrals_made ? "Recommended To" 
														: "Recommended By";
				toggleClass.apply(refbox, ["hidden", "off"]);
				var badge = document.getElementById(d.id + "-badge");
				d.referral.forEach(function(r) {
					populateReferral(r, d.id);
					if (!r.seen && r.seen !== null){
						if (r.bump_id)
							xhr("/api/bump/seen/" + r.bump_id, "GET", null, null);
						else 
							xhr("/api/referral/seen/" + r.referral_id, "GET", null, null);
					}
				});
				badge.innerHTML = 0
				toggleClass.apply(badge, ["hidden", "on"]);
			}
			else
				toggleClass.apply(refbox, ["hidden", "on"]);
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
			current_gallery_image.tags.push(objwrap);
			buildTagBlock(objwrap, tag);
			analytics.track('Add Tag from Gallery', {
				card: current_gallery_image.id,
				gallery: current_gallery_image.gallery,
				tag_added: tag
			});
		});
		var updateFavorited = function() {
			var gall, ndata;
			for (gall in gnodes) {
				ndata = gnodes[gall][current_gallery_image.id];
				if (ndata)
					ndata.user_stats.has_favorited
						= current_gallery_image.user_stats.has_favorited;
			}
			setFavIcon(current_gallery_image.user_stats.has_favorited);
		};
		var removeFavImage = function() {
			var cid = current_gallery_image.id;
			current_gallery_image.user_stats.has_favorited = false;
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

			// Gallery badge stuff  
			var badge = document.createElement("div"), 
				badge_count = 0;
			badge.id = d.id + "-badge";
			badge.className = "badge-icon small-badge inline chicklet-badge hidden";
			if (d.referral) {
				d.referral.forEach(function(r) {
					if(!r.seen && r.seen !== null)
						badge_count += 1;
				});
			};
			badge.innerHTML = badge_count;
			if (badge_count != 0 && gallery == "shares")
				toggleClass.apply(badge, ["hidden", "off"]);

			n.appendChild(badge);
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
		var populating = false;
		var getPath = function() {
			if (gallery == "tag")
				return "/api/media/" + location.hash.slice(1);
			else if (gallery == "shares")
				return "/api/referral/" + (referrals_made ? "made" : "received") + "/paginated/" + chunk_size + "/" + chunk_offset;
			return "/api/" + gallery + "/paginated/" + chunk_size + "/" + chunk_offset;
		};
		populateGallery = function() {
			if (populating)
				return;
			populating = true;
			throbber.on(false, 'throbber-bottom');
			xhr(getPath(), null, function(response_data) {
				response_data.data.forEach(function(d) {
					addImage(d, getHeader(gallery == "shares" ? 
						d.referral[d.referral.length - 1].time : (gallery == "favorites" ? 
								d.user_stats.time_favorited : d.user_stats.time_discovered)));
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
			if (current_gallery_image) {
				if (gallery == "history" || gallery == "shares") {
					current_gallery_image.user_stats.has_favorited =
						!current_gallery_image.user_stats.has_favorited;
					xhr("/api/favorites/" + current_gallery_image.id,
						current_gallery_image.user_stats.has_favorited
							? "POST" : "DELETE", null, null);
					updateFavorited();
					if (current_gallery_image.user_stats.has_favorited){
						analytics.track('Favorite from Gallery',{
							card: current_gallery_image.id,
							gallery: current_gallery_image.gallery
						});
					} else {
						analytics.track('Unfavorite from Gallery',{
							card: current_gallery_image.id,
							gallery: current_gallery_image.gallery
						});
					};
				} else if (current_gallery_image.gallery == "favorites") {
					removeFavImage();
					updateFavorited();
					modal.callModal();
					analytics.track('Unfavorite from Gallery',{
						card: current_gallery_image.id,
						gallery: current_gallery_image.gallery
					});
				}
			} else if (starCallback)
				starCallback();
		};
	},
	updateGalleryBadges = function(referrals, bumps, first_load) {
	  var to_Badge = document.getElementById('to-badge'),
	      from_Badge = document.getElementById('from-badge');
	  
	  toggleClass.apply(to_Badge, ["hidden",  referrals != 0 ? "off" : "on"]);
	  toggleClass.apply(from_Badge, ["hidden", bumps != 0 ? "off" : "on"]);

	  if (!first_load && ((to_Badge.innerHTML < referrals && !referrals_made)
	  	 || (from_Badge.innerHTML < bumps && referrals_made))) {
		document.getElementsByClassName('grid')[0].innerHTML = "";
		chunk_offset = 0;
		populateGallery();
	  }
	  
	  to_Badge.innerHTML = referrals;
	  from_Badge.innerHTML = bumps;
	};
