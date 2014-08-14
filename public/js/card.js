var card_proto = {
	init: function(data) {
		if (data) {
			var self = this;
			this.data = data;
			this.id = data.id;
			this.image = data.image;
			this.animated = data.image.animated;
			this.type = data.type;
			this.source = data.source;
			data.tags_v2.forEach(function(tag) { 
				if(tag == "trending") {
					return;
				}
				else if(tag != "")
					self.tags.push(tag); 
			});
		}
		else 
			return;
	},
	build: function() {
		this.zIndex = this.wrapper.style.zIndex 
			= deck_proto.constants.stack_depth
				- slideContainer.childNodes.length;
		this.wavesOn();
		if (this.type == "content")
			this._buildContentCard();
		else if (this.type == "login") 
			this._buildLoginCard();
		// else if (DEBUG)
		// 	alert("unknown card type: " + this.data.type);
	},
	_buildContentCard: function() {
		var	imageContainer, iconLine, textContainer, picTags, fullscreenButton, truncatedTitle, 
			container = this.contents,
			card = this,
			cardTemplate = "<div class='image-container expand-animation'><img src= ></div><div class='icon-line'><img class='source-icon' src='http://assets.tagsurf.co/img/" + (card.source || ((card.data.tags[0] == null || card.data.tags[0] == "imgurhot") ? "imgur" : "reddit")) + "_icon.png'><span class='tag-callout pointer'><img src='http://assets.tagsurf.co/img/trending_icon_blue.png'>&nbsp;#" + card.data.tags[0] + "</span></div><div class='text-container'><p>" + card.data.caption + "</p></div><div id='pictags" + card.id + "' class='pictags'></div><div class='expand-button'><img src='http://assets.tagsurf.co/img/down_arrow.png'></div><div id='thumb-vote-container'><img class='thumb-up' src='http://assets.tagsurf.co/img/thumbsup.png'><img class='thumb-down' src='http://assets.tagsurf.co/img/thumbsdown.png'></div><div class='super-label'>SUPER VOTE</div>";
		container.className = 'card-container';
		container.innerHTML = cardTemplate;
		imageContainer = container.children[0];
		imageContainer.firstChild.src = "http://assets.tagsurf.co/img/throbber.gif";
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
				autocomplete.tapTag(card.tags[0], "autocomplete", false);
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
			t && card.tagCard(t, picTags);
		});
		this.cbs.start(this.contents);
		this._initCardGestures();
		this.isContent = true;
		this.setSource(); 
		this._formatContents(image.get(card.data));
		this.built = true;
	},
	_buildLoginCard: function() {
		var container = this.contents,
			top = "<img src='http://assets.tagsurf.co/img/logo_w_border.png'><div class='big bold'>Hate repeats? Sign up!</div>",
			form = "<form accept-charset='UTF-8' action='/users' class='new-user' id='new-user' method='post'><div style='margin:0;padding:0;display:inline'><input name='utf8' type='hidden' value='✓'><input name='authenticity_token' type='hidden' value='" + document.getElementsByName("csrf-token")[0].content + "'></div><center><div><input autocapitalize='off' autocomplete='off' autocorrect='off' class='su-input bigplace' id='email' name='user[email]' placeholder='email' spellcheck='false' type='email' value=''></div><div class='small'>Password must be at least 8 characters</div><div><input autocapitalize='off' autocomplete='off' autocorrect='off' class='su-input bigplace' id='password' name='user[password]' placeholder='password' spellcheck='false' type='password' value=''></div><div><input autocapitalize='off' autocomplete='off' autocorrect='off' class='su-input bigplace' id='repassword' name='user[password_confirmation]' placeholder='re-enter password' spellcheck='false' type='password' value=''></div><input id='su-submit-btn' class='signup-button' name='commit' type='submit' value='sign up'></center></form>",
			bottom = "<div class='wide-text'><a id='line-text-login' class='small big-lnk'>Already have an account? <b>Login here</b>.</a></div><div class='smaller block'>By signing up you agree to our <a class='bold big-lnk' id='terms-lnk'>Terms of Use</a> and <a class='bold big-lnk' id='privacy-lnk'>Privacy Policy</a>.</div>",
			cardTemplate = top + form + bottom;
		this.wrapper.className = 'card-wrapper';
		container.className = 'card-container login-card';
		container.innerHTML = cardTemplate;
		this.cbs.start(this.contents);
		this._initCardGestures();
		this._initLoginInputs();
		initDocLinks();

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
		this.built = true;
	},
	wavesOn: function (zIndex) {
		this._forgetGestures();
		this.wrapper.className = 'card-wrapper';
		if(zIndex)
			this.zIndex = this.wrapper.style.zIndex = zIndex;
		this.contents.className = "card-container center-label End-Of-Feed";
		this.contents.innerHTML = "<div>Searching for more cards in <br>#" + current_tag + " feed...</div><img src='http://assets.tagsurf.co/img/throbber.gif'>";
		this.surfsUp = true;
		this.wrapper.appendChild(this.contents);
	},
	show: function (cbs) {
		this.cbs = typeof cbs === "undefined" ? this.cbs : cbs;
		if(this.surfsUp) {
			slideContainer.appendChild(this.wrapper);
			this.showing = true;
			return;
		}
		this.build();
		slideContainer.appendChild(this.wrapper);
		this.showing = true;
		scrollContainer.style.opacity = 1;
		if (slideContainer.childNodes.length == 1)
			this.setTop();
	},
	setTop: function() {
		setCurrentMedia(this, forgetReminders);
		if (this.expandTimeout) {
			this.clearExpandTimeout();
		}
		if (getOrientation() == "landscape" && window.innerHeight < 700)
			this.expand();
		else
			this.setExpandTimeout();
	},
	setFailMsg: function () {
		this.surfsUp = false;
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
		container.innerHTML = "<div class='fail-msg'>No more cards in <br>#" + current_tag + " feed...</div>";
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
			if(isAuthorized())
				window.location = "http://" + document.location.host + '/feed';
			else
				autocomplete.tapTag("trending", "autocomplete", false);
		});
		container.appendChild(trendingBtn);
		container.appendChild(orMsg);
		container.appendChild(surfATagMsg);
		container.appendChild(tagSuggestions);
		for(var i = 0; i < numberOfTags; i++) {
			if (autocomplete.data[i]["name"] == "trending") {
				++numberOfTags;
				continue;
			}
			else {
				this.tagCard(autocomplete.data[i]["name"]);
			}
		}
		analytics.track('Seen End-Of-Feed Card', {
			surfing: current_tag
		});
	},
	setSource: function() {
		var self = this;
		this.contents.children[0].firstChild.src = image.get(self.data, window.innerWidth - 40).url;
		this.contents.children[0].firstChild.onload = function() {
			self.surfsUp = false;
			self.cbs.build && self.cbs.build();
		};
		this.contents.children[0].firstChild.onerror = function() {
			self.wavesOn();
			self.cbs.error && self.cbs.error();
		};
	},
	expand: function () {
		if (this.isContent && this.compressing)
		{
			this.compressing = false;
			this.expanded = true;
			if (this.contents.children[0].className.indexOf("expanded") == -1)
				this.contents.children[0].className += " expanded";
			this.contents.children[2].innerHTML = "<p>" + this.data.caption + "</p>";
			if(currentUser.vote_btns && (isMobile() || isTablet()))
				this.contents.children[3].style.paddingBottom="60px";
			if(this.type == "content")
				toggleClass.call(this.contents.children[3], "hidden");
			if(this.contents.children[4].className.indexOf("hidden") == -1)
				toggleClass.call(this.contents.children[4], "hidden");
			this.cbs.expand && this.cbs.expand();
		}
	},
	promote: function (zIndex) {
		if(zIndex) {
			this.zIndex = zIndex;
			this.wrapper.style.zIndex = zIndex;
		}
		else {
			++this.zIndex;
			this.wrapper.style.zIndex = this.zIndex;
		}
	},
	setExpandTimeout: function (time) {
		var self = this;
		if(!this.expandTimeout)
			this.expandTimeout = setTimeout(function(){ self.expand();}, (time) ? time : 1500);
	},
	clearExpandTimeout: function () {
		if (this.expandTimeout) {
			clearTimeout(this.expandTimeout);
			this.expandTimeout = null;
		}
	},
	tagCard: function(tag) {
		var self = this,
			isMine = this._isMine(tag),
			p = document.createElement("div");
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
		if(self.type == "content")
			self.contents.children[3].appendChild(p);
		else if (self.type == "End-Of-Feed")
			self.contents.children[4].appendChild(p);
		if(self.built) {
			self._formatContents();
			self.compressing && self.expand();
		}
	},
	rmTag: function(tag) {
	  var tobjs = this.tags;
	  for (var i = 0; i < tobjs.length; i++) {
		if (Object.keys(tobjs[i])[0] == tag){
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
			< (maxCardHeight + (currentUser.vote_btns ? 20 : 80))) 
		{
			imageContainer.classList.remove("expand-animation");
			fullscreenButton.className += ' hidden';
			this.compressing = false;
		}
		else
		{
			truncatedTitle = this.data.caption.trunc(25);
			truncatedTitle = "<p>" + truncatedTitle + "</p>";
			textContainer.innerHTML = truncatedTitle;
			picTags.className += ' hidden';
			this.compressing = true;
		}
	},
	_initImageGestures: function () {
		var imageContainer = this.wrapper.getElementsByClassName('image-container')[0];
		if (!imageContainer)
			return;
		gesture.listen("tap", imageContainer, this.cbs.tap);
		gesture.listen("down", imageContainer, returnTrue);
		gesture.listen("up", imageContainer, returnTrue);
		gesture.listen("drag", imageContainer, returnTrue);
		modal.setPinchLauncher(imageContainer,
			function() { upCallback(true); });
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
	vote: function (voteFlag, tag, voteAlternative) {
		if (this.data.type == "content") {
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
		}
		this.pushTags();
		this.remove();
	},
	remove: function () {
		this._forgetGestures();
		slideContainer.removeChild(this.wrapper);
		this.showing = false;
		removeFromDecks(this);
	},
	unshow: function () {
		this._forgetGestures();
		slideContainer.removeChild(this.wrapper);
		this.showing = false;
	},
	pushTags: function () {
	for (i = 0; i < this.tags.length ; ++i)
		if(this._isMine(Object.keys(this.tags[i])[0]))
		    xhr("/api/media/" + this.id + "/tags/" + Object.keys(this.tags[i])[0], "POST", null, null);
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
	card.verticaling = false;
	card.animating = false;
	card.x = card.y = 0;
	card.wrapper = document.createElement('div');
	card.contents = document.createElement('div');
	card.init(data);
	return card;
};
