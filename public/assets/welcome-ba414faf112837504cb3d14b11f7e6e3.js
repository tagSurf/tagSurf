//These variables are reinitialized on every pageload
var authorizedSession = null,
    cardIndex = 0,
    currentUser = {
      id : null,
      email : null,
      username: null,
      slug : null,
      vote_btns : true,
      admin : false,
      unseen_bumps : 0,
      unseen_refs : 0
    },
    returnTrue = function() { return true; },
    hasSwiped = false,
    hasKeySwiped = false,
    hasSwitchedTags = false,
    current_gallery_image = null,
    DEBUG = false;
// Set DEBUG = true in non-production environments
if ((document.location.hostname.indexOf("localhost") != -1) 
  || (document.location.hostname.indexOf("staging.tagsurf.co") != -1)
  || (document.location.hostname.indexOf("192.168") != -1)
  || (document.location.hostname.indexOf("172.20") != -1))
  DEBUG = true;
var hasClass = function (node, className) {
  return node.className && new RegExp("(^|\\s)" + className + "(\\s|$)").test(node.className);
};
Number.prototype.mod = function(n) {
  return ((this%n)+n)%n;
}
String.prototype.trunc = String.prototype.trunc ||
  function(n){
    return this.length>n ? this.substr(0,n-1)+'&hellip;' : this;
};
var toggleClass = function (className, onOrOff) {
  var classIsOn = hasClass(this, className);
  if (classIsOn && onOrOff != "on")
    this.classList.remove(className);
  else if (!classIsOn && onOrOff != "off")
    this.classList.add(className);
};
var galleries = ["history", "favorites", "submissions", "tag", "shares"];
var whichGallery = function() {
  for (var i = 0; i < galleries.length; i++)
    if (document.location.pathname.indexOf(galleries[i]) != -1)
      return galleries[i];
  return null;
};
var isGallery = function() {
  var gallery = whichGallery();
  if (gallery == null)
    return false;
  else
    return true;
};

var isAuthorized = function () {
  if (authorizedSession != null)
    return authorizedSession;
  if (document.location.href.indexOf('share') == -1 
    || document.location.href.indexOf('shares') != -1) {
    authorizedSession = true;
    if (!isDesktop())
      currentUser.vote_btns = false;
    setTimeout(function() { getUser(); }, 3000);
  }
  else
    authorizedSession = false;
  return authorizedSession;
};

var getUser = function () {
  if (authorizedSession && !currentUser.id)
    xhr('/api/users', "GET", function(result) {
        if (result.user != "not found") {
          currentUser.id = result.user.id;
          currentUser.email = result.user.email;
          currentUser.username = result.user.username;
          currentUser.slug = result.user.slug;
          currentUser.admin = result.user.admin;
          currentUser.safeSurf = result.user.safe_mode;
          currentUser.unseen_bumps = result.unseen_bumps;
          currentUser.unseen_refs = result.unseen_referrals;
          if ((currentUser.unseen_bumps + currentUser.unseen_refs) != 0)
            updateMenuBadges(currentUser.unseen_bumps + currentUser.unseen_refs);
            if (isGallery() && whichGallery() == "shares")
              updateGalleryBadges(currentUser.unseen_refs, currentUser.unseen_bumps, true);
        } 
      }, function(result) {
        if (result.user == "not found" && DEBUG) 
          console.log("Error: User not found");
      });
  setTimeout(function() { userStatsPoller()}, 5000);
};

// This might degrade performance at scale.
// Consider websockets as possible alternative
var userStatsPoller = function () {
  xhr('/api/users', "GET", function(result) {
      if (result.user != "not found") {
        currentUser.safeSurf = result.user.safe_mode;
        if (currentUser.unseen_bumps != result.unseen_bumps 
            || currentUser.unseen_refs != result.unseen_referrals) {
          currentUser.unseen_bumps = result.unseen_bumps;
          currentUser.unseen_refs = result.unseen_referrals;
          updateMenuBadges(currentUser.unseen_bumps + currentUser.unseen_refs);
          if (isGallery() && whichGallery() == "shares")
            updateGalleryBadges(currentUser.unseen_refs, currentUser.unseen_bumps);
        }
      }
    }, function(result) {
      if (result.user == "not found" && DEBUG) 
        console.log("Error: User not found");
    });
  setTimeout(function() { userStatsPoller(); }, 5000);
}



// autocomplete stuff
var current_tag, current_deck, cardCbs, tinput, inputContainer, slideContainer,
  scrollContainer, closeAutoComplete = function(noback) {
    if (noback) {
      slideContainer.className = "";
      scrollContainer.insertBefore(inputContainer,
        scrollContainer.firstChild);
    } else modal.backOff(function() {
      slideContainer.className = "";
      scrollContainer.insertBefore(inputContainer,
        scrollContainer.firstChild);
    });
    tinput.active = false;
  }, clearStack = function() {
      var cdec = current_deck.getEndCard();
      cdec && cdec.unshow();
      var numCards = slideContainer.childNodes.length;
      for (var i = 0; i < numCards; i++)
        current_deck.cards[i].showing && current_deck.cards[i].unshow();
  };

// TODO: Kill this usage in gallery and use card.pushTags() instead 
// tagging stuff
var newtags = [];
var pushTags = function() {
  if (newtags.length > 0) {
    while (newtags.length)
      xhr("/api/media/" + currentMedia.id + "/tags/" + newtags.shift(), "POST", null, null);
    autocomplete.populate();
  }
};

var popTrending; // defined in feed
var fadeInBody = function() {
  addCss({
    "html, body": function() {
      return "width: " + window.innerWidth + "px; "
        + "height: " + window.innerHeight + "px; "
        + "opacity: 1;";
    }
  });
};
var shareVotes = [], stashVotesAndLogin = function () {
  sessionStorage.setItem("lastPath",
    current_tag + "~" + currentMedia.id);
  sessionStorage.setItem("shareVotes",
    JSON.stringify(shareVotes));
  window.location = "/users/sign_in";
};

var messageBox = function (title, message, action_type, cb, backed) {
  var contents = document.createElement('div'),
      closeContainer = document.createElement('div'),
      close = document.createElement('img'),
      titleElement = document.createElement('p'),
      messageElement = document.createElement('p'),
      link = document.createElement('div');
  backed = (typeof backed === "undefined") ? false : backed;
  closeContainer.className = "close-button-container pointer";
  close.className = "x-close-button";
  close.src = "http://assets.tagsurf.co/img/Close.png";
  gesture.listen('down', closeContainer, modal.callPrompt);
  closeContainer.appendChild(close);
  contents.appendChild(closeContainer);
  titleElement.className = "prompt-title";
  if(title)
    titleElement.innerHTML = title;
  else
    titleElement.innerHTML = "Oops";
  contents.appendChild(titleElement);
  messageElement.className = "prompt-message";
  if(message)
    messageElement.innerHTML = message;
  else
    messageElement.innerHTML = "Something went wrong";
  contents.appendChild(messageElement);
  link.className = "msgbox-btn";
  if(typeof action_type === "undefined") {
    link.innerHTML = "OK";
    if(cb)
      gesture.listen("tap", link, cb);
    else
      gesture.listen("tap", link, modal.callPrompt);
  }
  else {
    link.innerHTML = action_type;
    if(action_type == "login" && !cb)
      gesture.listen("tap", link, function () {
        window.location = "/users/sign_in"
      });
    else if(cb)
      gesture.listen("tap", link, cb);
    else
      gesture.listen("tap", link, modal.callPrompt);
  }
  gesture.listen("down", link, function () {
    link.classList.add('ts-active-button');
  });
  gesture.listen("up", link, function () {
    link.classList.remove('ts-active-button');
  });
  contents.appendChild(link);
  modal.promptIn(contents, null, backed);
};

var buildVoteButtons = function (dragCallback, swipeSlider) {
      var upvoteBtn = document.createElement('div'),
          downvoteBtn = document.createElement('div'),
          downvoteIcon = document.createElement('img'),
          upvoteIcon = document.createElement('img');
      downvoteIcon.src = "http://assets.tagsurf.co/img/downvote_btn.png";
      upvoteIcon.src = "http://assets.tagsurf.co/img/upvote_btn.png";
      downvoteIcon.id = "downvote-icon";
      upvoteIcon.id = "upvote-icon";
      downvoteBtn.className = "vote-button hidden";
      downvoteBtn.id = "vote-button-left";
      upvoteBtn.className = "vote-button hidden";
      upvoteBtn.id = "vote-button-right";
      downvoteBtn.appendChild(downvoteIcon);
      upvoteBtn.appendChild(upvoteIcon);
      gesture.listen('down', downvoteBtn, function () {
        downvoteBtn.firstChild.src = "http://assets.tagsurf.co/img/downvote_btn-invert.png";
      });
      gesture.listen('up', downvoteBtn, function () {
        setTimeout(function() {
          downvoteBtn.firstChild.src = "http://assets.tagsurf.co/img/downvote_btn.png";
        }, 200);
      });
      gesture.listen('tap', downvoteBtn, function () {
        if (modal.zoom.zoomed)
          modal.callZoom(1);    
        cardCbs.drag("left", -1, -1);
        setTimeout(function() { swipeSlider("left"); }, 200);
        analytics.track("Tap Downvote Button");
      });

      gesture.listen('down', upvoteBtn, function () {
        upvoteBtn.firstChild.src = "http://assets.tagsurf.co/img/upvote_btn-invert.png";
      });
      gesture.listen('up', upvoteBtn, function () {
        setTimeout(function() {
          upvoteBtn.firstChild.src = "http://assets.tagsurf.co/img/upvote_btn.png";          
        }, 200);
      });
      gesture.listen('tap', upvoteBtn, function () {
        if (modal.zoom.zoomed)
          modal.callZoom(1);     
        cardCbs.drag("right", 1, 1);
        setTimeout(function() { swipeSlider("right"); }, 200);
        analytics.track("Tap Upvote Button");
      });
      document.body.appendChild(downvoteBtn);
      document.body.appendChild(upvoteBtn);
    },
    voteButtonsOn = function() {
      if(document.getElementById('vote-button-right')) {
        toggleClass.apply(document.getElementById('vote-button-right'), ["hidden", "off"]);
        toggleClass.apply(document.getElementById('vote-button-left'), ["hidden", "off"]);
      }
    }, 
    voteButtonsOff = function() {
      if (document.getElementById('vote-button-right')) {
        toggleClass.apply(document.getElementById('vote-button-right'), ["hidden", "on"]);
        toggleClass.apply(document.getElementById('vote-button-left'), ["hidden", "on"]);
      }
    },
    flashVoteButton = function(direction) {
      if (direction == "right") {
        document.getElementById("upvote-icon").src = "http://assets.tagsurf.co/img/upvote_btn-invert.png";
        setTimeout(function () {
          document.getElementById("upvote-icon").src = "http://assets.tagsurf.co/img/upvote_btn.png";
        }, 300);
      }
      else if (direction == "left") {
        document.getElementById("downvote-icon").src = "http://assets.tagsurf.co/img/downvote_btn-invert.png";
        setTimeout(function () {
          document.getElementById("downvote-icon").src = "http://assets.tagsurf.co/img/downvote_btn.png";
        }, 300);
      }
    };

var currentMedia, panicCb, //def in feed
  checkShare = function(shareCb) {
    var d = currentMedia;
    if (d && d.type.indexOf("content") != -1) {
      share.on(d, shareCb);
      refer.on(d);
      if(whichGallery()) //no panic modal in galleries
        return;
      else
        panic.on(d, panicCb);
        if(currentUser.vote_btns)
          voteButtonsOn();
    } else if (d && d.type == "login") {
        if(currentUser.vote_btns)
          voteButtonsOn();
    } else {
      share.off();
      panic.off();
      voteButtonsOff();
      if (addBarSlid)
        slideAddBar();
    }
  }, 
  setCurrentMedia = function(d, shareCb) {
    currentMedia = d;
    checkShare(shareCb);
  };
var _addCss = function(css) {
    var n = document.createElement("style");
    n.type = "text/css";
    if (n.styleSheet)
        n.styleSheet.cssText = css;
    else
        n.appendChild(document.createTextNode(css));
    document.getElementsByTagName("head")[0].appendChild(n);
};
var addedCss = [];
var addCss = function(defobj, noadd) {
  var s = "", defname;
  for (defname in defobj)
    s += defname + " { " + defobj[defname]() + " } ";
  isNaN(noadd) && addedCss.push(defobj);
  _addCss(s);
};
var getOrientation = function() {
  return window.innerWidth < window.innerHeight ? "portrait" : "landscape";
};
var maxCardHeight, resizeCb;
var setMaxCardHeight = function() {
  maxCardHeight = window.innerHeight - 240;
};
var setResizeCb = function(cb) {
  resizeCb = cb;
};
setMaxCardHeight();
var lastWidth = window.innerWidth;
window.onresize = function() {
  if (!isDesktop() && (lastWidth == window.innerWidth) || throbber.active)
    return;
  lastWidth = window.innerWidth;
  setMaxCardHeight();
  addedCss.forEach(addCss);
  resizeCb && resizeCb();
};

var xhr = function(path, action, cb, eb, async, payload) {
  var _xhr = new XMLHttpRequest();
  if(DEBUG) 
    console.log("XHR Request. Path: " + path + " action: " + (action || "GET"));
  if (typeof async === "undefined")
    async = true;
  _xhr.open(action || "GET", path, async);
  if (action == "PATCH")
    _xhr.setRequestHeader("Content-type", "application/json");
  _xhr.onreadystatechange = function() {
    if (_xhr.readyState == 4) {
      var resp = _xhr.responseText.charAt(0) == "<" ? 
      { "errors": _xhr.responseText } : JSON.parse(_xhr.responseText);
      if (resp.errors || _xhr.status != 200) {
        if (eb) 
          eb(resp, _xhr.status);
        if (DEBUG && _xhr.status != 401 && _xhr.status != 404) {
          var errstr = "XHR error! Request failed. Path:"
            + path + " Errors: " + resp.errors + " Response: "
            + _xhr.responseText + " Status: " + _xhr.status;
          console.log(errstr);
          !isDesktop() && alert(errstr);
        }
      } 
      else
        cb && cb(resp);
    }
  }
  _xhr.send(payload);
};
var mod = function(opts) {
  var targets = opts.targets ? opts.targets
    : (opts.target ? [opts.target]
    : (opts.className ? document.getElementsByClassName(opts.className)
    : (opts.id ? [document.getElementById(opts.id)] : [])));
  var property = opts.property || "display";
  var value = opts.value ||
    (opts.show ? "block" : opts.hide ? "none" : "");
  for (var i = 0; i < targets.length; i++)
    targets[i].style[property] = value;
};

// platform detection
var __ua = navigator.userAgent, _ua = {
  isUIWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(__ua),
  isSafariOrUIWebView: /(iPhone|iPod|iPad).*AppleWebKit/i.test(__ua),
  isIphone: __ua.indexOf("iPhone") != -1,
  isIpad: __ua.indexOf("iPad") != -1,
  isIos: (__ua.indexOf("iPhone") != -1) || (__ua.indexOf("iPad") != -1),
  isMobile: __ua.toLowerCase().indexOf("mobile") != -1,
  isAndroid: __ua.indexOf("Android") != -1,
  isNativeAndroid: __ua.indexOf("AndroidWebView") != -1,
  isFacebook: __ua.indexOf("FB") != -1,
  isStockAndroid: (__ua.indexOf("Mozilla/5.0") != -1)
    && (__ua.indexOf("Android ") != -1)
    && (__ua.indexOf("AppleWebKit") != -1)
    && (__ua.indexOf("Chrome") == -1)
};
var isIos = function() {
  return _ua.isIos;
};
var isUIWebView = function(){
  return _ua.isUIWebView && !_ua.isFacebook;
};
var isIpad = function(){
  return _ua.isIpad;
};
var isIphone = function(){
  return _ua.isIphone;
};
var isDesktop = function(){
  return !_ua.isMobile && !_ua.isAndroid && !_ua.isIos;
}
var isTablet = function(){
  return _ua.isIpad || (_ua.isAndroid && !_ua.isMobile);
};
var isMobile = function() {
  return _ua.isMobile;
};
var isAndroid = function() {
  return _ua.isAndroid;
};
var isNativeAndroid = function() {
  return _ua.isNativeAndroid;
};
var isStockAndroid = function() {
  return _ua.isStockAndroid;
};
var isNarrow = function() {
  return window.innerWidth < 700;
};

var trans = function(node, cb, transition, transform) {
  var transTimeout,
    isClass = transition && transition.split(" ").length == 1;
  var wrapper = function () {
    if (transition) {
      if (isClass)
        node.classList.remove(transition);
      else {
        node.style['-webkit-transition'] = "";
      }
    }
    if (transform) node.style['-webkit-transform'] = "";
    if (transTimeout) {
      clearTimeout(transTimeout);
      transTimeout = null;
    }
    node.removeEventListener("webkitTransitionEnd", wrapper, false);
    cb && cb();
  };
  node.addEventListener("webkitTransitionEnd", wrapper, false);
  if (transition) {
    if (isClass)
      node.classList.add(transition);
    else {
      node.style['-webkit-transition'] = transition;
      transTimeout = setTimeout(wrapper,
        parseInt(transition.split(" ")[1]));
    }
  }
  if (transform) node.style['-webkit-transform'] = transform;
};
var validEmail = function(s) {
  var atChar = s.indexOf('@', 1);
  var dotChar = s.indexOf('.', atChar);
  if (atChar == -1 || dotChar == -1 ||
    dotChar == s.length - 1 || atChar + 2 > dotChar)
    return false;
  return true;
};

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik MÃ¶ller. fixes from Paul Irish and Tino Zijdel

// MIT license

var requestAnimFrame;
(function() {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
			|| window[vendors[x]+'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
				timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	requestAnimFrame = window.requestAnimationFrame;

	if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = function(id) {
		clearTimeout(id);
	};
}());
var gesture = {
	gid: 0,
	preventDefault: true,
	stopPropagation: true,
	thresholds: {
		swipe: {
			minDistance: 35,
			maxTime: 400,
			minDP: 600,
			maxDP: 1000
		},
		drag: {
			minDP: 0,
			maxDP: 1000
		},
		tap: {
			maxDistance: 10,
			maxTime: 700,
			waitTime: 300,
			maxCount: 2
		},
		hold: {
			maxDistance: null, // set to pixel value if desired
			interval: 1000
		},
		up: {
			androidDelay: 600
		},
		pinch: {}
	},
	_vars: {
		active: false,
		startTime: null,
		dragTime: null,
		startPos: null,
		lastPos: null,
		tapCount: 0,
		holdCount: 0,
		tapTimeout: null,
		holdInterval: null,
		stopTimeout: null,
		firstPinch: null,
		stopPropagation: false,
		preventDefault: false,
		iosPinch: false,   // is ready to pinch
		iosPinching: false // is currently pinching
	},
	gevents: {
		GestureStart: "gesturestart",
		GestureChange: "gesturechange",
		GestureEnd: "gestureend"
	},
	events: isMobile() && {
		Start: "touchstart",
		Stop: "touchend",
		Move: "touchmove",
		Cancel: "touchcancel"
	} || {
		Start: "mousedown",
		Stop: "mouseup",
		Move: "mousemove"
	},
	handlers: { drag: {}, swipe: {}, tap: {}, up: {}, down: {}, hold: {}, pinch: {} },
	tuneThresholds: function() {
		if (!isIos())
			for (var gest in gesture.thresholds)
				for (var constraint in gesture.thresholds[gest]) {
					var suffix = constraint.slice(3);
					if (suffix == "Distance")
						gesture.thresholds[gest][constraint] /= 2;
					else if (suffix == "DP")
						gesture.thresholds[gest][constraint] *= 2;
				}
	},
	getPos: function(e) {
		if (e.x == undefined) {
			e.x = e.pageX || e.changedTouches[0].pageX;
			e.y = e.pageY || e.changedTouches[0].pageY;
		}
		return { x: e.x, y: e.y };
	},
	getDiff: function(p1, p2) {
		var d = {};
		d.x = p2.x - p1.x;
		d.y = p2.y - p1.y;
		d.distance = Math.sqrt((d.x * d.x) + (d.y * d.y));
		if (Math.abs(d.x) > Math.abs(d.y))
			d.direction = d.x > 0 ? 'right' : 'left';
		else
			d.direction = d.y > 0 ? 'down' : 'up';
		return d;
	},
	pinchDiff: function(e) {
		return isIos() ? e.scale : 
			gesture.getDiff(gesture.getPos(e.touches[0]), 
				gesture.getPos(e.touches[1]));
	},
	pixelsPerSecond: function(distance, timeDiff, gest) {
		var t = gesture.thresholds[gest];
		return Math.min(t.maxDP, Math.max(t.minDP,
			distance / timeDiff)) * (isIos() ? 1 : 0.5);
	},
	isMulti: function(e) {
		return isMobile() && e.touches.length > 1;
	},
	onGestureStart: function(e, node) {
	},
	onGestureChange: function(e, node) {
		gesture.triggerPinch(node, Math.pow(e.scale, (1/3)));
	},
	onGestureEnd: function(e, node) {
		gesture.triggerPinch(node);
		node.gvars.iosPinching = false;
	},
	onStart: function(e, node) {
		var t = gesture.thresholds;
		var v = node.gvars;
		v.active = true;
		v.holdCount = 0;
		v.startTime = v.dragTime = Date.now();
		v.startPos = v.lastPos = gesture.getPos(e);
		if (v.tapTimeout) {
			clearTimeout(v.tapTimeout);
			v.tapTimeout = null;
		}
		if (gesture.isMulti(e)) {
			if (isAndroid())
				v.firstPinch = gesture.pinchDiff(e);
			else
				v.iosPinching = true;
		} else {
			v.holdInterval = setInterval(function() {
				if (!v.active || (t.hold.maxDistance && (t.hold.maxDistance <
					gesture.getDiff(v.startPos, v.lastPos).distance))) {
					clearInterval(v.holdInterval);
					v.holdInterval = null;
					return;
				}
				v.holdCount += 1;
				gesture.triggerHold(node, t.hold.interval * v.holdCount);
			}, t.hold.interval);
		}
		return gesture.triggerDown(node);
	},
	onStop: function(e, node, delayed) {
		var v = node.gvars;
		if (!delayed && v.holdInterval) {
			clearInterval(v.holdInterval);
			v.holdInterval = null;
		}
		if (!v.active) return;
		var t = gesture.thresholds;
		var pos = gesture.getPos(e);
		var diff = gesture.getDiff(v.startPos, pos);
		var timeDiff = Date.now() - v.startTime;
		v.active = !!(e.touches && e.touches.length);

		if (e.touches && e.touches.length == 1) // multitouch ended
			gesture.triggerPinch(node);

		if (!v.active && !v.iosPinching) { // last finger raised
			if ( (timeDiff < t.swipe.maxTime)
				&& (diff.distance > t.swipe.minDistance) ) // swipe
				gesture.triggerSwipe(node, diff.direction,
					diff.distance, diff.x, diff.y,
					gesture.pixelsPerSecond(diff.distance, timeDiff, "swipe"));
			else if ( (timeDiff < t.tap.maxTime)
				&& (diff.distance < t.tap.maxDistance) ) { // tap
				v.tapCount += 1;
				if (v.tapCount == t.tap.maxCount)
					gesture.triggerTap(node);
				else
					v.tapTimeout = setTimeout(gesture.triggerTap, t.tap.waitTime, node);
			}
		}
		return gesture.triggerUp(node, delayed);
	},
	onMove: function(e, node) {
		var v = node.gvars;
		if (v.active) {
			var pos = gesture.getPos(e),
				diff = gesture.getDiff(v.lastPos, pos),
				now = Date.now(),
				tdiff = now - v.dragTime;
			v.lastPos = pos;
			v.dragTime = now;
			if (!gesture.isMulti(e))
				return gesture.triggerDrag(node, diff.direction,
					diff.distance, diff.x, diff.y,
					gesture.pixelsPerSecond(diff.distance, tdiff, "drag"));
			if (isAndroid())
				gesture.triggerPinch(node,
					gesture.pinchDiff(e).distance / v.firstPinch.distance);
		}
	},
	gWrap: function(node) {
		var e = {};
		['GestureStart', 'GestureChange', 'GestureEnd'].forEach(function(eName) {
			e[eName] = function(_e) {
				_e.preventDefault();
				_e.stopPropagation();
				return gesture['on' + eName](_e, node) || false;
			};
		});
		return e;
	},
	eWrap: function(node) {
		var e = {};
		['Start', 'Stop', 'Move'].forEach(function(eName) {
			e[eName] = function(_e) {
				node.gvars.preventDefault && _e.preventDefault();
				node.gvars.stopPropagation && _e.stopPropagation();
				return gesture['on' + eName](_e, node) 
					|| (gesture.preventDefault && _e.preventDefault()) 
					|| (gesture.stopPropagation && _e.stopPropagation()) 
					|| false;
			};
		});
		if (gesture.events.Cancel)
			e.Cancel = e.Stop;
		return e;
	},
	listen: function(eventName, node, cb, stopPropagation, preventDefault) {
		if (!node.gid) {
			node.gid = ++gesture.gid;
			var e = node.listeners = gesture.eWrap(node);
			for (var evName in gesture.events)
				node.addEventListener(gesture.events[evName], e[evName]);
			node.gvars = JSON.parse(JSON.stringify(gesture._vars));
		}
		if (eventName == "pinch" && isIos()) {
			var _e = gesture.gWrap(node);
			for (var evName in gesture.gevents)
				node.addEventListener(gesture.gevents[evName], _e[evName]);
			for (var k in _e)
				node.listeners[k] = _e[k];
			node.gvars.iosPinch = true;
		}
		node.gvars.stopPropagation = stopPropagation;
		node.gvars.preventDefault = preventDefault;
		if (!gesture.handlers[eventName][node.gid])
			gesture.handlers[eventName][node.gid] = [];
		gesture.handlers[eventName][node.gid].push(cb);
	},
	unlisten: function(node) {
		if (node.gid) {
			var e = node.listeners;
			for (var evName in gesture.events)
				node.removeEventListener(gesture.events[evName], e[evName]);
			if (node.gvars.iosPinch) {
				for (var evName in gesture.gevents)
					node.removeEventListener(gesture.gevents[evName], e[evName]);
			}
			for (var eventName in gesture.handlers)
				if (node.gid in gesture.handlers[eventName])
					delete gesture.handlers[eventName][node.gid];
			delete node.gid;
		}
	},
	triggerPinch: function(node, normalizedDistance) {
		var handlers = gesture.handlers.pinch[node.gid];
		if (handlers) for (var i = 0; i < handlers.length; i++)
			handlers[i](normalizedDistance);
	},
	triggerSwipe: function(node, direction, distance, dx, dy, pixelsPerSecond) {
		var handlers = gesture.handlers.swipe[node.gid];
		hasSwiped = true;
		if (handlers) for (var i = 0; i < handlers.length; i++)
			handlers[i](direction, distance, dx, dy, pixelsPerSecond);
	},
	triggerTap: function(node) {
		var v = node.gvars;
		var handlers = gesture.handlers.tap[node.gid];
		if (handlers) for (var i = 0; i < handlers.length; i++)
			handlers[i](v.tapCount);
		v.tapCount = 0;
		v.tapTimeout = null;
	},
	triggerDrag: function(node, direction, distance, dx, dy, pixelsPerSecond) {
		var returnVal = false;
		var handlers = gesture.handlers.drag[node.gid];
		if (handlers) for (var i = 0; i < handlers.length; i++)
			returnVal = handlers[i](direction, distance, dx, dy, pixelsPerSecond) || returnVal;
		return returnVal;
	},
	triggerHold: function(node, duration) {
		var handlers = gesture.handlers.hold[node.gid];
		if (handlers) for (var i = 0; i < handlers.length; i++)
			handlers[i](duration);
	},
	triggerUp: function(node, delayed) {
		var returnVal = false;
		var handlers = gesture.handlers.up[node.gid];
		if (handlers) for (var i = 0; i < handlers.length; i++)
			returnVal = handlers[i](delayed) || returnVal;
		return returnVal;
	},
	triggerDown: function(node) {
		var returnVal = false;
		var handlers = gesture.handlers.down[node.gid];
		if (handlers) for (var i = 0; i < handlers.length; i++)
			returnVal = handlers[i]() || returnVal;
		return returnVal;
	}
};
gesture.tuneThresholds();
var populateNavbar = function () {
  var nav = document.getElementById("nav");
  var navbar = document.createElement("div");
  navbar.id = "navbar";
  var menu_slider = document.createElement("div");
  menu_slider.id = "menu-slider";
  var tag_adder = document.createElement("div");
  tag_adder.id = "tag-adder";

  var gallery = whichGallery();
  var tag = gallery ? document.location.hash.slice(1) : null;
  var full_navbar_content = [
    "<a onclick='starCallback();'>","<div id='favorites-btn' class='btn'>","<img id='favorites-icon' src='http://assets.tagsurf.co/img/favorites_icon_blue.png'>","</div>","</a>",
      "<a onclick='slideAddBar();'>","<div id='add-btn' class='btn'>","<img id='add-icon' src='http://assets.tagsurf.co/img/add_icon_blue.png'>","</div>","</a>",
    "<div class='navbar-center'>",
      "<label id='slider-label' for='slider-box' ontouchmove='return false;' onclick='slideNavMenu();'>",
        "<span id='main-logo'>",
          gallery ? (gallery == "tag"
            ? ("<span class='pointer'>#" + tag + "</span>")
            : ("<img class='gallery-icon' src='http://assets.tagsurf.co/img/" + gallery + "_icon_gray.png'><span id='gallery-name' class='pointer'>" + gallery.toUpperCase() + "</span>"))
          : "<img id='tagsurf-logo' src='http://assets.tagsurf.co/img/logo_big.png'></img>",
        "</span><span id='history-logo'>HISTORY</span>",
        "<img id='slider-icon' " + (gallery ? "" : "class='vtop' ") + "src='http://assets.tagsurf.co/img/down_arrow_nav.png'></img><div id='nav-badge' class='badge-icon hidden'>0</div>",
      "</label>",
    "</div>",
  ], 
  reduced_navbar_content = [
    "<div id='help-btn'>",
      "<img id='help-icon' src='http://assets.tagsurf.co/img/help_btn.png'>",
    "</div>",
    "<div class='navbar-center'>",
      "<label id='slider-label' for='slider-box' ontouchmove='return false;' onclick='slideNavMenu();'>",
        "<span id='main-logo'>",
          gallery ? (gallery == "tag"
            ? ("<span class='pointer'>#" + tag + "</span>")
            : ("<img class='gallery-icon' src='http://assets.tagsurf.co/img/" + gallery + "_icon_gray.png'><span id='gallery-name' class='pointer'>" + gallery.toUpperCase() + "</span>"))
          : "<img id='tagsurf-logo' src='http://assets.tagsurf.co/img/logo_big.png'></img>",
        "</span><span id='history-logo'>HISTORY</span>",
        "<img id='slider-icon' " + (gallery ? "" : "class='vtop' ") + "src='http://assets.tagsurf.co/img/down_arrow_nav.png'></img>",
      "</label>",
    "</div>",
  ],
  full_slider_content = [
    "<input type='checkbox' name='slider-box' id='slider-box' style='display:none'>",
    "<div id='slide-down-menu' class='pointer'>",
      "<ul>",
        "<li><a href='/share/trending/0'><div>",
          "<img class='menu-icon' src='http://assets.tagsurf.co/img/trending_icon_gray.png'></img>",
          "<img class='menu-icon' src='http://assets.tagsurf.co/img/trending_icon_white.png'></img>",
          "&nbsp;&nbsp;&nbsp;TRENDING",
        "</div></a></li>",
        "<li><a href='/favorites'><div>",
          "<img class='menu-icon' src='http://assets.tagsurf.co/img/favorites_icon_gray.png'></img>",
          "<img class='menu-icon' src='http://assets.tagsurf.co/img/favorites_icon_white.png'></img>",
          "&nbsp;&nbsp;&nbsp;FAVORITES",
        "</div></a></li>",
        "<li><a href='/history'><div>",
          "<img class='menu-icon' src='http://assets.tagsurf.co/img/history_icon_gray.png'></img>",
          "<img class='menu-icon' src='http://assets.tagsurf.co/img/history_icon_white.png'></img>",
          "&nbsp;&nbsp;&nbsp;HISTORY",
        "</div></a></li>",
        "<li><a href='/shares'><div>",
          "<img class='menu-icon' src='http://assets.tagsurf.co/img/shares_icon_gray.png'></img>",
          "<img class='menu-icon' src='http://assets.tagsurf.co/img/shares_icon_white.png'></img>",
          "&nbsp;&nbsp;&nbsp;SHARES",
        "</div><div id='slider-badge' class='badge-icon small-badge inline hidden'></div></a></li>",
        "<li><a id='options-btn'><div>",
          "<img class='menu-icon' src='http://assets.tagsurf.co/img/options_icon_gray.png'></img>",
          "<img class='menu-icon' src='http://assets.tagsurf.co/img/options_icon_white.png'></img>",
          "&nbsp;&nbsp;&nbsp;OPTIONS",
        "</div></a></li>",
        "<li><a id='logout'><div>",
          "<img class='menu-icon' src='http://assets.tagsurf.co/img/logout_icon_gray.png'></img>",
          "<img class='menu-icon inverted' src='http://assets.tagsurf.co/img/logout_icon_white.png'></img>",
          "&nbsp;&nbsp;&nbsp;LOGOUT",
        "</div></a></li>",
      "</ul>",
    "</div>",
  ],
  reduced_slider_content = [
    "<input type='checkbox' name='slider-box' id='slider-box' style='display:none'>",
    "<div id='slide-down-menu' class='pointer'>",
      "<ul>",
        "<li><a onclick='popTrending();'><div>",
          "<img class='menu-icon' src='http://assets.tagsurf.co/img/trending_icon_gray.png'></img>",
          "<img class='menu-icon' src='http://assets.tagsurf.co/img/trending_icon_white.png'></img>",
          "&nbsp;&nbsp;&nbsp;TRENDING",
        "</div></a></li>",
        "<li><a id='options-btn'><div>",
          "<img class='menu-icon' src='http://assets.tagsurf.co/img/options_icon_gray.png'></img>",
          "<img class='menu-icon' src='http://assets.tagsurf.co/img/options_icon_white.png'></img>",
          "&nbsp;&nbsp;&nbsp;OPTIONS",
        "</div></a></li>",
        "<li><a id='login'><div>",
          "<img class='menu-icon inverted' src='http://assets.tagsurf.co/img/logout_icon_gray.png'></img>",
          "<img class='menu-icon' src='http://assets.tagsurf.co/img/logout_icon_white.png'></img>",
          "&nbsp;&nbsp;&nbsp;LOGIN",
        "</div></a></li>",
      "</ul>",
    "</div>",
  ],
  menu_slider_content = isAuthorized() ? full_slider_content : reduced_slider_content;
  navbar_content = isAuthorized() ? full_navbar_content : reduced_navbar_content;
  navbar.innerHTML = navbar_content.join('\n');
  menu_slider.innerHTML = menu_slider_content.join('\n');
  tag_adder.innerHTML = "<input value='#newtag' spellcheck='false' autocomplete='off' autocapitalize='off' autocorrect='off'><img src='http://assets.tagsurf.co/img/add_tag_button.png'><div id='add-tag-autocomplete' class='autocomplete hider'></div>";
  nav.appendChild(navbar);
  nav.appendChild(menu_slider);
  nav.appendChild(tag_adder);
  if (!isAuthorized()) {
    gesture.listen("down", document.getElementById("help-btn"), function () {
      document.getElementById("help-icon").src = 'http://assets.tagsurf.co/img/help_btn_fill.png';
    });
    gesture.listen("up", document.getElementById("help-btn"), function () {
      document.getElementById("help-icon").src = 'http://assets.tagsurf.co/img/help_btn.png';
    });
    gesture.listen("tap", document.getElementById("help-btn"), function () {
      callHelpModal();
      analytics.track('Open Help Modal');
    });
  }
  tag_adder.firstChild.nextSibling.onclick = function() {
    var newtag = tag_adder.firstChild.value.slice(1);
    if (!newtag || newtag == "newtag") return;
    newtags.push(newtag);
    slideAddBar();
    addCallback && addCallback(newtag);
  };
  fadeInBody();
  addCss({
    "#add-tag-autocomplete": function() {
      return "width: " + tag_adder.firstChild.clientWidth + "px";
    },
    ".autocomplete-open": function() {
      return "height: "
        + (isDesktop() ? (window.innerHeight - 200) : 150)
        + "px !important";
    }
  });
  autocomplete.register("add-tag-autocomplete", tag_adder.firstChild, {
    enterCb: function() {
      autocomplete.tapTag(tag_adder.firstChild.value.slice(1),
        "add-tag-autocomplete");
    },
    tapCb: function(tagName) {
      tag_adder.firstChild.value = "#" + tagName;
      tag_adder.firstChild.nextSibling.onclick();
    },
    keyUpCb: function() {
      var ti = tag_adder.firstChild;
      if (ti.value.charAt(0) != "#")
        ti.value = "#" + ti.value.replace(/#/g, "");
    },
    expandCb: function() {
      tag_adder.firstChild.value = "#";
    }
  });
  add_icon = document.getElementById("add-icon");
  if (isAuthorized()) {
    document.getElementById("logout").onclick = function() {
      window.location = "/users/sign_out";
    };
  }
  else
  {
    document.getElementById("login").onclick = stashVotesAndLogin;
  }
  document.getElementById("options-btn").onclick = function() {
    var n = document.createElement("div"),
        title = document.createElement("div"),
        closebtn = document.createElement("img"),
        TOS = document.createElement("div"),
        options_cb = function() {
          checkShare();
          modal.backOff();
          modal.modalOut();
        },
        optionsTable = buildOptionsTable(options_cb);
    n.className = "center-label";
    closebtn.src = "http://assets.tagsurf.co/img/Close.png";
    closebtn.className = "modal-close-button";
    closebtn.id = "options-close-button";
    title.innerHTML = "Options";
    title.className = "options-title";
    TOS.innerHTML = "<a class='blue bold big-lnk' id='terms-lnk'>Terms of Use</a> | <a class='blue bold big-lnk' id='privacy-lnk'>Privacy Policy</a>";
    TOS.className = "tos-line";
    n.appendChild(title);
    n.appendChild(optionsTable);
    n.appendChild(closebtn);
    n.appendChild(TOS);
    slideNavMenu(true);
    share.off();
    panic.off();
    voteButtonsOff();
    modal.modalIn(n, options_cb);
    initDocLinks(checkShare);
  };
};

var buildOptionsTable = function (options_cb) {
  var optionsTable = document.createElement('table'),
      usernameRow = optionsTable.insertRow(0),
      safeSurfRow = optionsTable.insertRow(1),
      safeSurfHelperRow = optionsTable.insertRow(2),
      voteButtonsRow = optionsTable.insertRow(3),
      voteButtonsHelperRow = optionsTable.insertRow(4),
      usernameCell = usernameRow.insertCell(0),
      usernameText = document.createElement('div'),
      voteButtonsTextCell = voteButtonsRow.insertCell(0),
      voteButtonsCheckboxCell = voteButtonsRow.insertCell(1),
      voteButtonsDescCell = voteButtonsHelperRow.insertCell(0),
      safeSurfTextCell = safeSurfRow.insertCell(0),
      safeSurfCheckboxCell = safeSurfRow.insertCell(1),
      safeSurfDescCell = safeSurfHelperRow.insertCell(0),
      safeSurfDesc = document.createElement('div'),
      safeSurfText = document.createElement('div'),
      safeSurfCheckbox = document.createElement('div'),
      voteButtonsDesc = document.createElement('div'),
      voteButtonsText = document.createElement('div'),
      voteButtonsCheckbox = document.createElement('div'),
      username = currentUser.username ? currentUser.username : currentUser.email.split("@")[0];
  // Resume Tutorial (if applicable) 
  if(typeof tutorial != "undefined" && tutorial.paused)
    var resumeTutorial = optionsTable.insertRow(0),
        resumeButtonCell = resumeTutorial.insertCell(0),
        resumeButton = document.createElement('div');
  
  optionsTable.className = "inline options-table";

  usernameText.innerHTML = "User:<span class='blue'> " 
    + username + "</span>";
  usernameText.className = "options-key-text";
  usernameText.style.textAlign = "center";
  usernameCell.appendChild(usernameText);
  usernameCell.colSpan = 2;

 
  // Safe Surf Switch
  safeSurfCheckbox.innerHTML = 
  '<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="safe-surf-checkbox"' +
    ((currentUser && currentUser.safeSurf || !isAuthorized()) ? " checked" : "") +
  '> <label class="onoffswitch-label" for="myonoffswitch"> <span class="onoffswitch-inner"></span> <span class="onoffswitch-switch"></span> </label> <div class="onoffswitch-cover" style="display:' +
  ((isAuthorized() && (!isUIWebView() || !currentUser.safeSurf)) ? 'none' : 'block') + ';"></div>';
  safeSurfText.innerHTML = "Safe Surf";
  safeSurfText.className = voteButtonsText.className= "options-key-text";
  safeSurfDescCell.colSpan = voteButtonsDescCell.colSpan = 2;
  safeSurfDesc.innerHTML = "Safe Surf filters NSFW content<br>out of your feed and galleries.<br><i>(NSFW = Not Safe For Work)</i>";
  safeSurfDesc.className = voteButtonsDesc.className = "options-key-desc";
  gesture.listen('down', safeSurfCheckbox, function () {
    if (isAuthorized())
    {
      if (isUIWebView())
      {
        if (!currentUser.safeSurf) { 
          safeSurfCheckbox.firstChild.checked = !safeSurfCheckbox.firstChild.checked;
          xhr("/api/users/" + currentUser.slug, "PATCH", null, null, null,
            JSON.stringify({ safe_mode: safeSurfCheckbox.firstChild.checked }));
          currentUser.safeSurf = safeSurfCheckbox.firstChild.checked;
          autocomplete.populate();
        }
        else {
          messageBox("Sorry", "Disabling Safe Surf is not allowed for native applications on this device<br/><br/>Visit us in your mobile browser<br/>at <span class='blue'>beta.tagsurf.co</span> for full features");
          analytics.track('Unauthorized iOS Toggle Safe Surf');
        }
      }
      else
      {
        safeSurfCheckbox.firstChild.checked = !safeSurfCheckbox.firstChild.checked;
        xhr("/api/users/" + currentUser.slug, "PATCH", null, null, null,
          JSON.stringify({ safe_mode: safeSurfCheckbox.firstChild.checked }));
        currentUser.safeSurf = safeSurfCheckbox.firstChild.checked;
        autocomplete.populate();
        if(whichGallery())
          location.reload();
        analytics.track('Toggle Safe Surf', {
          safeSurf: currentUser.safeSurf
        });
      }
    }
    else
    {
      messageBox("Oops", "Login to disable Safe Surf", "login", stashVotesAndLogin);
      analytics.track('Unauthorized Toggle Safe Surf');
    }
  });
  safeSurfCheckbox.className = voteButtonsCheckbox.className = 'onoffswitch-container';
  safeSurfTextCell.appendChild(safeSurfText);
  safeSurfCheckboxCell.appendChild(safeSurfCheckbox);
  safeSurfDescCell.appendChild(safeSurfDesc);
  
  // Vote Buttons Switch
  voteButtonsCheckbox.innerHTML = 
  '<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="safe-surf-checkbox"' +
    (currentUser.vote_btns ? " checked" : "") +
  '> <label class="onoffswitch-label" for="myonoffswitch"> <span class="onoffswitch-inner"></span> <span class="onoffswitch-switch"></span> </label>';
  voteButtonsText.innerHTML = "Vote Buttons";
  voteButtonsText.style.fontSize="150%";
  voteButtonsDesc.innerHTML = "Turn off voting buttons and just swipe";

  gesture.listen('down', voteButtonsCheckbox, function () {
    voteButtonsCheckbox.firstChild.checked = !voteButtonsCheckbox.firstChild.checked;
    // Enable this block if votebtn toggle becomes permantent and server tracks this pref
    // xhr("/api/users/" + currentUser.slug, "PATCH", null, null, null,
    //   JSON.stringify({ vote_btns: voteButtonsCheckbox.firstChild.checked }));
    currentUser.vote_btns = voteButtonsCheckbox.firstChild.checked;
    var session = sessionStorage.getItem('vote_btns')
    // Retrieve this pref from session storage
    // if(typeof session !== 'undefined')
    //   sessionStorage.vote_btns = voteButtonsCheckbox.firstChild.checked;
    // else
    //   sessionStorage.setItem("vote_btns", voteButtonsCheckbox.firstChild.checked);
    analytics.track('Toggle Vote Buttons', {
        voteButtons: currentUser.vote_btns
    });
  });
  voteButtonsTextCell.appendChild(voteButtonsText);
  voteButtonsCheckboxCell.appendChild(voteButtonsCheckbox);
  voteButtonsDescCell.appendChild(voteButtonsDesc);
  
  // Resume Tutorial Button (if applicable)
  if(typeof tutorial === "undefined" || !tutorial.paused)
    return optionsTable;
  resumeButton.innerHTML = "Resume Tutorial";
  resumeButton.className = isMobile() ? "msgbox-btn biggest pointer" 
                            : "msgbox-btn really-big pointer";
  resumeButton.id = "resume-btn";
  resumeButtonCell.colSpan = "2";
  gesture.listen("tap", resumeButton, function() {
    options_cb();
    tutorial.resume(1000);
  });
  gesture.listen("down", resumeButton, function () {
      resumeButton.classList.add('ts-active-button');
    });
  gesture.listen("up", resumeButton, function () {
      resumeButton.classList.remove('ts-active-button');
    });
  tutorial.paused && resumeButtonCell.appendChild(resumeButton);
  return optionsTable;
};

var navMenuSlid = false;

var slideNavMenu = function(noback) {
  autocomplete.viewing.autocomplete
    && closeAutoComplete(null, true);
  addBarSlid && slideAddBar(true);
  navMenuSlid = !navMenuSlid;
  toggleClass.apply(document.getElementById("slider-label"),
    ["slid", navMenuSlid ? "on" : "off"]);
  toggleClass.apply(document.getElementById("slide-down-menu"),
    ["opened-menu", navMenuSlid ? "on" : "off"]);
  toggleClass.apply(document.getElementById("nav-badge"),
    ["hidden", !navMenuSlid && document.getElementById("nav-badge").innerHTML != 0 
                                                                        ? "off" : "on"]);
  if (noback != true && !modal.zoom.zoomed && !modal.modal.on)
    navMenuSlid ? modal.halfOn(slideNavMenu) : modal.backOff();
};

var add_icon, add_state = "blue", add_icons = {
  fill: 'http://assets.tagsurf.co/img/add_icon_fill.png',
  blue: 'http://assets.tagsurf.co/img/add_icon_blue.png'
};

var addBarSlid = false;
var slideAddBar = function(noback) {
  if (!isAuthorized()) {
    messageBox("Oops", "You need to login to add a tag", "login", stashVotesAndLogin);
    return;
  }
  if (autocomplete.viewing.autocomplete) {
    autocomplete.retract("autocomplete");
    closeAutoComplete(null, true);
  }
  autocomplete.viewing["add-tag-autocomplete"]
    && autocomplete.retract("add-tag-autocomplete");
  navMenuSlid && slideNavMenu(true);
  addBarSlid = !addBarSlid;
  if (addBarSlid && !currentMedia) return;
  add_state = addBarSlid ? "fill" : "blue";
  add_icon.src = add_icons[add_state];
  toggleClass.apply(document.getElementById("tag-adder"),
    ["opened-menu", addBarSlid ? "on" : "off"]);
  document.getElementById("tag-adder").firstChild.value = "#newtag";
  if (noback != true && !modal.zoom.zoomed && !modal.modal.on)
    addBarSlid ? modal.halfOn(slideAddBar) : modal.backOff();
};

var callHelpModal = function() {
  var n = document.createElement("div"),
    title = document.createElement("div"),
    tutorialButton = document.createElement("div")
    closebtn = document.createElement("img"),
    help_cb = function() {
      checkShare();
      modal.backOff();
      modal.modalOut();
    };
  n.className = "center-label";
  tutorialButton.innerHTML = "Take the tutorial";
  tutorialButton.className = "msgbox-btn";
  tutorialButton.id = "tutorial-button";
  closebtn.src = "http://assets.tagsurf.co/img/Close.png";
  closebtn.className = "modal-close-button";
  closebtn.id = "help-close-button";
  title.innerHTML = "New here?";
  title.className = "options-title";
  n.appendChild(title);
  n.appendChild(closebtn);
  n.appendChild(tutorialButton);
  gesture.listen("tap", tutorialButton, function() {
    modal.modalOut();
    checkShare();
    voteButtonsOn();
    tutorial.start();
  });
  gesture.listen("down", tutorialButton, function () {
    tutorialButton.classList.add('ts-active-button');
  });
  gesture.listen("up", tutorialButton, function () {
    tutorialButton.classList.remove('ts-active-button');
  });
  share.off();
  panic.off();
  voteButtonsOff();
  modal.modalIn(n, help_cb);
};

var starCallback, setStarCallback = function(cb) {
  starCallback = cb;
};
var addCallback, setAddCallback = function(cb) {
  addCallback = cb;
};
var setFavIcon = function(filled) {
  document.getElementById("favorites-icon").src =
    "http://assets.tagsurf.co/img/favorites_icon_" + (filled ? "fill" : "blue") + ".png";
};

var updateMenuBadges = function(number) {
  var navBarBadge = document.getElementById('nav-badge'),
      sliderBadge = document.getElementById('slider-badge');
  
  toggleClass.apply(navBarBadge, ["hidden", !navMenuSlid && number != 0 ? "off" : "on"]);
  toggleClass.apply(sliderBadge, ["hidden", number != 0 ? "off" : "on"]);
  
  navBarBadge.innerHTML = number;
  sliderBadge.innerHTML = number;
}
;
var drag = {
	_direction2constraint: {
		up: "horizontal",
		down: "horizontal",
		left: "vertical",
		right: "vertical"
	},
	nativeScroll: function (n, opts)
	{
		gesture.listen("up", n, function () {
			if (opts.up)
				opts.up();
			return true;
		}, true, false);
		gesture.listen("down", n, function () {
			if (opts.down)
				opts.down();
			return true;
		}, true, false);
		var dirs = {
			up: "down",
			down: "up",
			right: "left",
			left: "right"
		}, lastDirection, dragTimeout, delayedDrag = function() {
			if (dragTimeout) {
				clearTimeout(dragTimeout);
				dragTimeout = null;
			}
			dragTimeout = setTimeout(function() {
				opts.drag(dirs[lastDirection], 0, 0, 0);
			}, 100);
		};
		gesture.listen("drag", n, function (direction, distance, dx, dy) {
			var atBottom = (n.parentNode.scrollHeight - n.parentNode.scrollTop 
				=== n.parentNode.clientHeight), atTop = (n.parentNode.scrollTop === 0),
				atLeft = (n.parentNode.scrollLeft === 0), atRight = (n.parentNode.clientWidth 
				+ n.parentNode.scrollLeft === n.parentNode.scrollWidth);
			lastDirection = direction;
			if (opts.drag)
				opts.drag(direction, distance, dx, dy);
			if((atTop && direction == "down") ||
				(atBottom && direction == "up"))
				return false;
			return !opts.constraint ||
				opts.constraint == drag._direction2constraint[direction];
		}, true, false);
		gesture.listen("swipe", n, function (direction, distance, dx, dy, pixelsPerSecond) { 
			if (direction == "up" && (n.parentNode.scrollTop >=
				(n.parentNode.scrollHeight - (n.parentNode.clientHeight + 800)))
				&& opts.swipe)
			{
				opts.swipe();
			}
		}, true, false);
		n.parentNode.addEventListener('scroll', function (event) {
			if (opts.scroll)
				opts.scroll(event);
			if (opts.drag)
				delayedDrag();
			return true;
		}, false);
	},
	makeDraggable: function (node, opts)
	{
		opts = opts || {};
		if (!opts.interval && !opts.force && !isStockAndroid())
			return drag.nativeScroll(node.firstChild, opts);
		var downCallback, upCallback, dragCallback, swipeCallback;
		node.xDrag = 0;
		node.yDrag = 0;
		node.classList.add('hardware-acceleration');
		node.style['-webkit-transform'] = "translate3d(0,0,0)";
		// Don't apply overflow=visible to welcome tutorial carousel container
		if (node.className.indexOf("carousel") == -1) {
			node.style.overflow = "visible";
			node.parentNode.style.overflow = "visible";
		};
		node.parentNode.addEventListener('scroll', function (event) {return false;}, false);
		downCallback = function () 
		{
			if (node.animating) return;
			node.dragging = false;
			node.touchedDown = true;
			node.animating = false;
			node.xDragStart = node.xDrag;
			node.yDragStart = node.yDrag;
			if (opts.down)
				opts.down();
		};
		upCallback = function (direction) {
			var xMod = 0, yMod = 0, boundaryReached = false;
			node.touchedDown = node.dragging = false;
			if (node.animating == false)
			{
				if (opts.interval)
				{
					if (opts.constraint != "vertical")
					{
						yMod = node.yDrag % opts.interval;
						if (yMod != 0)
						{
							if (Math.abs(yMod) <= (opts.interval / 2))
							{
								node.yDrag -= yMod;
							}
							else
							{
								node.yDrag -= (opts.interval + yMod);
							}
							if (node.yDrag < node.yDragStart)
							{
								direction = "up";
							}
							else if (node.yDrag > node.yDragStart)
							{
								direction = "down";
							}
							else
							{
								direction = "hold";
							}
						}
					}
					if (opts.constraint != "horizontal")
					{
						xMod = node.xDrag % opts.interval;
						if (xMod != 0)
						{
							if (Math.abs(xMod) <= (opts.interval / 2))
							{
								node.xDrag -= xMod;
							}
							else
							{
								node.xDrag -= (opts.interval + xMod);
							}
							if (node.xDrag < node.xDragStart)
							{
								direction = "left";
							}
							else if (node.xDrag > node.xDragStart)
							{
								direction = "right";
							}
							else
							{
								direction = "hold";
							}
						}
					}
					if (direction)
					{
						node.animating = true;
						trans(node, function () { node.animating = false;},
							"-webkit-transform 300ms ease-out");
						node.style['-webkit-transform'] = 
							"translate3d(" + node.xDrag + "px," + 
							node.yDrag + "px,0)";
					}
				}
				else	//boundary checking
				{
					if (opts.constraint != "horizontal")
					{
						if (node.xDrag > 0)
						{
							node.xDrag = 0;
							boundaryReached = true;
							direction = "right";
						}
						else if (Math.abs(node.xDrag) > 
							(node.scrollWidth - node.parentNode.clientWidth))
						{
							node.xDrag = -(node.scrollWidth - node.parentNode.clientWidth);
							boundaryReached = true;
							direction = "left";
						}
					}
					if (opts.constraint != "vertical")
					{
						if (node.yDrag > 0)
						{
							node.yDrag = 0;
							boundaryReached = true;
							direction = "up";
						}
						else if (node.yDrag < 
							-(node.scrollHeight - node.parentNode.clientHeight))
						{
							node.yDrag = -(node.scrollHeight - node.parentNode.clientHeight);
							boundaryReached = true;
							direction = "down";
						}
					}
					if (boundaryReached)
					{
						node.animating = true;
						trans(node, function () {
							node.animating = false;
							if (opts.drag)
								opts.drag(direction, 0, 0, 0);
							if (opts.scroll)
								opts.scroll();
						}, "-webkit-transform 300ms ease-out");
						node.style['-webkit-transform'] = 
							"translate3d(" + node.xDrag + "px," + 
							node.yDrag + "px,0)";
					}
				}
				if (opts.up)
				{
					opts.up(direction);
				}
			}
		};
		dragCallback = function (direction, distance, dx, dy) {
			if (node.touchedDown)
			{
				node.dragging = true;
				if (opts.constraint != "vertical")
				{
					if (node.yDrag > -(node.scrollHeight - 
						 (2 * node.parentNode.clientHeight / 3)))
					{
						node.yDrag += dy;
					}
				}
				if (opts.constraint != "horizontal")
				{
					if (Math.abs(node.xDrag) < 
						(node.scrollWidth - 
						 (2 * node.parentNode.clientWidth / 3)))
					{
						node.xDrag += dx;
					}
				}
				node.style['-webkit-transform'] = 
					"translate3d(" + node.xDrag + "px," + 
					node.yDrag + "px,0)";
				if (opts.drag) 
					opts.drag(direction, distance, dx, dy);
				if (opts.scroll)
					opts.scroll();
			}
		};
		swipeCallback =  function (direction, distance, dx, dy, pixelsPerSecond)
		{
			var xMod = opts.interval ? node.xDrag % opts.interval : -dx;
			var yMod = opts.interval ? node.yDrag % opts.interval : pixelsPerSecond * .3;
			if (node.animating == false)
			{
				if (opts.constraint != "horizontal" && node.xDrag <= 0 && 
					Math.abs(node.xDrag) < (node.scrollWidth - 
					node.parentNode.clientWidth))
				{
					if (direction == "right")
					{
						node.xDrag -= xMod;
					}
					else if (direction == "left")
					{
						node.xDrag += (opts.interval ? -(opts.interval + xMod) : xMod);
					}
					else
					{
						return;
					}
				}
				if (opts.constraint != "vertical" && node.yDrag <= 0 
					&& node.yDrag > -(node.scrollHeight - 
					node.parentNode.clientHeight))
				{
					if (direction == "up")
					{
						node.yDrag -= yMod;
					}
					else if (direction == "down")
					{
						node.yDrag -= (opts.interval ? -(opts.interval + yMod) : -yMod);
					}
					else
					{
						return;
					}
				}
				trans(node, function() {
					node.animating = false;
					upCallback(direction);//legit?
				}, "-webkit-transform 300ms ease-out");
				node.animating = true;
				node.style['-webkit-transform'] = 
					"translate3d(" + node.xDrag + "px," + 
					node.yDrag + "px,0)";
			}
		};

		if (node.isDraggable)
			gesture.unlisten(node);
		node.isDraggable = true;
		gesture.listen("drag", node, dragCallback);
		gesture.listen("down", node, downCallback);
		gesture.listen("swipe", node, swipeCallback);
		gesture.listen("up", node, upCallback);
	}
};
function hideAlert(event) {
  element = document.getElementById('alertContainer');
  element.style.display = 'none';
}
;
Element.prototype.remove = function() {
  this.parentElement.removeChild(this);
}

NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
  for(var i = 0, len = this.length; i < len; i++) {
    if(this[i] && this[i].parentElement) {
      this[i].parentElement.removeChild(this[i]);
    } 
  }
}

String.prototype.trunc = String.prototype.trunc ||
  function(n){
    return this.length>n ? this.substr(0,n-1)+'&hellip;' : this;
};
var carousel = {
	view: document.createElement('div'),
	activeCircle: null,
	translateDistance: window.innerWidth,
	inactivityTimeout: null,
	animating: false,
	images: [],
	current_card: 0,
	total_cards:0,
	endButton: false,
	_build: function ()
	{
		addCss({
			"#carousel": function() {
				return "height: " + window.innerHeight + "px; width: " + window.innerWidth + "px";
			},
			".carousel-container": function() {
				return "width: " + (5 * window.innerWidth) + "px";
			},
			".carousel-image-container": function() {
				return "width: " + window.innerWidth + "px";
			}
		});
		var index, changeOrder, container = document.createElement('div'),
			orderIndication = document.createElement('div'),
			circlesContainer = document.createElement('div'),
			nextButton = document.createElement('div');
		carousel.view.id = "carousel";
		container.className = "carousel-container";
		orderIndication.className = "carousel-order-indicator";
		nextButton.id = "next-button";
		nextButton.className = "advnc-tutorial-btn";
		nextButton.innerHTML = "Next";
		gesture.listen("tap", nextButton, carousel.nextButtonCallback);
		orderIndication.appendChild(circlesContainer);
		orderIndication.appendChild(nextButton);
		carousel.view.appendChild(container);
		carousel.view.appendChild(orderIndication);
		drag.makeDraggable(container, {
			constraint: "vertical",
			interval: carousel.translateDistance, 
			up: carousel.orderIndicationCallback
		});
		document.body.appendChild(carousel.view);
		for (index = 1; index <= 6; ++index)
		{
			carousel.images.push(
				'http://assets.tagsurf.co/img/tutorial/tutorial_' + index + '.png');
		}
		if(isAndroid())
			carousel.images.push('http://assets.tagsurf.co/img/tutorial/tutorial_homescreen_android.png');
		else
			carousel.images.push('http://assets.tagsurf.co/img/tutorial/tutorial_homescreen_ios.png');
		carousel._populate();
		//gesture.listen("swipe", carousel.view.firstChild, carousel.swipeCallback);
		//gesture.listen("up", carousel.view.firstChild, carousel.upCallback);
		//Stop auto-advance after the first touch event
		gesture.listen("down", carousel.view.firstChild, carousel.downCallback);
	},
	orderIndicationCallback: function (direction) {
		 if (direction == "left" && 
			carousel.activeCircle.nextSibling)
		 {
			if ((carousel.current_card+1)==(carousel.total_cards-1)) {
				carousel.setEndButton();
				carousel.swipeCallback("left");
			}
			carousel.activeCircle.classList.remove('active-circle');
			carousel.activeCircle.nextSibling.classList.add('active-circle');
			carousel.activeCircle = carousel.activeCircle.nextSibling;
			carousel.current_card+=1;
		 }
		 if (direction == "right" &&
			carousel.activeCircle.previousSibling)
		 {
			carousel.activeCircle.classList.remove('active-circle');
			carousel.activeCircle.previousSibling.classList.add('active-circle');
			carousel.activeCircle = carousel.activeCircle.previousSibling;
			carousel.current_card-=1;
		 }
	},
	_populate: function ()
	{
		var index, container, image, circle;
		for (index in carousel.images)
		{
			container = document.createElement('div');
			container.className = "carousel-image-container";
			image = new Image();
			image.src = carousel.images[index];
			container.appendChild(image);
			circle = document.createElement('div');
			circle.className = "indicator-circle";
			if (index == 0)
			{
				circle.className +=  " active-circle";
				carousel.activeCircle = circle;
			}
			carousel.view.firstChild.appendChild(container);
			carousel.view.lastChild.firstChild.appendChild(circle);
			carousel.total_cards+=1;
		}
	},
	swipeCallback: function (direction, distance, dx, dy, pixelsPerSecond)
	{
		var container = carousel.view.firstChild, 
			xMod = container.xDrag % carousel.translateDistance;
		if (container.xDrag <= 0 && container.xDrag >
			-(container.scrollWidth - carousel.translateDistance) &&
			carousel.animating == false)
		{
			if (direction == "right")
			{
				container.xDrag -= xMod;
			}
			else if (direction == "left")
			{
				container.xDrag -= (carousel.translateDistance + xMod);
			}
			else
			{
				return;
			}
			carousel.orderIndicationCallback(direction);
			trans(container, function() {
				container.animating = false;
			}, "-webkit-transform 300ms ease-out");
			container.animating = true;
			container.style['-webkit-transform'] = 
				"translate3d(" + container.xDrag + "px,0,0)";
		}
	},
	nextButtonCallback: function(){
		if (carousel.endButton) {
			carousel.off();
			analytics.track('Completed Tutorial');
			document.forms[0].submit();
		} 
		else if ((carousel.current_card+1)==(carousel.total_cards-1)) {
			carousel.setEndButton();
			carousel.swipeCallback("left");
		}
		else {
			clearInterval(carousel.inactivityTimeout);
			carousel.inactivityTimeout = null;
			carousel.swipeCallback("left");
		};
	},
	setEndButton: function(){
		document.getElementById("next-button").innerHTML = "Got it!";
		carousel.endButton = true;
	},
	// upCallback: function ()
	// {
	// 	carousel.inactivityTimeout = setInterval(function(){
	// 		carousel.swipeCallback("left");
	// 	},5000);
	// },
	downCallback: function ()
	{
		clearInterval(carousel.inactivityTimeout);
		carousel.inactivityTimeout = null;
	},
	on: function ()
	{
		carousel.view.style.visibility = "visible";
		carousel.view.style.opacity = 1;
		carousel.inactivityTimeout = setInterval(function(){
			carousel.swipeCallback("left");
		},5000);
	},
	off: function ()
	{
		carousel.view.style.opacity = 0;
		trans(carousel.view, function(){
			carousel.view.style.visibility = "hidden";
		});
		clearInterval(carousel.inactivityTimeout);
	},
};
carousel._build();

// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//







carousel.on();
fadeInBody();
