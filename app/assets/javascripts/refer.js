var refer = {
	cb: null,
	buddies: [],
	card: null,
	referModalOut: false,
	content: document.createElement('div'),
	build: function () {
		if (!isAuthorized()){
			refer.content.innerHTML = "<div class='really-big centered'>Login To Bump This To A Friend</div>"
			var loginbtn = document.createElement('img');
			loginbtn.className = 'fb-login-btn refer-login-btn';
			loginbtn.src = 'http://assets.tagsurf.co/img/fb_login.png';
			refer.content.appendChild(loginbtn);
			gesture.listen("tap", loginbtn, function() { 
				sessionStorage.setItem("lastPath", current_tag + "~" + currentMedia.id);
				sessionStorage.setItem("shareVotes", JSON.stringify(shareVotes));
				document.location = "http://" + document.location.host + "/users/auth/facebook";
			});
			return;
		}
		refer._buildContent();
		refer._populateBuddies();
	},
	_buildContent: function () {
		var heading = document.createElement('div'),
			searchBar = document.createElement('div'),
			searchIcon = document.createElement('img'),
			searchInput = document.createElement('input'),
			listContainer = document.createElement('div'),
			closebtn = document.createElement('img'),
			sendbtn = document.createElement('div');
		heading.className = "buddy-title";
		heading.innerHTML = "Bump This To";
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
		closebtn.src = "http://assets.tagsurf.co/img/Close.png";
		closebtn.className = "modal-close-button";
		closebtn.id = "refer-close-button";
		sendbtn.className = "msgbox-btn send-btn";
		sendbtn.classList.add(isMobile() ? "biggest" : "really-big");
		sendbtn.innerHTML = "Send";
		refer.content.className = "centered";
		refer.content.style.height = "100%";
		refer.content.appendChild(heading);
		refer.content.appendChild(searchBar);
		refer.content.appendChild(listContainer);
		refer.content.appendChild(sendbtn);
		refer.content.appendChild(closebtn);

		gesture.listen("tap", sendbtn, function() {
			var selectionList = [];
			modal.topModalOut();
			searchBar.children[1].value = "";
			mod({
				className: "buddy-cell",
				show: true,
				value: "table-cell"
			});
			document.getElementById('buddy-list').style.borderSpacing = "2px";
			refer.buddies.forEach(function(b) {
				if(b.selected) {
					selectionList.push(b.id)
					b.selected = !b.selected;
					toggleClass.call(b.cell, "selected-cell");
					toggleClass.call(b.cell.children[2], "hidden");
				}
			});
			if (selectionList.length == 0) {
				return;
			} else if (selectionList.length > 1) {
				var path = "/api/referral/" + refer.card.id + "/{" + selectionList.join(',') + "}";
				xhr(path, "POST");
			} else {
				var path = "/api/referral/" + refer.card.id + "/" + selectionList[0];
				xhr(path, "POST");
			}			
		});
		gesture.listen("down", sendbtn, function () {
		    sendbtn.classList.add('ts-active-button');
	    });
		gesture.listen("up", sendbtn, function () {
		    sendbtn.classList.remove('ts-active-button');
	    });

	    gesture.listen("down", searchBar, function() {
	    	var tinput = searchBar.children[1];
		    	tinput.active = true;
		    	tinput.focus();
	    });
	    gesture.listen("tap", searchBar, function() {
	    	var tinput = searchBar.children[1];
		    	tinput.active = true;
		    	tinput.focus();
	    });
	    searchBar.children[1].onkeyup = function(e) {
			var tinput = searchBar.children[1];
			e = e || window.event;
			var code = e.keyCode || e.which;
			if (code == 13 || code == 3) {
				tinput.value = "";
				mod({
					className: "buddy-cell",
					show: true,
					value: "table-cell"
				});
				document.getElementById('buddy-list').style.borderSpacing = "2px";
			} else if (tinput.value) {
				mod({
					className: "buddy-cell",
					hide: true
				});
				var namefrag = tinput.value.toLowerCase();
				mod({
					className: namefrag,
					show: true,
					value: "table-cell"
				});
				document.getElementById('buddy-list').style.borderSpacing = "0px";
			} else { 
				mod({
					className: "buddy-cell",
					show: true,
					value: "table-cell"
				});
				document.getElementById('buddy-list').style.borderSpacing = "2px";
			}
		};
	},
	startInput: function() {

	},
	_populateBuddies: function () {
		xhr("/api/users/buddies", "GET", function(response_data) {
			refer._updateList(response_data.users);
		});
	},
	_updateList: function(buddies) {
		var listContainer = refer.content.children[2],
			buddyList = document.createElement('table'),
			position = 0;
		buddyList.id = "buddy-list";
		listContainer.innerHTML = "";

		buddies.forEach(function(b) {
			if (currentUser.email == b.users[1])
				return;
			var row = buddyList.insertRow(position),
				buddyCell = row.insertCell(0),
				buddyPic = document.createElement('img'),
				buddyName = document.createElement('div'),
				checkmark = document.createElement('img'),
				username = b.users[2] ? b.users[2] : b.users[1].split("@")[0],
				buddy = {
					id: b.users[0],
					username: username,
					cell: buddyCell, 
					selected: false
				};
			refer.buddies.push(buddy);

			buddyCell.className = 'buddy-cell';
			for (var i = 1; i <= username.length; i++)
				buddyCell.className += " " + username.slice(0, i).toLowerCase();
			buddyPic.src = "http://assets.tagsurf.co/img/UserAvatar.png";
			buddyPic.className = 'buddy-pic';
			buddyName.className = 'buddy-name';
			buddyName.innerHTML += username;  
			checkmark.src = "http://assets.tagsurf.co/img/Checkmark_white.png";
			checkmark.className = 'checkmark hidden';
			buddyCell.appendChild(buddyPic);
			buddyCell.appendChild(buddyName);
			buddyCell.appendChild(checkmark);
			gesture.listen("down", buddyCell, function() {
				if (listContainer.dragging)
					return;
				gesture.triggerDown(listContainer);
				return true;
			});
			gesture.listen("up", buddyCell, function(direction, distance, dx, dy) {
				if (listContainer.dragging)
					return;
				gesture.triggerDrag(listContainer, direction, distance, dx, dy);
				return true;			
			});
			gesture.listen("swipe", buddyCell, function(direction, distance, dx, dy, pixelsPerSecond) {
				gesture.triggerSwipe(listContainer, direction, distance, dx, dy, pixelsPerSecond);
			});
			gesture.listen("tap", buddyCell, function() {
				if (listContainer.dragging)
					return;
				toggleClass.call(checkmark, "hidden");
				buddy.selected = !buddy.selected;
				toggleClass.call(buddyCell, "selected-cell");
			});
			gesture.listen("drag", buddyCell, function(direction, distance, dx, dy, pixelsPerSecond) {
				gesture.triggerDrag(listContainer, direction, distance, dx, dy, pixelsPerSecond);
				return true;
			});
			++position;
		});
		listContainer.appendChild(buddyList);
	    
	    drag.makeDraggable(listContainer, {constraint: "horizontal"});
	},
	on: function (card) {
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