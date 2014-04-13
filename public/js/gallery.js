var gallerize = function() {
	addCss(".modal { -webkit-transform: translate3d("
		+ window.innerWidth + "px, 0, 0); }");

	var grid = document.getElementById("grid");
	var now = new Date();
	var day = 1000 * 60 * 60 * 24;
	var week = day * 7;
	var week2 = week * 2;
	var blackout, modal, bigpic, picdesc, pictag;

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
		bigpic.src = "http://" + d.src;
		bigpic.style.maxHeight = (modal.clientHeight * 3 / 4) + "px";
		picdesc.innerHTML = d.title;
		pictag.innerHTML = "#" + d.tag;
	};
	var addImage = function(d) {
		var n = document.createElement("div");
		n.className = "box";
		n.style.backgroundImage = "url('http://" + d.src + "')";
		n.style.border = "1px solid " + (d.vote ? "green" : "red");

		var top = document.createElement("div");
		top.className = "overlay tag";
		top.innerHTML = "#" + d.tag;

		var spacer = document.createElement("div");
		spacer.style.paddingTop = "70%";

		var bottom = document.createElement("div");
		bottom.className = "overlay votes";
		bottom.style.background = d.trending ? "red" : "green";

		var vote_meter = document.createElement("div");
		var vtotal = d.likes + d.dislikes;
		if (d.trending) {
			vote_meter.className = "yesvotes";
			vote_meter.style.width = (100 * d.likes / vtotal) + "%";
		} else {
			vote_meter.className = "novotes";
			vote_meter.style.width = (100 * d.dislikes / vtotal) + "%";
		}
		bottom.appendChild(vote_meter);

		var vote_count = document.createElement("div");
		vote_count.className = "votecount";
		vote_count.innerHTML = vtotal;
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
	test_data.forEach(function(d) {
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

	var history_slider = document.getElementById("history_slider");
	if (history_slider)
		addCss("#history_slider { -webkit-transform: translate3d(0, -"
			+ (history_slider.offsetHeight + 20) + "px, 0); } #grid { height: "
			+ (history_slider.offsetHeight - 10) + "px; }");
};

var slideGallery = function() {
	toggleClass.call(document.getElementById("history_slider"), "modalslide");
};