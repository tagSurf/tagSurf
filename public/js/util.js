//These variables are reinitialized on every pageload
var authorizedSession = null;
var currentUser = {
  id : null,
  email : null,
  admin : false
};
var returnTrue = function() { return true; };
var DEBUG = false;
// Set DEBUG = true in non-production environments
if ((document.location.hostname.indexOf("localhost") != -1) 
  || (document.location.hostname.indexOf("staging.tagsurf.co") != -1)
  || (document.location.hostname.indexOf("192.168") != -1))
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
var isAuthorized = function () {
  if(authorizedSession == null) {
    xhr('/api/users', "GET", function(result) {
      if (result.user != "not found") {
        authorizedSession = true;
        currentUser.id = result.user.id;
        currentUser.email = result.user.email;
        currentUser.admin = result.user.admin;
      }
      else
        authorizedSession = false;
    }, function(result) {
      if (result.user == "not found") 
        authorizedSession = false;
    }, false);
    return authorizedSession;
  }
  else 
  	return authorizedSession;
};

// autocomplete stuff
var current_tag, tinput, inputContainer, slideContainer,
  scrollContainer, closeAutoComplete = function(tagName, noback) {
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
    location.hash = tinput.value = tagName || current_tag;
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
  if (noback != true && !modal.zoom.zoomed && !modal.modal.on)
    navMenuSlid ? modal.halfOn(slideNavMenu) : modal.backOff();
};
var add_icon, add_state = "blue", add_icons = {
  fill: '/img/add_icon_fill.png',
  blue: '/img/add_icon_blue.png'
};
var addBarSlid = false;
var slideAddBar = function(noback) {
  if (!isAuthorized()) {
    modal.promptIn(featureBlockContents);
    return;
  }
  if (autocomplete.viewing.autocomplete) {
    autocomplete.retract("autocomplete");
    closeAutoComplete(null, true);
  }
  autocomplete.viewing.add_tag_autocomplete
    && autocomplete.retract("add_tag_autocomplete");
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

// tagging stuff
var newtags = [];
var pushTags = function() {
  while (newtags.length)
    xhr("/api/media/" + currentMedia.id + "/tags/" + newtags.shift(), "POST", null, null);
};
var rmTag = function(tname) {
  // remove from sensible new tags array
  var i = newtags.indexOf(tname);
  if (i != -1)
    newtags = newtags.slice(0, i).concat(newtags.slice(i+1));

  // remove from unwieldy tags_v2 embedded object array
  var tIndex = -1;
  var tobjs = currentMedia.tags_v2;
  for (var i = 0; i < tobjs.length; i++) {
    if (Object.keys(tobjs[i])[0] == tname) {
      tIndex = i;
      break;
    }
  }
  if (tIndex != -1)
    tobjs = tobjs.slice(0, tIndex).concat(tobjs.slice(tIndex + 1));
};

var shareVotes = [], saveVotesLogin = function () {
  sessionStorage.setItem("lastPath",
    current_tag + "|" + currentMedia.id);
  sessionStorage.setItem("shareVotes",
    JSON.stringify(shareVotes));
  window.location = "/users/sign_in";
};

var popTrending; // defined in feed
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
  var navbar_content = [
    "<div id='favorites-btn'>",
      "<a onclick='starCallback();'><img id='favorites-icon' src='/img/favorites_icon_blue.png'></a>",
    "</div>",
    "<div id='add-btn'>",
      "<a onclick='slideAddBar();'><img id='add-icon' src='/img/add_icon_blue.png'></a>",
    "</div>",
    "<div class='navbar-center'>",
      "<label id='slider-label' for='slider-box' ontouchmove='return false;' onclick='slideNavMenu();'>",
        "<span id='main-logo'>",
          gallery ? (gallery == "tag"
            ? ("<span class='pointer'>#" + tag + "</span>")
            : ("<img class='gallery-icon' src='/img/" + gallery + "_icon_gray.png'><span id='gallery-name' class='pointer'>" + gallery.toUpperCase() + "</span>"))
          : "<img id='tagsurf-logo' src='/img/logo_big.png'></img>",
        "</span><span id='history-logo'>HISTORY</span>",
        "<img id='slider-icon' " + (gallery ? "" : "class='vtop' ") + "src='/img/down_arrow_nav.png'></img>",
      "</label>",
    "</div>",
  ], 
  full_slider_content = [
    "<input type='checkbox' name='slider-box' id='slider-box' style='display:none'>",
    "<div id='slide-down-menu' class='pointer'>",
      "<ul>",
      	"<li><a href='/feed'><div>",
      	  "<img class='menu-icon' src='/img/trending_icon_gray.png'></img>&nbsp;&nbsp;&nbsp;TRENDING",
      	"</div></a></li>",
      	"<li><a href='/favorites'><div>",
      	  "<img class='menu-icon' src='/img/favorites_icon_gray.png'></img>&nbsp;&nbsp;&nbsp;FAVORITES",
        "</div></a></li>",
        "<li><a href='/history'><div>",
      	  "<img class='menu-icon' src='/img/history_icon_gray.png'></img>&nbsp;&nbsp;&nbsp;HISTORY",
        "</div></a></li>",
        "<li><a id='options-btn'><div>",
          "<img class='menu-icon' src='/img/options_icon.png'></img>&nbsp;&nbsp;&nbsp;OPTIONS",
        "</div></a></li>",
        "<li><a id='logout'><div>",
          "<img class='menu-icon' src='/img/logout_icon_gray.png'></img>&nbsp;&nbsp;&nbsp;LOGOUT",
        "</div></a></li>",
      "</ul>",
    "</div>",
  ],
  reduced_slider_content = [
    "<input type='checkbox' name='slider-box' id='slider-box' style='display:none'>",
    "<div id='slide-down-menu' class='pointer'>",
      "<ul>",
      	"<li><a onclick='popTrending();'><div>",
      	  "<img class='menu-icon' src='/img/trending_icon_gray.png'></img>&nbsp;&nbsp;&nbsp;TRENDING",
      	"</div></a></li>",
        "<li><a id='options-btn'><div>",
          "<img class='menu-icon' src='/img/options_icon.png'></img>&nbsp;&nbsp;&nbsp;OPTIONS",
        "</div></a></li>",
        "<li><a id='login'><div>",
          "<img class='menu-icon inverted' src='/img/logout_icon_gray.png'></img>&nbsp;&nbsp;&nbsp;LOGIN",
        "</div></a></li>",
      "</ul>",
    "</div>",
  ],
  menu_slider_content = isAuthorized() ? full_slider_content : reduced_slider_content;
  navbar.innerHTML = navbar_content.join('\n');
  menu_slider.innerHTML = menu_slider_content.join('\n');
  tag_adder.innerHTML = "<input value='#newtag' spellcheck='false' autocomplete='off' autocapitalize='off' autocorrect='off'><img src='/img/add_tag_button.png'><div id='add_tag_autocomplete' class='autocomplete hider'></div>";
  nav.appendChild(navbar);
  nav.appendChild(menu_slider);
  nav.appendChild(tag_adder);

  tag_adder.firstChild.nextSibling.onclick = function() {
    var newtag = tag_adder.firstChild.value.slice(1);
    if (!newtag || newtag == "newtag") return;
    newtags.push(newtag);
    slideAddBar();
    addCallback && addCallback(newtag);
  };
  addCss({
    "#add_tag_autocomplete": function() {
      return "width: " + (tag_adder.firstChild.clientWidth - 10) + "px";
    }
  });
  autocomplete.register("add_tag_autocomplete", tag_adder.firstChild, {
    enterCb: function() {
      autocomplete.tapTag(tag_adder.firstChild.value.slice(1),
        "add_tag_autocomplete");
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
    document.getElementById("login").onclick = saveVotesLogin;
  }
  document.getElementById("options-btn").onclick = function() {
    var n = document.createElement("div");
    n.className = "center-label";
    var msg = document.createElement("div");
    msg.innerHTML = "Nothing to see here... yet";
    msg.className = "options-msg";
    var img = document.createElement("img");
    img.src = "/img/throbber.gif";
    var TOS = document.createElement("div");
    TOS.innerHTML = "<a class='blue bold big-lnk' id='terms-lnk'>Terms of Use</a> | <a class='blue bold big-lnk' id='privacy-lnk'>Privacy Policy</a>";
    TOS.className = "tos-line";
    var options_cb = function(){
      //this is a hack until we find a better way to determine if share should be turned back on
      if (document.location.href.indexOf('feed') != -1)
        share.on();
      modal.modalOut();
    };
    n.appendChild(msg);
    n.appendChild(img);
    n.appendChild(TOS);
    slideNavMenu();
    share.off();
    modal.modalIn(n, options_cb);
    initDocLinks();
  };
};
var setFavIcon = function(filled) {
  document.getElementById("favorites-icon").src =
    "/img/favorites_icon_" + (filled ? "fill" : "blue") + ".png";
};
var featureBlockContents, buildFeatureBlockerContents = function() {
	var contents = document.createElement('div'),
		closeContainer = document.createElement('div'),
		close = document.createElement('img'),
		title = document.createElement('p'),
		message = document.createElement('p'),
		link = document.createElement('div');
	closeContainer.className = "close-button-container pointer";
	close.className = "x-close-button";
	close.src = "/img/Close.png";
	gesture.listen('down', closeContainer, modal.callPrompt);
	closeContainer.appendChild(close);
	contents.appendChild(closeContainer);
	title.className = "prompt-title";
	title.innerHTML = "Oops";
	contents.appendChild(title);
	message.className = "prompt-message";
	message.innerHTML = "You need to login to do that...";
	contents.appendChild(message);
	link.className = "prompt-login-button";
	link.innerHTML = "login";
	gesture.listen("down", link, function () {
		link.classList.add('ts-active-button');
	});
	gesture.listen("tap", link, saveVotesLogin);
	gesture.listen("up", link, function () {
		link.classList.remove('ts-active-button');
	});
	contents.appendChild(link);
	return contents;
};
var starCallback, setStarCallback = function(cb) {
  starCallback = cb;
};
var addCallback, setAddCallback = function(cb) {
  addCallback = cb;
};
var currentMedia, setCurrentMedia = function(d, shareCb) {
  currentMedia = d;
  if (d && d.type == "content")
    share.on(d, shareCb);
  else {
    share.off();
    if (addBarSlid)
      slideAddBar();
  }
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
var lastHeight = window.innerHeight,
  lastWidth = window.innerWidth;
window.onresize = function() {
  if (lastWidth == window.innerWidth
    && lastHeight == window.innerHeight)
    return;
  lastWidth = window.innerWidth;
  lastHeight = window.innerHeight;
  setMaxCardHeight();
  addedCss.forEach(addCss);
  resizeCb && resizeCb();
};

var xhr = function(path, action, cb, eb, async) {
  var _xhr = new XMLHttpRequest();
  if(DEBUG) 
    console.log("XHR Request. Path: " + path + " action: " + (action || "GET"));
  if (typeof async === "undefined")
    async = true;
  _xhr.open(action || "GET", path, async);
  _xhr.onreadystatechange = function() {
    if (_xhr.readyState == 4) {
      var resp = _xhr.responseText.charAt(0) == "<" ? 
      { "errors": _xhr.responseText } : JSON.parse(_xhr.responseText);
      if (resp.errors || _xhr.status != 200) {
        if (eb) 
          eb(resp);
        if (!(_xhr.status == 404) && DEBUG) {
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
  _xhr.send();
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
