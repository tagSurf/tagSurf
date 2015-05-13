var refer = {
	cb: null,
	buddies: [],
	card: null,
	referModalOut: false,
	content: document.createElement('div'),
	searcher: document.createElement('div'),
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
		refer._buildSearcher();
		refer.populateBuddies();
		refer._fetchAll();
	},
	_buildContent: function () {
		var heading = document.createElement('div'),
			searchBar = document.createElement('div'),
			searchIcon = document.createElement('img'),
			searchInput = document.createElement('input'),
			listContainer = document.createElement('div'),
			closebtn = document.createElement('img'),
			sendbtn = document.createElement('div'),
			addbtn = document.createElement('div'),
			addIcon = document.createElement('img'),
			addMessage = document.createElement('div');
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
		addbtn.id = "add-friends-btn";
		addIcon.id = "add-friends-icon";
		addIcon.src = "http://assets.tagsurf.co/img/plus_white_150.png";
		addMessage.id = "add-friends-message";
		addMessage.innerHTML = "Add<br/>Friends";
		addbtn.appendChild(addIcon);
		addbtn.appendChild(addMessage);
		refer.content.className = "centered";
		refer.content.style.height = "100%";
		refer.content.appendChild(heading);
		refer.content.appendChild(searchBar);
		refer.content.appendChild(listContainer);
		refer.content.appendChild(sendbtn);
		refer.content.appendChild(addbtn);
		refer.content.appendChild(closebtn);

		gesture.listen("down", addbtn, function() {
			document.getElementById('add-friends-btn').style.opacity = 0.4;
		});
		gesture.listen("up", addbtn, function() {
			document.getElementById('add-friends-btn').style.opacity = 1;
		});
		gesture.listen("tap", addbtn, function() {
			modal.topModalIn(refer.searcher);
		});

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
	_buildSearcher: function () {
		var heading = document.createElement('div'),
			searchBar = document.createElement('div'),
			searchIcon = document.createElement('img'),
			searchInput = document.createElement('input'),
			listContainer = document.createElement('div'),
			closebtn = document.createElement('img'),
			sendbtn = document.createElement('div'),
			textContainer = document.createElement('div'),
			connectbtn = document.createElement('div'),
			abookLink = document.createElement('a');
		heading.className = "buddy-title";
		heading.innerHTML = "Search by username";
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
		listContainer.className = "buddy-list-container hidden";
		closebtn.src = "http://assets.tagsurf.co/img/Close.png";
		closebtn.className = "modal-close-button";
		closebtn.id = "refer-close-button";
		sendbtn.className = "msgbox-btn request-btn hidden";
		sendbtn.classList.add(isMobile() ? "biggest" : "really-big");
		sendbtn.innerHTML = "Request";
		abookLink.id = "abook-link";
		abookLink.href = "addressbook://";
		abookLink.appendChild(connectbtn);
		textContainer.className = "buddy-title";
		textContainer.innerHTML = "Or";
		connectbtn.className = "msgbox-btn connect-btn";
		connectbtn.classList.add(isMobile() ? "biggest" : "really-big");
		connectbtn.innerHTML = "Search<br/>Address Book";
		refer.searcher.className = "centered";
		refer.searcher.style.height = "100%";
		refer.searcher.appendChild(heading);
		refer.searcher.appendChild(searchBar);
		refer.searcher.appendChild(listContainer);
		refer.searcher.appendChild(sendbtn);
		if (isUIWebView() && isIos()) {
			refer.searcher.appendChild(textContainer);
			refer.searcher.appendChild(abookLink);
		}
		refer.searcher.appendChild(closebtn);

		gesture.listen("tap", sendbtn, function() {
			var selectionList = [];
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
			} else {
				selectionList.forEach(function(buddy) {
					path = "/api/friend/request/" + buddy;
					xhr(path, "POST", function() {
						messageBox("Success!", "Friend request sent");
					}, function(result) {
						messageBox("Oops", result.reason);
					});
				});
			}
			searchBar.children[1].value = "";
			mod({
				className: "buddy-cell",
				hide: true,
				// value: "table-cell"
			});
			document.getElementsByClassName('buddy-list-container')[0].classList.add('hidden');
			document.getElementsByClassName('request-btn')[0].classList.add('hidden');			
		});
	gesture.listen("down", sendbtn, function () {
	    sendbtn.classList.add('ts-active-button');
    });
	gesture.listen("up", sendbtn, function () {
	    sendbtn.classList.remove('ts-active-button');
    });

	gesture.listen("tap", connectbtn, function() {
			throbber.on();
			var dispatch = document.createEvent("HTMLEvents");
			dispatch.initEvent("click", true, true);
			document.getElementById('abook-link').dispatchEvent(dispatch);
		});
	gesture.listen("down", connectbtn, function () {
	    connectbtn.classList.add('ts-active-button');
    });
	gesture.listen("up", connectbtn, function () {
	    connectbtn.classList.remove('ts-active-button');
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
				document.getElementsByClassName('buddy-list-container')[0].classList.add('hidden');
				document.getElementsByClassName('request-btn')[0].classList.add('hidden');
			} else if (tinput.value) {
				mod({
					className: "buddy-cell",
					hide: true,
				});
				var namefrag = tinput.value.replace(/\s/g, '').toLowerCase();
				mod({
					className: namefrag,
					show: true,
					value: "table-cell"
				});
				document.getElementById('search-list').style.borderSpacing = "0px";
				document.getElementsByClassName('buddy-list-container')[0].classList.remove('hidden');
				document.getElementsByClassName('request-btn')[0].classList.remove('hidden');
			} else { 
				mod({
					className: "buddy-cell",
					hide: true,
					// value: "table-cell"
				});
				document.getElementsByClassName('buddy-list-container')[0].classList.add('hidden');
				document.getElementsByClassName('request-btn')[0].classList.add('hidden');
			}
		};
	},
	startInput: function() {

	},
	populateBuddies: function () {
		xhr("/api/users/buddies", "GET", function(response_data) {
			refer._updateList(response_data.users);
		});
	},
	_fetchAll: function () {
		xhr("/api/users/list", "GET", function(response_data) {
			refer._updateList(response_data.users, true);
		});
	},
	_updateList: function(buddies, all) {
		var listContainer = all ? refer.searcher.children[2] : refer.content.children[2],
			buddyList = document.createElement('table'),
			position = 0;
		buddyList.id = all ? "search-list" : "buddy-list";
		listContainer.innerHTML = "";

		buddies.forEach(function(b) {
			if (currentUser.email == b.users[1])
				return;
			var row = buddyList.insertRow(position),
					buddyCell = row.insertCell(0),
					buddyPic = document.createElement('img'),
					buddyName = document.createElement('div'),
					realName = document.createElement('div'),
					checkmark = document.createElement('img'),
					username = b.users[2] ? b.users[2] : b.users[1].split("@")[0],
					first_name = b.users[3],
					last_name = b.users[4],
					profile_pic = b.users[5],
					buddy = {
						id: b.users[0],
						username: username,
						first_name: first_name,
						last_name: last_name,
						profile_pic: profile_pic,
						cell: buddyCell, 
						selected: false
					};

			refer.buddies.push(buddy);

			buddyCell.className = 'buddy-cell';
			if (!all)
				for (var i = 1; i <= username.length; i++)
					buddyCell.className += " " + username.slice(0, i).toLowerCase();
			else {
				buddyCell.className += " " + username.replace(/\s/g, '').toLowerCase();
				buddyCell.style.display = "none";
			}
			buddyPic.src = profile_pic ? profile_pic : 
								"http://assets.tagsurf.co/img/UserAvatar.png";
			buddyPic.className = 'buddy-pic';
			buddyName.className = 'buddy-name';
			buddyName.innerHTML += username;
			if (first_name && !all) {
				realName.innerHTML += "(" + first_name + " " + last_name + ")"; 
				realName.style.fontSize = "80%"; 
				realName.style.fontWeight = "100";
				buddyName.style.marginTop = isDesktop() ? "0" : "3px";
				buddyName.style.fontWeight = "300";
				buddyName.appendChild(realName);
				for (var i = 1; i <= first_name.length; i++)
					buddyCell.className += " " + first_name.slice(0, i).toLowerCase();
				for (var i = 1; i <= last_name.length; i++)
					buddyCell.className += " " + last_name.slice(0, i).toLowerCase();
			}
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

// Adds button at bottom of friends list to open add-friends modal

 //    if (all)
 //    	return;
	// // 	Add friends button at end of list a personalized list
	// 	var 	plusrow = buddyList.insertRow(position),
	// 				plusCell = plusrow.insertCell(0),
	// 				plusIcon = document.createElement('img'),
	// 				plusText = document.createElement('div'),
	// 				plusBtn = document.createElement('div');

	// 	plusCell.className = 'buddy-cell plus-cell';
	// 	plusText.className = 'plus-message buddy-name block';
	// 	plusText.innerHTML = 'Add Friends';
	// 	plusIcon.className = 'plus-icon block';
	// 	plusIcon.src = "http://assets.tagsurf.co/img/plus_white_150.png";
	// 	plusBtn.className = 'plus-btn';
	// 	plusBtn.appendChild(plusIcon);
	// 	plusBtn.appendChild(plusText);
	// 	plusCell.appendChild(plusBtn);

	// 	gesture.listen("down", plusCell, function() {
	// 		if (listContainer.dragging)
	// 			return;
	// 		plusIcon.src = "http://assets.tagsurf.co/img/plus_gray_150.png";
	// 		plusIcon.style.opacity = "0.4";
	// 		gesture.triggerDown(listContainer);
	// 		return true;
	// 	});
	// 	gesture.listen("up", plusCell, function(direction, distance, dx, dy) {
	// 		if (listContainer.dragging)
	// 			return;
	// 		plusIcon.src = "http://assets.tagsurf.co/img/plus_white_150.png";
	// 		plusIcon.style.opacity = "1.0";
	// 		gesture.triggerDrag(listContainer, direction, distance, dx, dy);
	// 		return true;			
	// 	});
	// 	gesture.listen("swipe", plusCell, function(direction, distance, dx, dy, pixelsPerSecond) {
	// 		gesture.triggerSwipe(listContainer, direction, distance, dx, dy, pixelsPerSecond);
	// 	});
	// 	gesture.listen("tap", plusCell, function() {
	// 		if (listContainer.dragging)
	// 			return;
	// 		modal.topModalIn(refer.searcher);
	// 	});
	// 	gesture.listen("drag", plusCell, function(direction, distance, dx, dy, pixelsPerSecond) {
	// 		gesture.triggerDrag(listContainer, direction, distance, dx, dy, pixelsPerSecond);
	// 		return true;
	// 	});

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

