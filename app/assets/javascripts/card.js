var card_proto = {
	_init: function(data) {
		if (data) {
			var self = this;
			this.data = data;
			this.id = data.id;
			this.image = data.image;
			this.animated = data.image.animated;
			this.type = data.type;
			this.web_link = data.web_link;
			this.deep_link = data.deep_link;
			this.source = data.source;
			this.referral = data.referral;
			data.tags.forEach(function(tag) { 
				self.tags.push(tag); 
			});
			self.tags.forEach(function(tagobj) {
				var t = Object.keys(tagobj)[0];
				if (t == "trending")
					self.trending = true;
			});
		}
		else 
			return;
	},
	_build: function() {
		if (!this.data)
			this.wavesOn();
		else if (this.type.indexOf("content") != -1)
			this._buildContentCard();
		else if (this.type == "login") 
			this._buildLoginCard();
		else
			this.wavesOn();
	},
	_buildContentCard: function() {
		var	imageContainer, iconLine, textContainer, picTags, fullscreenButton, truncatedTitle, 
			container = this.contents,
			formattingContainer = document.getElementById('formatter'),
			card = this,
			imageTemplate = (card.type.indexOf('web') != -1) ? "<a href='" + (isAndroid() ? (card.deep_link ? card.deep_link : card.web_link) : card.web_link) + "' target='_blank'>" + "<div class='image-container expand-animation'><img src= ></div></a>" : "<div class='image-container expand-animation'><img src= ></div>",
			cardTemplate = imageTemplate + 
			"<div id='refer-btn' class='msgbox-btn'>Bump It!</div>" + 				
			"<div class='icon-line'>" +
			"<a href='" + (card.deep_link ? card.deep_link : card.web_link) + "' target='_blank'><div id='source-btn'><img class='source-icon' src='" + card.data.source_icon + "'></div></a>" +
			"<span class='tag-callout pointer'><img src='http://assets.tagsurf.co/img/trending_icon_blue.png'>&nbsp;#" + Object.keys(card.data.tags[0])[0] + "</span>" +
			"</div><div class='text-container'><p>" + card.data.caption + "</p></div>" +
			(this.referral ? "<div class='referrals'>Bumped To You By<div class='referral-scroller'></div></div>" : "") +
			"<div id='pictags" + card.id + "' class='pictags'></div><div class='expand-button'><img src='http://assets.tagsurf.co/img/down_arrow.png'></div><div id='thumb-vote-container'><img class='thumb-up' src='http://assets.tagsurf.co/img/thumbsup.png'><img class='thumb-down' src='http://assets.tagsurf.co/img/thumbsdown.png'></div><div class='super-label'>SUPER VOTE</div>";
		this.surfsUp = true;
		formattingContainer.appendChild(container);
		container.className = 'card-container';
		this.wrapper.className = 'card-wrapper';
		container.innerHTML = cardTemplate;
		imageContainer = container.children[0];
		iconLine = container.children[2];
		textContainer = container.children[3];
		picTags = this.referral ? container.children[5] : container.children[4];
		fullscreenButton = this.referral ? container.children[6] : container.children[5];
		if (this.trending && (current_tag == "trending")) {
			gesture.listen("down", iconLine.children[1], function() {
				iconLine.children[1].classList.add("active-tag-callout");
				iconLine.children[1].firstChild.src = "http://assets.tagsurf.co/img/trending_icon_gray.png";
			});
			gesture.listen("up", iconLine.children[1], function() {
				iconLine.children[1].classList.remove("active-tag-callout");
				iconLine.children[1].firstChild.src = "http://assets.tagsurf.co/img/trending_icon_blue.png";
			});
			gesture.listen("tap", iconLine.children[1], function() {
				autocomplete.tapTag(Object.keys(current_deck.topCard().tags[0])[0], "autocomplete", false);
			});
		} else
			iconLine.children[1].style.display = "none";
		gesture.listen("down", iconLine.children[0].firstChild, function() {
			iconLine.children[0].firstChild.style.opacity = 0.5;
		});
		gesture.listen("up", iconLine.children[0].firstChild, function() {
			iconLine.children[0].firstChild.style.opacity = 1;
		});
		gesture.listen("tap", iconLine.children[0].firstChild, function() {
			if(isDesktop()) return;
			var dispatch = document.createEvent("HTMLEvents");
		    dispatch.initEvent("click", true, true);
		    current_deck.topCard().contents.children[2].children[0].dispatchEvent(dispatch);
		});
		gesture.listen("tap", container.children[1], function() {
			refer.open();
		});
		gesture.listen("down", container.children[1], function () {
		    current_deck.topCard().contents.children[1].classList.add('ts-active-button');
	    });
		gesture.listen("up", container.children[1], function () {
		    current_deck.topCard().contents.children[1].classList.remove('ts-active-button');
	    });

	    if (this.referral)
	    	this.populateReferrals();

		this.tags.sort(function(a, b) {
			var aName = Object.keys(a)[0];
			var bName = Object.keys(b)[0];
			return a[aName].score < b[bName].score;
		});
		this.tags.forEach(function(tagobj) {
			var t = Object.keys(tagobj)[0];
			t && card.tagCard(t);
		});
		this.cbs.start && this.cbs.start(this.contents);
		if (this.oneTimeCbs.start) {
			this.oneTimeCbs.start();
			this.oneTimeCbs.start = null;
		}
		this.isContent = true;
		this._formatContents(image.get(this.data));
		formattingContainer.removeChild(container);
		this.wrapper.appendChild(container);
		this.setSource(); 
		this.built = true;
		this.swipable = true;
	},
	setSource: function() {
		if(this.type.indexOf('web') != -1)
			this.contents.children[0].children[0].firstChild.src = image.get(this.data, 
				window.innerWidth - 40).url;
		else
			this.contents.children[0].firstChild.src = image.get(this.data, 
				window.innerWidth - 40).url;
	},
	_formatContents: function (imageData) {
		if (this.type.indexOf("content") == -1)
			return;
		var imageContainer = (this.type.indexOf("web") != -1) ? this.contents.firstChild.firstChild 
																	:this.contents.firstChild,
			fullscreenButton = this.referral ? this.contents.children[6] : this.contents.children[5], 
			truncatedTitle,
			picTags = this.referral ? this.contents.children[5] : this.contents.children[4], 
			textContainer = this.contents.children[3],
			iconLine = this.contents.children[2], 
			targetHeight = imageData ? 
				imageData.height * (window.innerWidth - 40) / imageData.width :
				this.contents.firstChild.scrollHeight;
		if (this.animated && !imageContainer.firstChild.classList.contains('translate-z'))
		{
			imageContainer.firstChild.classList.add('translate-z');
		}
		if (targetHeight + textContainer.scrollHeight 
			+ picTags.scrollHeight + iconLine.scrollHeight 
			+ (this.referral ? this.contents.children[4].scrollHeight : 0) 
			< (maxCardHeight + (currentUser.vote_btns ? 80 : 20))) 
		{
			imageContainer.classList.remove("expand-animation");
			if (!fullscreenButton.classList.contains('hidden'))
				fullscreenButton.className += ' hidden';
			this.compressing = false;
			this.expanded = true;
		}
		else
		{
			truncatedTitle = this.data.caption.trunc(25);
			truncatedTitle = "<p>" + truncatedTitle + "</p>";
			textContainer.innerHTML = truncatedTitle;
			if (fullscreenButton.classList.contains('hidden'))
				fullscreenButton.classList.remove('hidden');
			if (this.referral) {
				this.contents.children[4].className += ' hidden';
				this.contents.className += ' referred';
			}
			picTags.className += ' hidden';
			toggleClass.call(this.contents.children[1], "hidden");
			this.compressing = true;
			this.expanded = false;
		}
	},
	_buildLoginCard: function() {
		var self = this,
			container = this.contents,
			top = "<img class='login-card-logo' src='http://assets.tagsurf.co/img/logo_w_border.png'><div class='big bold'>Hate repeats? Sign up!</div>",
			form = "<img class='fb-login-btn' src='http://assets.tagsurf.co/img/fb_login.png'><form accept-charset='UTF-8' action='/users' class='new-user' id='new-user' method='post'><div style='margin:0;padding:0;display:inline'><input name='utf8' type='hidden' value='✓'><input name='authenticity_token' type='hidden' value='" + document.getElementsByName("csrf-token")[0].content + "'></div><center><div><input autocapitalize='off' autocomplete='off' autocorrect='off' class='su-input bigplace' id='email' name='user[email]' placeholder='email' spellcheck='false' type='email' value=''></div><div class='small'>Password must be at least 8 characters</div><div><input autocapitalize='off' autocomplete='off' autocorrect='off' class='su-input bigplace' id='password' name='user[password]' placeholder='password' spellcheck='false' type='password' value=''></div><div><input autocapitalize='off' autocomplete='off' autocorrect='off' class='su-input bigplace' id='repassword' name='user[password_confirmation]' placeholder='re-enter password' spellcheck='false' type='password' value=''></div><input id='su-submit-btn' class='signup-button' name='commit' type='submit' value='Sign Up'></center></form>",
			bottom = "<div class='wide-text'><a id='line-text-login' class='small big-lnk'>Already have an account? <span id='login-card-btn' class='bold'>Login Here</span>.</a></div><div class='smaller block tos-pp'>By signing up you agree to our <a class='bold big-lnk' id='terms-lnk'>Terms of Use</a> and <a class='bold big-lnk' id='privacy-lnk'>Privacy Policy</a>.</div>",
			cardTemplate = top + form + bottom;
		this.setOneTimeCb("show", function(){
			var loginBtn = document.getElementById('login-card-btn'),
				signupBtn = document.getElementById('su-submit-btn'),
				fbbtn = document.getElementsByClassName('fb-login-btn')[0],
				tos_pp = document.getElementsByClassName('tos-pp')[0];
			gesture.listen("tap", fbbtn, function() { 
				sessionStorage.setItem("lastPath", current_tag + "~" + currentMedia.id);
				sessionStorage.setItem("shareVotes", JSON.stringify(shareVotes));
				document.location = "http://" + document.location.host + "/users/auth/facebook";
			});
			if (window.innerHeight < 500) {
				var contents = document.getElementsByClassName('login-card')[0];
				contents.style.maxHeight = "360px";
				return;
			}
			loginBtn.className += ' block login-card-btn';
			signupBtn.classList.remove('signup-button');
			signupBtn.className += ' UIWebView-signup-button';
			tos_pp.style.marginTop = "-20px";
		});
		this.setOneTimeCb("setTop", function() {
			var card = current_deck.topCard()
			setTimeout(function() { card.jiggle(); }, 2000);
		});
		this.wrapper.className = 'card-wrapper';
		container.className = 'card-container login-card';
		container.innerHTML = cardTemplate;
		this.cbs.start && this.cbs.start(this.contents);
		if (this.oneTimeCbs.start) {
			this.oneTimeCbs.start();
			this.oneTimeCbs.start = null;
		}
		this.wrapper.appendChild(this.contents);
		this.built = true;
		this.swipable = true;
		this.surfsUp = false;
	},
	_initImageGestures: function () {
		var self = this,
			imageContainer = this.wrapper.getElementsByClassName('image-container')[0];
		if (!imageContainer)
			return;
		gesture.listen("tap", imageContainer, self.cbs.tap);
		gesture.listen("down", imageContainer, returnTrue);
		gesture.listen("up", imageContainer, returnTrue);
		gesture.listen("drag", imageContainer, returnTrue);
		modal.setPinchLauncher(imageContainer,
			function() { self.cbs.up(true); });
	},
	_initCardGestures: function () {
		gesture.listen("swipe", this.wrapper, this.cbs.swipe);
		gesture.listen("up", this.wrapper, this.cbs.up);
		gesture.listen("drag", this.wrapper, this.cbs.drag);
		gesture.listen("hold", this.wrapper, this.cbs.hold);
		gesture.listen("down", this.wrapper, this.cbs.down);
		if(this.type != "login") this._initImageGestures();
		drag.makeDraggable(this.contents.children[4].lastChild, { constraint: "vertical" });
	},
	_initLoginInputs: function () {
		var listInputs = document.forms[0].getElementsByClassName('su-input'),
			listLength = listInputs.length;
		for (var index = 0;index < listLength; ++index)
		{
			this._focusInput(listInputs[index]);
		}
		// form validation
		var p = document.getElementById("password");
		var f = document.getElementById("new-user");
		f.onsubmit = function() {
			if (!validEmail(document.getElementById("email").value)) {
				alert("Please use a valid email address");
				return false;
			}
			if (p.value.length < 8) {
				alert("Please try a longer password");
				return false;
			}
			if (p.value != document.getElementById("repassword").value) {
				alert("Please submit matching passwords");
				return false;
			}
			analytics.track('Sign Up in Feed');
			return true;
		};
		gesture.listen("down", document.getElementById("su-submit-btn"), function() {
			f.onsubmit() && f.submit();
		});
	},
	_focusInput: function (input) {
		gesture.listen('down', input, function(){
			input.focus();
		});
	},
	_forgetGestures: function() {
		var imageContainer = this.wrapper.getElementsByClassName('image-container')[0];
		if (imageContainer) {
			gesture.unlisten(imageContainer);
		}
		gesture.unlisten(this.wrapper);
	},
	wavesOn: function (zIndex) {
		this._forgetGestures();
		this.type = "waves";
		this.wrapper.className = 'card-wrapper';
		if (zIndex)
			this.zIndex = this.wrapper.style.zIndex = zIndex;
		this.contents.className = "card-container center-label End-Of-Feed";
		this.contents.innerHTML = "<div>Searching for more cards in <br/>#" + current_tag + " feed...</div><img src='http://assets.tagsurf.co/img/throbber.gif'>";
		this.surfsUp = true;
		this.swipable = false;
		this.wrapper.appendChild(this.contents);
	},
	setFailMsg: function () {
		var trendingBtn = document.createElement('div'),
			orMsg = document.createElement('div'),
			surfATagMsg = document.createElement('div'),
			tagSuggestions = document.createElement('div'),
			container = this.contents;
			numberOfTags = 5;
		if (container.className.indexOf("End-Of-Feed") == -1) 
			container.className += " center-label End-Of-Feed";
		this._forgetGestures();
		this.type = "End-Of-Feed";
		container.innerHTML = "<div class='fail-msg'>No more cards in <br/>#" + current_tag + " feed...</div>";
		trendingBtn.className = 'trending-returnbtn pointer';
		trendingBtn.innerHTML = "<img src='http://assets.tagsurf.co/img/trending_icon_blue.png'>Return to <span class='blue'>#trending</span>";	
		orMsg.className = "fail-msg";
		orMsg.id = "or-msg";
		orMsg.innerHTML = "or";
		tagSuggestions.className = "taglist";
		surfATagMsg.className = "fail-msg";
		surfATagMsg.id = "surf-msg";
		surfATagMsg.innerHTML = "Surf a popular tag";
		gesture.listen("down", trendingBtn, function() {
			trendingBtn.classList.add("active-trending-returnbtn");
			trendingBtn.firstChild.src = "http://assets.tagsurf.co/img/trending_icon_gray.png";
		});
		gesture.listen("up", trendingBtn, function() {
			trendingBtn.classList.remove("active-trending-returnbtn");
			trendingBtn.firstChild.src = "http://assets.tagsurf.co/img/trending_icon_blue.png";
		});
		gesture.listen("tap", trendingBtn, function() {
			if (isAuthorized())
				window.location = "http://" + document.location.host + '/feed';
			else
				autocomplete.tapTag("trending", "autocomplete", false);
		});
		container.appendChild(trendingBtn);
		container.appendChild(orMsg);
		container.appendChild(surfATagMsg);
		container.appendChild(tagSuggestions);
		for (var i = 0; i < numberOfTags; i++) {
			if (autocomplete.data[i]["name"] == "trending") {
				++numberOfTags;
				continue;
			}
			else {
				this.tagCard(autocomplete.data[i]["name"]);
			}
		}
		this.surfsUp = false;
		this.built = true;
		this.swipable = false;
		if (DEBUG)
			console.log("Set End-Of-Feed card");
		analytics.track('Seen End-Of-Feed Card', {
			surfing: current_tag
		});
	},
	show: function () {
		if (this.showing)
			return;
		this.zIndex = this.wrapper.style.zIndex = !this.data
			? 0 : 1 + deck_proto.constants.stack_depth
			- slideContainer.childNodes.length;
		this.wrapper.style.opacity = 1;
		if (!this.built && !this.surfsUp)
			this._build();
		if (this.swipable)
			this._initCardGestures();
		slideContainer.appendChild(this.wrapper);
		DEBUG && console.log("Show card #" + this.id + " zIndex = " + this.zIndex + " cardbox.length = " + slideContainer.childNodes.length + " cards.length = " + current_deck.cards.length);
		this.showing = true;
		if (this.zIndex == deck_proto.constants.stack_depth)
			this.setTop();
		if (this.oneTimeCbs.show) {
			this.oneTimeCbs.show();
			if (this.type != 'login') //Don't clear login card cb because it is recycled
				this.oneTimeCbs.show = null;
		}
	},
	unshow: function () {
		if (!this.showing)
			return;
		if (DEBUG)
			console.log("Unshow card #" + this.id);
		this._forgetGestures();
		this.wrapper.style.opacity = 0;
		slideContainer.removeChild(this.wrapper);
		this.showing = false;
	},
	promote: function (zIndex) {
		if (!this.showing)
			return;
		if (zIndex)
			this.zIndex = zIndex;
		else 
			++this.zIndex;
		this.wrapper.style.zIndex = this.zIndex;
		if (this.zIndex == current_deck.constants.stack_depth)
			this.setTop();
		if (DEBUG)		
			console.log("Promote card #" + this.id + " zIndex = " + this.zIndex + " cardbox.length = " + slideContainer.childNodes.length + " cards.length = " + current_deck.cards.length);
	},
	setTop: function() {
		var self = this;
		setCurrentMedia(this, forgetReminders);
		if (this.type == "login") {
			this._initLoginInputs();
			share.off();
			panic.off();
			initDocLinks(function() {
				if(isDesktop())
					currentUser.vote_btns && voteButtonsOn();
			});
			analytics.track("Seen Login Card");
			if (window.innerHeight < 500) {
				this.contents.style.maxHeight = "500px";
				this.expanded = true;
			}
			!isDesktop() && voteButtonsOff();
			this.setOneTimeCb("vote", function() { currrentUser.vote_btns && voteButtonsOn(); })
		}
		if (DEBUG)
			console.log("Set top card #" + this.id);
		if (this.oneTimeCbs.setTop) {
			this.oneTimeCbs.setTop();
			this.oneTimeCbs.setTop = null;
		}
		if (this.expanded || !this.compressing)
			return;
		if (this.expandTimeout)
			this.clearExpandTimeout();
		if (getOrientation() == "landscape" && window.innerHeight < 700)
			this.expand();
		else
			this.setExpandTimeout();
	},
	expand: function () {
		if (this.showing && this.isContent && this.compressing && this == current_deck.topCard()) {
			if (DEBUG)
				console.log("Expand card #" + this.id);
			this.compressing = false;
			this.expanded = true;
			var imageContainer = this.type.indexOf('web') != -1 ? 
									this.contents.children[0].children[0] 
									: this.contents.children[0],
				picTags = this.referral ? 
							this.contents.children[5] 
							: this.contents.children[4],
				fullscreenButton = this.referral ? 
										this.contents.children[6] 
										: this.contents.children[5];
			//TODO: refactor this to make more pretty
			if (imageContainer.className.indexOf("expanded") == -1)
				imageContainer.className += " expanded";
			this.contents.children[3].innerHTML = "<p>" + this.data.caption + "</p>";
			if (currentUser.vote_btns && (isMobile() || isTablet()))
				picTags.style.paddingBottom="60px";
			if (this.type.indexOf("content") != -1)
				toggleClass.call(picTags, "hidden");
			if (fullscreenButton.className.indexOf("hidden") == -1)
				toggleClass.call(fullscreenButton, "hidden");
			toggleClass.call(this.contents.children[1], "hidden");
			if (this.referral) {
				toggleClass.call(this.contents.children[4], "hidden");
				// this.contents.classList.remove('referred');
			}
			this.cbs.expand && this.cbs.expand();
			if (this.oneTimeCbs.expand) {
				this.oneTimeCbs.expand();
				this.oneTimeCbs.expand = null;
			}
		}
	},
	setExpandTimeout: function (time) {
		var self = this;
		if (!this.expandTimeout)
			this.expandTimeout = setTimeout(function(){ self.expand();}, (time) ? time : 1500);
	},
	clearExpandTimeout: function () {
		if (this.expandTimeout) {
			clearTimeout(this.expandTimeout);
			this.expandTimeout = null;
		}
	},
	tagCard: function(tag) {
		if (this.type.indexOf("content") == -1 && this.type != "End-Of-Feed" || tag == "trending")
			return;
		var self = this,
			isMine = this._isMine(tag),
			p = document.createElement("div"),
			pictags = (this.type.indexOf("content") != -1 && !this.referral 
				|| this.type == "End-Of-Feed") ? 
					this.contents.children[4] : this.contents.children[5];
		if (this.type.indexOf("content") != -1)
			for (var i = 0; i < this.tags.length; i++) 
				if (Object.keys(this.tags[i])[0] == tag) 
					for (var j = 0; j < pictags.childNodes.length; j++)
						if (pictags.childNodes[j].children[0].innerHTML == "#" + tag)
							return;
		p.className = "pictagcell";
		p.id = this.id + tag;
		var tNode = document.createElement("div");
		tNode.className = "smallpadded tcell";
		tNode.innerHTML = "#" + tag;
		p.appendChild(tNode);
		if (isMine) {
			var delNode = document.createElement("div"), objwrap = {};
			objwrap[tag] = {
				total_votes: 0,
				down_votes: 0,
				up_votes: 0,
				score: 0,
				is_trending: false,
				trend: "up",
				user_owned: true
			};
			this.tags.push(objwrap);
			delNode.className = "smallpadded delNode tcell";
			delNode.innerHTML = "x";
			p.appendChild(delNode);
		}
		gesture.listen("down", p, function() {
			p.classList.add("active-pictag");
		});
		gesture.listen("up", p, function() {
			p.classList.remove("active-pictag");
		});
		gesture.listen("tap", p, function() {
			if (self._isMine(tag))
				self.rmTag(tag);
			else
				autocomplete.tapTag(tag, "autocomplete", false);
		});
		pictags.appendChild(p);
		if (self.showing) {
			self._formatContents(image.get(this.data));
			self.compressing && self.expand();
		}
	},
	rmTag: function(tag) {
	  var tobjs = this.tags;
	  if (this._isMine(tag) && newtags.indexOf(tag) != -1)
	  	newtags.splice(newtags.indexOf(tag), 1);
	  for (var i = 0; i < tobjs.length; i++) {
		if (Object.keys(tobjs[i])[0] == tag) {
			tobjs.splice(i,1);
			this.contents.children[4].removeChild(document.getElementById(this.id + tag));
			break;
		}
	  }
	},
	_isMine: function(tag) {
		if (this.type.indexOf("content") == -1)
			return false;
		for (var i = 0; i < this.tags.length; i++)
			if (Object.keys(this.tags[i])[0] == tag)
				return this.tags[i][tag].user_owned;
		return true;
	},
	vote: function (voteFlag, tag, voteAlternative) {
		this.unshow();
		current_deck.shift();
		if (DEBUG)
			console.log("Voted on card #" + this.id);
		if (this.type.indexOf("content") != -1) {
			this.data.total_votes += 1;
			this.data[voteFlag + "_votes"] += 1;
			this.data.user_stats.voted = true;
			this.data.user_stats.tag_voted = tag;
			this.data.user_stats.vote = voteFlag;
			if (!isAuthorized())
				shareVotes.push(this.data);
			else if (voteAlternative)
				voteAlternative();
			else
				castVote(this);
			current_deck.voted_keys[this.id] = true;
			this.pushTags();
		} else if (this.type == "login")
			this.cbs.start(this.contents); // refresh for next time
		this.cbs.vote && this.cbs.vote();
		if (this.oneTimeCbs.vote) {
			this.oneTimeCbs.vote();
			this.oneTimeCbs.vote = null;
		}
	},
	pushTags: function () {
		var newtag = false;
		for (i = 0; i < this.tags.length ; ++i) {
			if(this._isMine(Object.keys(this.tags[i])[0])) {
				newtag = true;
			    xhr("/api/media/" + this.id + "/tags/" + Object.keys(this.tags[i])[0], "POST", null, null);
			}
		}
		if (newtag)
			autocomplete.populate();
	},
	setOneTimeCb: function(action, cb) {
		if(!action) {
			if (DEBUG)
				console.log("Error: No action provided for One Time Callback");
			return;
		}
		this.oneTimeCbs[action] = cb;
	},
	populateReferrals: function() {
		if(!this.referral)
			return;
		var referralBox = this.contents.children[4].lastChild,
			card_id = this.id;
		this.referral.forEach(function(r) {
			var cell = document.createElement('div'),
			pic = document.createElement('img'),
			usr = document.createElement('div'),
			bumpBtn = document.createElement('div'),
			bumpIcon = document.createElement('img'),
			referrer_id = r.user_id;
			cell.className = "user-cell";
			pic.className = "user-pic";
			pic.src = "http://assets.tagsurf.co/img/UserAvatar.png";
			usr.className = "user-name";
			usr.innerHTML = r.username.split("@")[0];
			bumpBtn.className = "bump-btn";
			bumpIcon.className = "bump-icon";
			bumpIcon.src = r.bumped ? "http://assets.tagsurf.co/img/bumped.png" 
				: "http://assets.tagsurf.co/img/bump_white.png";
			bumpBtn.appendChild(bumpIcon);
			cell.appendChild(pic);
			cell.appendChild(usr);
			cell.appendChild(bumpBtn);
			referralBox.appendChild(cell);
			
			if(!r.bumped) {
				gesture.listen("tap", bumpBtn, function() {
				    bumpIcon.src = "http://assets.tagsurf.co/img/bumped.png";
				    gesture.unlisten(bumpBtn);
				    xhr("/api/bump/" + card_id + "/" + referrer_id, "POST", null, null);
				});
				gesture.listen("down", bumpBtn, function () {
				    bumpBtn.classList.add('bump-btn-active');
			    });
				gesture.listen("up", bumpBtn, function () {
				    bumpBtn.classList.remove('bump-btn-active');
			    });
			}

		});
	},
	jiggle: function () {
		var self = this,
			cardContainer = this.contents;
		cardContainer.classList.add('jiggle');
		setTimeout(function(){
			self.contents.classList.remove('jiggle');
		}, 1000)
	}
};

var newCard = function (data) {
	var card = Object.create(card_proto);
	card.id = null;
	card.data = null;
	card.image = null;
	card.cbs = cardCbs; //varred in util
	card.oneTimeCbs = [];
	card.tags = [];
	card.zIndex = null;
	card.trending = false;
	card.animated = null;
	card.type = null;
	card.isContent = null;
	card.source = null;
	card.compressing = null;
	card.expanded = null;
	card.expandTimeout = null;
	card.built = false;
	card.showing = false;
	card.surfsUp = false;
	card.sliding = false;
	card.supering = false;
	card.swipable = null;
	card.verticaling = false;
	card.animating = false;
	card.rAFid = null;
	card.time = null;
	card.referral = null;
	card.x = card.y = 0;
	card.wrapper = document.createElement('div');
	card.contents = document.createElement('div');
	card._init(data);
	return card;
};
