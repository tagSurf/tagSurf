var refer = {
	cb: null,
	buddies: null,
	card: null,
	referModalOut: false,
	content: document.createElement('div'),
	build: function ()
	{
		refer._buildContent();
		refer._populateBuddies();
	},
	_buildContent: function ()
	{
		var heading = document.createElement("div"),
			searchBar = document.createElement("div"),
			searchIcon = document.createElement("img"),
			searchInput = document.createElement('input'),
			listContainer = document.createElement("div"),
			closebtn = document.createElement("img"),
			sendbtn = document.createElement("div");
		heading.className = "really-big";
		heading.innerHTML = "Recommend This To";
		searchBar.className = "search-bar";
		searchIcon.src = "http://assets.tagsurf.co/img/search_white.png"
		searchIcon.className = "search-icon";
		searchInput.id = "buddy-search";
		searchInput.setAttribute("type", "text");
		searchInput.setAttribute("spellcheck", "false");
		searchInput.setAttribute("autocomplete", "off");
		searchInput.setAttribute("autocapitalize", "off");
		searchInput.setAttribute("autocorrect", "off");	
		searchBar.appendChild(searchIcon);
		searchBar.appendChild(searchInput);
		listContainer.className = "buddy-list-container";
		listContainer.id = "buddy-list";
		closebtn.src = "http://assets.tagsurf.co/img/Close.png";
		closebtn.className = "modal-close-button";
		closebtn.id = "refer-close-button";
		sendbtn.className = "msgbox-btn really-big send-btn";
		sendbtn.innerHTML = "Send";
		refer.content.className = "centered";
		refer.content.appendChild(heading);
		refer.content.appendChild(searchBar);
		refer.content.appendChild(listContainer);
		refer.content.appendChild(sendbtn);
		refer.content.appendChild(closebtn);
		gesture.listen("tap", sendbtn, function() {
	// Select the cell
		});
		gesture.listen("down", sendbtn, function () {
		    sendbtn.classList.add('ts-active-button');
	    });
		gesture.listen("up", sendbtn, function () {
		    sendbtn.classList.remove('ts-active-button');
	    });
	},
	_populateBuddies: function ()
	{
		xhr("/api/users/buddies", "GET", function(response_data) {
			refer.buddies = response_data.users;
			refer._updateList();
		});
	},
	_updateList: function()
	{
		var buddyList = refer.content.children[2];
		refer.buddies.forEach(function(b) {
			var buddyCell = document.createElement('div'),
				buddyPic = document.createElement('img'),
				buddyName = document.createElement('div'),
				checkmark = document.createElement('img');
			buddyCell.className = 'buddy-cell';
			buddyPic.src = "http://assets.tagsurf.co/img/UserAvatar.png";
			buddyPic.className = 'buddy-pic';
			buddyName.className = 'buddy-name';
			buddyName.innerHTML = b.users[1].split("@")[0];	
			checkmark.src = "http://assets.tagsurf.co/img/Checkmark.png";
			checkmark.className = 'checkmark hidden';
			buddyCell.appendChild(buddyPic);
			buddyCell.appendChild(buddyName);
			buddyCell.appendChild(checkmark);
			gesture.listen("down", buddyCell, function() {
				buddyCell.classList.add('active-buddy-cell');
			});
			gesture.listen("up", buddyCell, function() {
				buddyCell.classList.remove('active-buddy-cell');
			});
			gesture.listen("tap", buddyCell, function(buddy) {
				console.log(buddy.users[0]);
			});
			buddyList.appendChild(buddyCell);
		});

	},
	on: function (card)
	{
		if (card)
			refer.card = card;
	},
	open: function() {
		modal.topModalIn(refer.content, refer.close);
		refer.referModalOut = true;
		analytics.track('Open Refer Window', {
			card: refer.card.id,
			surfing: current_tag
		});
		refer.cb && refer.cb();
	},
	close: function() {
		modal.topModalOut();
		refer.referModalOut = false;
		analytics.track('Close Refer Window', {
			card: refer.card.id,
			surfing: current_tag
		});
	}
};
refer.build();