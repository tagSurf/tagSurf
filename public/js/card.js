var card = {
	id: null,
	data: null,
	tags: {},
	zIndex: null,
	trending: false,
	animated: null,
	type: null,
	isContent: null,
	compressing: null,
	expanded: null,
	expandTimeout: null,
	wrapper: document.createElement('div'),
	contents: document.createElement('div'),
	init: function(data, zIndex) {
		if (data) {
			card.data = data;
			card.id = data.id;
			card.animated = data.image.animated;
			card.type = data.type;
			data.tags_v2.forEach(function(tag) { 
				if(tag == "trending") {
					card.trending = true;
					return;
				}
				else if (tag != "")
					card.tags.push(tag); 
				console.log("card.tags = ", card.tags);
			});
		}
		else {
			if(DEBUG)
				console.log("Error: No data provided for new card");
			return;
		}
		card.zIndex = (typeof zIndex === 'undefined') ? 2 : zIndex;
		if (card.type == "content")
			card.buildContentCard();
		else if (card.type == "login") 
			card.buildLoginCard();
		else if (DEBUG)
			alert("unknown card type: " + card.data.type);
	},
	buildContentCard: function() {
		var	formattingContainer = document.getElementById('formatter'),
			imageContainer, iconLine, textContainer, picTags, fullscreenButton, truncatedTitle, 
			container = card.contents,
			cardTemplate = "<div class='image-container expand-animation'><img src= ></div><div class='icon-line'><img class='source-icon' src='http://assets.tagsurf.co/img/" + (c.source || ((card.data.tags[0] == null || card.data.tags[0] == "imgurhot") ? "imgur" : "reddit")) + "_icon.png'><span class='tag-callout pointer'><img src='http://assets.tagsurf.co/img/trending_icon_blue.png'>&nbsp;#" + card.data.tags[0] + "</span></div><div class='text-container'><p>" + card.data.caption + "</p></div><div id='pictags" + card.id + "' class='pictags'></div><div class='expand-button'><img src='http://assets.tagsurf.co/img/down_arrow.png'></div><div id='thumb-vote-container'><img class='thumb-up' src='http://assets.tagsurf.co/img/thumbsup.png'><img class='thumb-down' src='http://assets.tagsurf.co/img/thumbsdown.png'></div><div class='super-label'>SUPER VOTE</div>";
		card.wrapper.className = 'card-wrapper';
		card.wrapper.style.zIndex = card.zIndex
		container.className = 'card-container';
		container.innerHTML = cardTemplate;
		card.wrapper.appendChild(container);
		formattingContainer.appendChild(card.wrapper);
		imageContainer = container.children[0];
		iconLine = container.children[1];
		textContainer = container.children[2];
		picTags = container.children[3];
		fullscreenButton = container.children[4];
		if (card.trending && (current_tag == "trending")) {
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
		card.tags.sort(function(a, b) {
			var aName = Object.keys(a)[0];
			var bName = Object.keys(b)[0];
			return a[aName].score < b[bName].score;
		});
		card.tags.forEach(function(tagobj) {
			var t = Object.keys(tagobj)[0];
			t && tagCard(t, picTags);
		});
		card._initCard();
		card.isContent = true;
		card.setSource(); 
		card._formatContents(image.get(card.data));
		// THIS GOES BACK IN FEED SOMEWHERE
		// !!!!!!!!!!!!!!!!!!!!!!
		// if (slider == card) {
		// 	slider.setSource();
		// 	firstCardLoaded = false;
		// 	imageContainer.firstChild.onload = function() {
		// 		firstCardLoaded = true;
		// 		if(slider.parentNode.nextSibling.firstChild)
		// 			slider.parentNode.nextSibling.firstChild.setSource();
		// 		if(slider.parentNode.nextSibling.nextSibling.firstChild)
		// 			slider.parentNode.nextSibling.nextSibling.firstChild.setSource();
		// 		throbber.off();
		// 		scrollContainer.style.opacity = 1;
		// 		analytics.track('Finished Pageload');
		// 		preloadCards();
		// 	};
		// }
		// imageContainer.firstChild.onerror = function() {
		// 	analytics.track('Card Load Error', {card: slider.card.id});
		// 	slideContainer.removeChild(slider.parentNode.nextSibling);
		// 	slideContainer.removeChild(slider.parentNode.nextSibling);
		// 	slideContainer.removeChild(card.parentNode);
		// 	cardIndex -= 2;
		// 	refreshCards(null, 2, cardIndex);
		// };
	},
	buildLoginCard: function() {
		var formattingContainer = document.getElementById('formatter'),
			container = card.contents,
			top = "<img src='http://assets.tagsurf.co/img/logo_w_border.png'><div class='big bold'>Hate repeats? Sign up!</div>",
			form = "<form accept-charset='UTF-8' action='/users' class='new-user' id='new-user' method='post'><div style='margin:0;padding:0;display:inline'><input name='utf8' type='hidden' value='✓'><input name='authenticity_token' type='hidden' value='" + document.getElementsByName("csrf-token")[0].content + "'></div><center><div><input autocapitalize='off' autocomplete='off' autocorrect='off' class='su-input bigplace' id='email' name='user[email]' placeholder='email' spellcheck='false' type='email' value=''></div><div class='small'>Password must be at least 8 characters</div><div><input autocapitalize='off' autocomplete='off' autocorrect='off' class='su-input bigplace' id='password' name='user[password]' placeholder='password' spellcheck='false' type='password' value=''></div><div><input autocapitalize='off' autocomplete='off' autocorrect='off' class='su-input bigplace' id='repassword' name='user[password_confirmation]' placeholder='re-enter password' spellcheck='false' type='password' value=''></div><input id='su-submit-btn' class='signup-button' name='commit' type='submit' value='sign up'></center></form>",
			bottom = "<div class='wide-text'><a id='line-text-login' class='small big-lnk'>Already have an account? <b>Login here</b>.</a></div><div class='smaller block'>By signing up you agree to our <a class='bold big-lnk' id='terms-lnk'>Terms of Use</a> and <a class='bold big-lnk' id='privacy-lnk'>Privacy Policy</a>.</div>",
			cardTemplate = top + form + bottom;
		card.wrapper.className = 'card-wrapper';
		card.wrapper.style.zIndex = card.zIndex
		container.className = 'card-container';
		container.innerHTML = cardTemplate;
		card.wrapper.appendChild(container);
		formattingContainer.appendChild(card.wrapper);
		card._initCard;
		card._initLoginInputs();
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
	},
	_initCard: function() {
		var formattingContainer = document.getElementById('formatter')
		setStartState(card.contents);
		initCardGestures.call(card.wrapper);
		slideContainer.appendChild(card.wrapper);
		formattingContainer.removeChild(card.wrapper);
		setSlider();
	},
	setSource: function() {
		card.contents.children[0].firstChild.src = image.get(c, window.innerWidth - 40).url;
	},
	expand: function (cb) {
		if (card.isContent && card.compressing)
		{
			card.compressing = false;
			card.expanded = true;
			if (card.contents.children[0].className.indexOf("expanded") == -1)
				card.contents.children[0].className += " expanded";
			card.contents.children[2].innerHTML = "<p>" + card.data.caption + "</p>";
			if(currentUser.vote_btns && (isMobile() || isTablet()))
				card.contents.children[3].style.paddingBottom="60px";
			toggleClass.call(card.contents.children[3], "hidden");
			toggleClass.call(card.contents.children[4], "hidden");
			// scrollCallback(); MUST PASS FROM FEED
			cb && cb();
		}
	},
	promote: function (zIndex) {
		if(zIndex) {
			card.zIndex = zIndex;
			card.wrapper.style.zIndex = zIndex;
		}
		else {
			++card.zIndex
			card.wrapper.style.zIndex = card.zIndex
		}
	},
	setExpandTimeout: function (time) {
		if(!card.expandTimeout)
			card.expandTimeout = setTimeout(card.expand, (time) ? time : 1500);
	},
	clearExpandTimeout: function () {
		if (card.expandTimeout) {
			clearTimeout(card.expandTimeout);
			card.expandTimeout = null;
		}
	}
	_isMine = function(tag) {
		for (var i = 0; i < card.tags.length; i++)
			if (Object.keys(card.tags[i])[0] == tag)
				return card.tags[i][tag].user_owned;
	},
	tagCard = function(tag) {
		var ismine = card._isMine(tag);
		var p = document.createElement("div");
		p.className = "pictagcell";
		var tNode = document.createElement("div");
		tNode.className = "smallpadded tcell";
		tNode.innerHTML = "#" + tag;
		p.appendChild(tNode);
		if (ismine) {
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
			if (ismine) {
				card.rmTag(tag);
				card.contents.children[3].removeChild(p);
			} else
				autocomplete.tapTag(tag, "autocomplete", false);
		});
		card.contents.children[3].appendChild(p);
	},
	_formatContents = function (imageData) {
		var imageContainer = card.contents.firstChild,
			fullscreenButton = card.contents.children[4], truncatedTitle,
			picTags = card.contents.children[3], textContainer = card.contents.children[2],
			iconLine = card.children[1], targetHeight = imageData ? 
			imageData.height * (window.innerWidth - 40) / imageData.width :
			card.firstChild.scrollHeight;
		if (card.animated && !imageContainer.firstChild.classList.contains('translate-z'))
		{
			imageContainer.firstChild.classList.add('translate-z');
		}
		if (targetHeight + textContainer.scrollHeight 
			+ picTags.scrollHeight + iconLine.scrollHeight 
			< (maxCardHeight + (currentUser.vote_btns ? 20 : 80))) 
		{
			imageContainer.classList.remove("expand-animation");
			fullscreenButton.className += ' hidden';
			card.compressing = false;
		}
		else
		{

			truncatedTitle = card.data.caption.trunc(25);
			truncatedTitle = "<p>" + truncatedTitle + "</p>";
			textContainer.innerHTML = truncatedTitle;
			picTags.className += ' hidden';
			card.compressing = true;
		}
	},
	rmTag: function(tname) {
	  var tIndex = -1;
	  var tobjs = card.tags;
	  for (var i = 0; i < tobjs.length; i++) {
	    if (Object.keys(tobjs[i])[0] == tname) {
	      tIndex = i;
	      break;
	    }
	  }
	  if (tIndex != -1)
	    tobjs = tobjs.slice(0, tIndex).concat(tobjs.slice(tIndex + 1));
	},
	_initImageGestures = function () {
		var imageContainer = card.getElementsByClassName('image-container')[0];
		if (!imageContainer)
			return;
		gesture.listen("tap", imageContainer, tapCallback);
		gesture.listen("down", imageContainer, returnTrue);
		gesture.listen("up", imageContainer, returnTrue);
		gesture.listen("drag", imageContainer, returnTrue);
		modal.setPinchLauncher(imageContainer,
			function() { upCallback(true); });
	},
	_initCardGestures = function () {
		gesture.listen("swipe", this, swipeCallback);
		gesture.listen("up", this, upCallback);
		//gesture.listen("tap", this, tapCallback);
		gesture.listen("drag", this, dragCallback);
		gesture.listen("hold", this, holdCallback);
		gesture.listen("down", this, downCallback);
		initImageGestures.call(this);
	},
	_initLoginInputs = function () {
		var listInputs = document.forms[0].getElementsByClassName('su-input'),
			listLength = listInputs.length;
		for (var index = 0;index < listLength; ++index)
		{
			focusInput(listInputs[index]);
		}
	}
};