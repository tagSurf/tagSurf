var gallerize = function(gallery) {
	addCss(".modal { -webkit-transform: translate3d("
		+ window.innerWidth + "px, 0, 0); }");

	var grid = document.getElementById("grid");
	var now = new Date();
	var day = 1000 * 60 * 60 * 24;
	var week = day * 7;
	var week2 = week * 2;
	var blackout, modal, bigpic, picdesc, pictag;
	gallery = gallery || "history";

	var buildModal = function() {
		blackout = document.createElement("div");
		blackout.className = "blackout";

		modal = document.createElement("div");
		modal.className = "modal";

		bigpic = document.createElement("img");
		bigpic.className = "bigpic";
		modal.appendChild(bigpic);

		picdesc = document.createElement("div");
		picdesc.className = "picdesc";
		modal.appendChild(picdesc);

		var pictagbox = document.createElement("div");
		pictagbox.className = "pictagbox";
		pictag = document.createElement("span");
		pictag.className = "pictag";
		pictagbox.appendChild(pictag);
		modal.appendChild(pictagbox);

		modal.onclick = function() {
			blackout.className = blackout.className.replace(" blackfade", "");
			modal.className = modal.className.replace(" modalslide", "");
		};
		document.body.appendChild(blackout);
		document.body.appendChild(modal);
	};
	var addHeader = function(headerName) {
		var nospace = headerName.replace(/ /g, "");
		if (document.getElementById(nospace))
			return;
		var h = document.createElement("div");
		h.id = nospace;
		h.className = "header";
		h.innerHTML = headerName;
		grid.appendChild(h);
	};
	var showImage = function(d) {
		modal.className += " modalslide";
		blackout.className += " blackfade";
		bigpic.src = d.image_link_original;
		bigpic.style.maxHeight = (modal.clientHeight * 3 / 4) + "px";
		picdesc.innerHTML = d.title;
		pictag.innerHTML = "#" + d.tag;
	};
	var addImage = function(d) {
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
		grid.appendChild(n);
	};

	buildModal();

	// gallery feed builder
	var chunk_size = 20;
	var chunk_offset = 0;

	// TODO: remove when APIs solidify...
	var gmap = { history: "history/paginated", favorites: "favorites" };

	var populateGallery = function() {
		var getPath = "/api/" + (gmap[gallery] || gallery) + "/" + chunk_size + "/" + chunk_offset;
		chunk_offset += chunk_size;
		xhr(getPath, function(response_data) {
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
	};
	populateGallery();

	var history_slider = document.getElementById("history_slider");
	if (history_slider)
		addCss("#history_slider { -webkit-transform: translate3d(0, -"
			+ (history_slider.offsetHeight + 20) + "px, 0); } #grid { height: "
			+ (history_slider.offsetHeight - 10) + "px; }");
};

var slideGallery = function() {
	var hs = document.getElementById("history_slider");
	hs.style.opacity = "1";
	toggleClass.call(hs, "modalslide");
};