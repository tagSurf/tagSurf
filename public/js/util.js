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

// autocomplete stuff
var aclist, current_tag, tinput, inputContainer, slideContainer, scrollContainer
  acviewing = false, closeAutoComplete = function(tagName, noback) {
    if (noback) {
      slideContainer.className = "";
      scrollContainer.insertBefore(inputContainer,
        scrollContainer.firstChild);
    } else modal.backOff(function() {
      slideContainer.className = "";
      scrollContainer.insertBefore(inputContainer,
        scrollContainer.firstChild);
    });
    acviewing = false;
    tinput.active = false;
    aclist.className = "";
    location.hash = tinput.value = tagName || current_tag;
    tinput.blur();
  };

var navMenuSlid = false;
var slideNavMenu = function(noback) {
  acviewing && closeAutoComplete(null, true);
  addBarSlid && slideAddBar(true);
  navMenuSlid = !navMenuSlid;
  toggleClass.apply(document.getElementById("slider_label"),
    ["slid", navMenuSlid ? "on" : "off"]);
  toggleClass.apply(document.getElementById("slide_down_menu"),
    ["opened_menu", navMenuSlid ? "on" : "off"]);
  if (noback != true && !modal.zoom.zoomed && !modal.modal.on)
    navMenuSlid ? modal.halfOn(slideNavMenu) : modal.backOff();
};
var add_icon, add_state = "blue", add_icons = {
  fill: 'img/add_icon_fill.png',
  blue: 'img/add_icon_blue.png'
};
var addBarSlid = false;
var slideAddBar = function(noback) {
  acviewing && closeAutoComplete(null, true);
  navMenuSlid && slideNavMenu(true);
  addBarSlid = !addBarSlid;
  if (addBarSlid && !currentMedia) return;
  add_state = addBarSlid ? "fill" : "blue";
  add_icon.src = add_icons[add_state];
  toggleClass.apply(document.getElementById("tag_adder"),
    ["opened_menu", addBarSlid ? "on" : "off"]);
  document.getElementById("tag_adder").firstChild.value = "#newtag";
  if (noback != true && !modal.zoom.zoomed && !modal.modal.on)
    addBarSlid ? modal.halfOn(slideAddBar) : modal.backOff();
};

// tagging stuff
var newtags = [];
var pushTags = function() {
  while (newtags.length)
    xhr("/api/media/" + currentMedia.id + "/tags/" + newtags.shift(), "POST");
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

var populateNavbar = function () {
  var nav = document.getElementById("nav");
  var navbar = document.createElement("div");
  navbar.id = "navbar";
  var menu_slider = document.createElement("div");
  menu_slider.id = "menu_slider";
  var tag_adder = document.createElement("div");
  tag_adder.id = "tag_adder";

  var gallery = whichGallery();
  var tag = gallery ? document.location.hash.slice(1) : null;
  var navbar_content = [
    "<div id='favorites-btn'>",
      "<a onclick='starCallback();'><img id='favorites-icon' src='img/favorites_icon_blue.png'></a>",
    "</div>",
    "<div id='add-btn'>",
      "<a onclick='slideAddBar();'><img id='add-icon' src='img/add_icon_blue.png'></a>",
    "</div>",
    "<div class='navbar-center'>",
      "<label id='slider_label' for='slider_box' onclick='slideNavMenu();'>",
        "<span id='main-logo'>",
          gallery ? (gallery == "tag"
            ? ("<span class='pointer'>#" + tag + "</span>")
            : ("<img class='gallery_icon' src='img/" + gallery + "_icon_gray.png'><span id='gallery_name' class='pointer'>" + gallery.toUpperCase() + "</span>"))
          : "<img id='tagsurf-logo' src='img/logo_big.png'></img>",
        "</span><span id='history-logo'>HISTORY</span>",
        "<img id='slider-icon' " + (gallery ? "" : "class='vtop' ") + "src='img/down_arrow.png'></img>",
      "</label>",
    "</div>",
  ];
  var menu_slider_content = [
    "<input type='checkbox' name='slider_box' id='slider_box' style='display:none'>",
    "<div id='slide_down_menu' class='pointer'>",
      "<ul>",
      	"<li><a href='/feed'><div>",
      	  "<img class='menu_icon' src='img/trending_icon_gray.png'></img>&nbsp;&nbsp;&nbsp;TRENDING",
      	"</div></a></li>",
      	"<li><a href='/favorites'><div>",
      	  "<img class='menu_icon' src='img/favorites_icon_gray.png'></img>&nbsp;&nbsp;&nbsp;FAVORITES",
        "</div></a></li>",
        "<li><a href='/history'><div>",
      	  "<img class='menu_icon' src='img/history_icon_gray.png'></img>&nbsp;&nbsp;&nbsp;HISTORY",
        "</div></a></li>",
        "<li><a id='options-btn'><div>",
          "<img class='menu_icon' src='img/options_icon.png'></img>&nbsp;&nbsp;&nbsp;OPTIONS",
        "</div></a></li>",
        "<li><a id='logout'><div>",
          "<img class='menu_icon' src='img/logout_icon_gray.png'></img>&nbsp;&nbsp;&nbsp;LOGOUT",
        "</div></a></li>",
      "</ul>",
    "</div>",
  ];
  navbar.innerHTML = navbar_content.join('\n');
  menu_slider.innerHTML = menu_slider_content.join('\n');
  tag_adder.innerHTML = "<input value='#newtag' spellcheck='false' autocomplete='off' autocapitalize='off' autocorrect='off'><img src='img/add_tag_button.png'>";
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
  tag_adder.firstChild.onclick = function() {
    tag_adder.firstChild.value = "#";
    return true;
  };
  tag_adder.firstChild.onkeyup = function(e) {
    e = e || window.event;
    var code = e.keyCode || e.which;
    if (code == 13 || code == 3) {
      tag_adder.firstChild.blur();
      tag_adder.firstChild.nextSibling.onclick();
    }
    if (tag_adder.firstChild.value.length == 0)
    {
	tag_adder.firstChild.value = '#';
    }
    return true;
  };
  add_icon = document.getElementById("add-icon");
  document.getElementById("options-btn").onclick = function() {
    var n = document.createElement("div");
    n.className = "center-label";
    var msg = document.createElement("div");
    msg.innerHTML = "Nothing to see here... yet";
    var img = document.createElement("img");
    img.src = "/img/throbber.gif";
    n.appendChild(msg);
    n.appendChild(img);
    slideNavMenu();
    modal.modalIn(n, modal.modalOut);
  };
  document.getElementById("logout").onclick = function() {
    window.location = "/users/sign_out";
  };
};
var setFavIcon = function(filled) {
  document.getElementById("favorites-icon").src =
    "img/favorites_icon_" + (filled ? "fill" : "blue") + ".png";
};
var starCallback, setStarCallback = function(cb) {
  starCallback = cb;
};
var addCallback, setAddCallback = function(cb) {
  addCallback = cb;
};
var currentMedia, setCurrentMedia = function(d) {
  currentMedia = d;
  if (!d && addBarSlid) slideAddBar();
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
  if (lastWidth == window.innerWidth)
    return;
  lastWidth = window.innerWidth;
  setMaxCardHeight();
  addedCss.forEach(addCss);
  resizeCb && resizeCb();
};
var returnTrue = function() { return true; };
var DEBUG = false;
var xhr = function(path, action, cb, eb) {
  var _xhr = new XMLHttpRequest();
  _xhr.open(action || "GET", path, true);
  _xhr.onreadystatechange = function() {
    if (_xhr.readyState == 4) {
      var resp = _xhr.responseText.charAt(0) == "<" ? {
        "errors": _xhr.responseText
      } : JSON.parse(_xhr.responseText);
      if (resp.errors || _xhr.status != 200) {
        console.log("XHR error! Path:" + path + " Error: "
          + resp.errors + " Status: " + _xhr.status);
        if (eb) eb(resp);
        if (DEBUG) alert("Request failed. Errors: " + resp.errors);
      } else
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
var isIphone = function() {
  return navigator.userAgent.indexOf("iPhone") != -1;
};
var isMobile = function() {
  return navigator.userAgent.toLowerCase().indexOf("mobile") != -1;
};
var isAndroid = function() {
  return isMobile() && !isIphone();
};
var trans = function(node, cb, transition, transform) {
  var wrapper = function () {
    if (transition) 
    {
      if (transition.split(" ").length == 1)
      {
        node.classList.remove(transition);
      }
      else
      {
        node.style['-webkit-transition'] = "";
      }
    }
    if (transform) node.style['-webkit-transform'] = "";
    node.removeEventListener("webkitTransitionEnd", wrapper, false);
    cb && cb();
  };
  node.addEventListener("webkitTransitionEnd", wrapper, false);
  if (transition) 
  {
    if (transition.split(" ").length == 1)
    {
      node.classList.add(transition);
    }
    else
    {
      node.style['-webkit-transition'] = transition;	
    }
  }
  if (transform) node.style['-webkit-transform'] = transform;
};
