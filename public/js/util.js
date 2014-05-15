var hasClass = function (node, className) 
{
  return node.className && new RegExp("(^|\\s)" + className + "(\\s|$)").test(node.className);
};
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
var slideNavMenu = function() {
  toggleClass.apply(document.getElementById("slider_label"),
    ["slid"]);
  toggleClass.apply(document.getElementById("slide_down_menu"),
    ["opened_menu"]);
  modal.backToggle(slideNavMenu, true);
};
var populateNavbar = function () {
  var nav = document.getElementById("nav");
  var navbar = document.createElement("div");
  navbar.id = "navbar";
  var menu_slider = document.createElement("div");
  menu_slider.id = "menu_slider";

  // commenting out -- use similar for tag adding
  /*
  var history_icons = {
    fill: 'img/history_icon_fill.png',
    blue: 'img/history_icon_blue.png'
  };
  */

  var gallery = whichGallery();
  var tag = gallery ? document.location.hash.slice(1) : null;
  var navbar_content = [
    "<div id='favorites-btn'>",
      "<a onclick='starCallback();'><img id='favorites-icon' src='img/favorites_icon_blue.png'></a>",
    "</div>",
    "<div id='add-btn'><a>",
      "<img id='add_icon' src='img/add_icon_blue.png'>",
    "</a></div>",
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
  nav.appendChild(navbar);
  nav.appendChild(menu_slider);

  var main_logo = document.getElementById("main-logo");
  var slider_icon = document.getElementById("slider-icon");

  // commenting out for now -- use similar logic for tag adder
  /*
  var hist_logo = document.getElementById("history-logo");
  var history_icon = document.getElementById("history_icon");
  var hist_state = "blue";
  document.getElementById("history-btn").onclick = function() {
    var isOn = hist_state == "blue";
    hist_state = isOn ? "fill" : "blue";
    history_icon.src = history_icons[hist_state];
    main_logo.style.display = isOn ? "none" : "inline";
    hist_logo.style.display = isOn ? "inline" : "none";
    !gallery && toggleClass.call(slider_icon, "vtop");
    slideGallery();
  };
  */

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
  maxCardHeight = window.innerHeight - 220;
};
var setResizeCb = function(cb) {
  resizeCb = cb;
};
setMaxCardHeight();
window.onresize = function() {
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
