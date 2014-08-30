var card_proto = {
	_init: function(data) {
		if (data) {
			var self = this;
			this.data = data;
			this.id = data.id;
			this.image = data.image;
			this.animated = data.image.animated;
			this.type = data.type;
			this.source = data.source;
			data.tags_v2.forEach(function(tag) { 
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
		if (this.type == "content")
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
			cardTemplate = "<div class='image-container expand-animation'><img src= ></div><div class='icon-line'><img class='source-icon' src='http://assets.tagsurf.co/img/" + (card.source || ((card.data.tags[0] == null || card.data.tags[0] == "imgurhot") ? "imgur" : "reddit")) + "_icon.png'><span class='tag-callout pointer'><img src='http://assets.tagsurf.co/img/trending_icon_blue.png'>&nbsp;#" + card.data.tags[0] + "</span></div><div class='text-container'><p>" + card.data.caption + "</p></div><div id='pictags" + card.id + "' class='pictags'></div><div class='expand-button'><img src='http://assets.tagsurf.co/img/down_arrow.png'></div><div id='thumb-vote-container'><img class='thumb-up' src='http://assets.tagsurf.co/img/thumbsup.png'><img class='thumb-down' src='http://assets.tagsurf.co/img/thumbsdown.png'></div><div class='super-label'>SUPER VOTE</div>";
		this.surfsUp = true;
		formattingContainer.appendChild(container);
		container.className = 'card-container';
		this.wrapper.className = 'card-wrapper';
		container.innerHTML = cardTemplate;
		imageContainer = container.children[0];
		iconLine = container.children[1];
		textContainer = container.children[2];
		picTags = container.children[3];
		fullscreenButton = container.children[4];
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
		this.tags.sort(function(a, b) {
			var aName = Object.keys(a)[0];
			var bName = Object.keys(b)[0];
			return a[aName].score < b[bName].score;
		});
		this.tags.forEach(function(tagobj) {
			var t = Object.keys(tagobj)[0];
			t && card.tagCard(t);
		});
		this.cbs.start(this.contents);
		this.isContent = true;
		this._formatContents(image.get(this.data));
		formattingContainer.removeChild(container);
		this.wrapper.appendChild(container);
		this.setSource(); 
		this.built = true;
		this.swipable = true;
	},
	setSource: function() {
		this.contents.children[0].firstChild.src = image.get(this.data,
			window.innerWidth - 40).url;
	},
	_formatContents: function (imageData) {
		if (this.type != "content")
			return;
		var imageContainer = this.contents.firstChild,
			fullscreenButton = this.contents.children[4], 
			truncatedTitle,
			picTags = this.contents.children[3], 
			textContainer = this.contents.children[2],
			iconLine = this.contents.children[1], 
			targetHeight = imageData ? 
				imageData.height * (window.innerWidth - 40) / imageData.width :
				this.contents.firstChild.scrollHeight;
		if (this.animated && !imageContainer.firstChild.classList.contains('translate-z'))
		{
			imageContainer.firstChild.classList.add('translate-z');
		}
		if (targetHeight + textContainer.scrollHeight 
			+ picTags.scrollHeight + iconLine.scrollHeight 
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
			picTags.className += ' hidden';
			this.compressing = true;
			this.expanded = false;
		}
	},
	_buildLoginCard: function() {
		var container = this.contents,
			top = "<img src='http://assets.tagsurf.co/img/logo_w_border.png'><div class='big bold'>Hate repeats? Sign up!</div>",
			form = "<form accept-charset='UTF-8' action='/users' class='new-user' id='new-user' method='post'><div style='margin:0;padding:0;display:inline'><input name='utf8' type='hidden' value='✓'><input name='authenticity_token' type='hidden' value='" + document.getElementsByName("csrf-token")[0].content + "'></div><center><div><input autocapitalize='off' autocomplete='off' autocorrect='off' class='su-input bigplace' id='email' name='user[email]' placeholder='email' spellcheck='false' type='email' value=''></div><div class='small'>Password must be at least 8 characters</div><div><input autocapitalize='off' autocomplete='off' autocorrect='off' class='su-input bigplace' id='password' name='user[password]' placeholder='password' spellcheck='false' type='password' value=''></div><div><input autocapitalize='off' autocomplete='off' autocorrect='off' class='su-input bigplace' id='repassword' name='user[password_confirmation]' placeholder='re-enter password' spellcheck='false' type='password' value=''></div><input id='su-submit-btn' class='signup-button' name='commit' type='submit' value='sign up'></center></form>",
			bottom = "<div class='wide-text'><a id='line-text-login' class='small big-lnk'>Already have an account? <span class='bold'>Login here</span>.</a></div><div class='smaller block'>By signing up you agree to our <a class='bold big-lnk' id='terms-lnk'>Terms of Use</a> and <a class='bold big-lnk' id='privacy-lnk'>Privacy Policy</a>.</div>",
			cardTemplate = top + form + bottom;
		this.wrapper.className = 'card-wrapper';
		container.className = 'card-container login-card';
		container.innerHTML = cardTemplate;
		this.cbs.start(this.contents);
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
		this._initImageGestures();
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
		if (this.image && isAndroid()) {
			var forceCustomDrag = this.contents.firstChild.firstChild.clientHeight
				< window.innerHeight * 2;
			DEBUG && console.log("force custom drag:",
				forceCustomDrag,
				this.contents.firstChild.firstChild.clientHeight,
				window.innerHeight * 2);
			drag.makeDraggable(scrollContainer, {
				constraint: "horizontal",
				force: forceCustomDrag,
				scroll: cardCbs.scroll
			});
		}

		setCurrentMedia(this, forgetReminders);
		if (this.type == "login") {
			this._initLoginInputs();
			initDocLinks();
			analytics.track("Seen Login Card");
		}
		if (DEBUG)
			console.log("Set top card #" + this.id);
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
			if (this.contents.children[0].className.indexOf("expanded") == -1)
				this.contents.children[0].className += " expanded";
			this.contents.children[2].innerHTML = "<p>" + this.data.caption + "</p>";
			if (currentUser.vote_btns && (isMobile() || isTablet()))
				this.contents.children[3].style.paddingBottom="60px";
			if (this.type == "content")
				toggleClass.call(this.contents.children[3], "hidden");
			if (this.contents.children[4].className.indexOf("hidden") == -1)
				toggleClass.call(this.contents.children[4], "hidden");
			this.cbs.expand && this.cbs.expand();
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
		if (this.type != "content" && this.type != "End-Of-Feed" || tag == "trending")
			return;
		var self = this,
			isMine = this._isMine(tag),
			p = document.createElement("div"),
			pictags = this.type == "content" ? this.contents.children[3] : this.contents.children[4];
		if (this.type == "content")
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
			this.contents.children[3].removeChild(document.getElementById(this.id + tag));
			break;
		}
	  }
	},
	_isMine: function(tag) {
		if (this.type != "content")
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
		if (this.type == "content") {
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
	}
};

var newCard = function (data) {
	var card = Object.create(card_proto);
	card.id = null;
	card.data = null;
	card.image = null;
	card.cbs = cardCbs; //varred in util
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
	card.x = card.y = 0;
	card.wrapper = document.createElement('div');
	card.contents = document.createElement('div');
	card._init(data);
	return card;
};
