//These variables are reinitialized on every pageload
var authorizedSession = null,
    cardIndex = 0,
    currentUser = {
      id : null,
      email : null,
      slug : null,
      vote_btns : true,
      admin : false
    },
    returnTrue = function() { return true; },
    DEBUG = false;
// Set DEBUG = true in non-production environments
if ((document.location.hostname.indexOf("localhost") != -1) 
  || (document.location.hostname.indexOf("staging.tagsurf.co") != -1)
  || (document.location.hostname.indexOf("192.168") != -1)
  || (document.location.hostname.indexOf("172.20") != -1))
  DEBUG = true;
var hasClass = function (node, className) 
{
  return node.className && new RegExp("(^|\\s)" + className + "(\\s|$)").test(node.className);
};
Number.prototype.mod = function(n) {
  return ((this%n)+n)%n;
}
String.prototype.trunc = String.prototype.trunc ||
  function(n){
    return this.length>n ? this.substr(0,n-1)+'&hellip;' : this;
};
var toggleClass = function (className, onOrOff)
{
  var classIsOn = hasClass(this, className);
  if (classIsOn && onOrOff != "on")
    this.classList.remove(className);
  else if (!classIsOn && onOrOff != "off")
    this.classList.add(className);
};
var galleries = ["history", "favorites", "submissions", "tag"];
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
  if (document.location.href.indexOf('share') == -1) {
    authorizedSession = true;
    if(!isDesktop())
            currentUser.vote_btns = false;
    setTimeout(function () { getUser(); }, 3000);
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
          currentUser.slug = result.user.slug;
          currentUser.admin = result.user.admin;
          currentUser.safeSurf = result.user.safe_mode;
        } 
      }, function(result) {
        if (result.user == "not found" && DEBUG) 
          console.log("Error: User not found");
      });
};

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
    var cardbox = document.getElementById("slider"),
        current_stack_depth = cardbox.childNodes.length;
      for (var i = 0; i < current_stack_depth; i++)
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
    link.innerHTML = "ok";
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
        dragCallback("left", -3, -3);
        swipeSlider("left");
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
        dragCallback("right", 3, 3);
        swipeSlider("right");
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
    if (d && d.type == "content") {
      share.on(d, shareCb);
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
        if (!(_xhr.status == 404) && !(_xhr.status == 500) && DEBUG) {
          alert("XHR error! Request failed. Path: " + path + " Errors: " + resp.errors 
            + " Response: " + _xhr.responseText + " Status: " + _xhr.status);
          console.log("XHR error! Path:" + path + " Error: "
          + resp.errors + " Response: " + _xhr.responseText + " Status: " + _xhr.status);
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
  isStockAndroid: (__ua.indexOf("Mozilla/5.0") != -1)
    && (__ua.indexOf("Android ") != -1)
    && (__ua.indexOf("AppleWebKit") != -1)
    && (__ua.indexOf("Chrome") == -1)
};
var isIos = function() {
  return _ua.isIos;
};
var isUIWebView = function(){
  return _ua.isUIWebView;
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

window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		function( callback ){
			window.setTimeout(callback, 1000 / 60);
		};
})();
