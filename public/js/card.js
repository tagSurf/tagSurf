var _card = {
	_init: function(data) {
		if (data) {
			var self = this;
			this.data = data;
			this.id = data.id;
			this.animated = data.image.animated;
			this.type = data.type;
			this.source = data.source;
			data.tags_v2.forEach(function(tag) { 
				if(tag == "trending") {
					return;
				}
				else if(tag != "")
					self.tags.push(tag); 
				if(DEBUG)
					console.log(self.id + " tags = ", self.tags);
			});
		}
		else {
			if(DEBUG)
				console.log("Error: No data provided for new card");
			return;
		}
	},
	build: function(zIndex, cbs) {
		this.zIndex = (typeof zIndex === 'undefined') ? (deck.constants.stack_depth - 1) : zIndex;
		this.setThrobber();
		this.cbs = cbs;
		if (this.type == "content")
			this._buildContentCard();
		else if (this.type == "login") 
			this._buildLoginCard();
		else if (DEBUG)
			alert("unknown card type: " + this.data.type);
	},
	_buildContentCard: function() {
		var	imageContainer, iconLine, textContainer, picTags, fullscreenButton, truncatedTitle, 
			container = this.contents,
			card = this,
			cardTemplate = "<div class='image-container expand-animation'><img src= ></div><div class='icon-line'><img class='source-icon' src='http://assets.tagsurf.co/img/" + (card.source || ((card.data.tags[0] == null || card.data.tags[0] == "imgurhot") ? "imgur" : "reddit")) + "_icon.png'><span class='tag-callout pointer'><img src='http://assets.tagsurf.co/img/trending_icon_blue.png'>&nbsp;#" + card.data.tags[0] + "</span></div><div class='text-container'><p>" + card.data.caption + "</p></div><div id='pictags" + card.id + "' class='pictags'></div><div class='expand-button'><img src='http://assets.tagsurf.co/img/down_arrow.png'></div><div id='thumb-vote-container'><img class='thumb-up' src='http://assets.tagsurf.co/img/thumbsup.png'><img class='thumb-down' src='http://assets.tagsurf.co/img/thumbsdown.png'></div><div class='super-label'>SUPER VOTE</div>";
		container.className = 'card-container';
		container.id = "";
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
		this.wrapper.style.zIndex = card.zIndex
		container.className = 'card-container login-card';
		container.id = "";
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
	setThrobber: function (zIndex) {
		this._forgetGestures();
		this.wrapper.className = 'card-wrapper';
		if(zIndex)
			this.zIndex = this.wrapper.style.zIndex = zIndex;
		this.contents.className = "card-container center-label";
		this.contents.id = "End-Of-Feed";
		this.contents.innerHTML = "<div>Searching for more cards in <br>#" + current_tag + " feed...</div><img src='http://assets.tagsurf.co/img/throbber.gif'>";
		this.throbbing = true;
		this.wrapper.appendChild(this.contents);
		// TODO: probably don't add to slider yet
		document.getElementById('slider').appendChild(this.wrapper);
	},
	setFailMsg: function () {
		this.throbbing = false;
		var trendingBtn = document.createElement('div'),
			orMsg = document.createElement('div'),
			surfATagMsg = document.createElement('div'),
			tagSuggestions = document.createElement('div'),
			container = this.contents;
			numberOfTags = 5;
		trendingBtn.className = 'trending-returnbtn pointer';
		trendingBtn.innerHTML = "<img src='http://assets.tagsurf.co/img/trending_icon_blue.png'>Return to <span class='blue'>#trending</span>";	
		failMsgNode.innerHTML = "<div class='fail-msg'>No more cards in <br>#" + current_tag + " feed...</div>";
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
		container.innerHTML = "";
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
			self.throbbing = false;
			self.cbs.build && self.cbs.build();
		};
		this.contents.children[0].firstChild.onerror = function() {
			self.setThrobber();
			self.cbs.error && self.cbs.error();
		};
	},
	expand: function (expandCb) {
		if (this.isContent && this.compressing)
		{
			this.compressing = false;
			this.expanded = true;
			if (this.contents.children[0].className.indexOf("expanded") == -1)
				this.contents.children[0].className += " expanded";
			this.contents.children[2].innerHTML = "<p>" + this.data.caption + "</p>";
			if(currentUser.vote_btns && (isMobile() || isTablet()))
				this.contents.children[3].style.paddingBottom="60px";
			toggleClass.call(this.contents.children[3], "hidden");
			toggleClass.call(this.contents.children[4], "hidden");
			// scrollCallback(); MUST PASS FROM FEED AS CALLBACK
			expandCb && expandCb();
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
			this.expandTimeout = setTimeout(self.expand, (time) ? time : 1500);
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
			var delNode = document.createElement("div");
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
			if (isMine) {
				self.rmTag(tag);
				// self.contents.children[3].removeChild(p);
			} else
				autocomplete.tapTag(tag, "autocomplete", false);
		});
		self.contents.children[3].appendChild(p);
		if(self.built)
			self._formatContents();
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
		for (var i = 0; i < this.tags.length; i++)
			if (Object.keys(this.tags[i])[0] == tag)
				return this.tags[i][tag].user_owned;
		return true;
	},
	_formatContents: function (imageData) {
		var imageContainer = this.contents.firstChild,
			fullscreenButton = this.contents.children[4], 
			truncatedTitle,
			picTags = this.contents.children[3], 
			textContainer = this.contents.children[2],
			iconLine = this.children[1], 
			targetHeight = imageData ? 
				imageData.height * (window.innerWidth - 40) / imageData.width :
				this.firstChild.scrollHeight;
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
		var imageContainer = this.getElementsByClassName('image-container')[0];
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
		gesture.listen("down", shit.wrapper, this.cbs.down);
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
	vote: function (voteFlag, tag) {
		if((typeof voteFlag !== "undefined") && tag) {
			this.data.user_stats.vote = voteFlag;
			this.data.user_stats.tag = tag;
			this.remove();
			castVote(this);
		}
		else if(DEBUG)
			console.log("Error: insufficient vote data provided");
	},
	remove: function () {
		document.getElementById('slider').removeChild(this.wrapper);
	}
};

var newCard = function (data) {
	var card = Object.create(_card);
	card.id = null;
	card.data = null;
	card.tags = [];
	card.cb = null;
	card.eb = null;
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
	card.throbbing = false;
	card.sliding = false;
	card.supering = false;
	card.verticaling = false;
	card.animating = false;
	card.wrapper = document.createElement('div');
	card.contents = document.createElement('div');
	card._init(data);
	return card;
};
