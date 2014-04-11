Object.prototype.hasClass = function (className) 
{
  return this.className && new RegExp("(^|\\s)" + className + "(\\s|$)").test(this.className);
};
String.prototype.trunc = String.prototype.trunc ||
  function(n){
    return this.length>n ? this.substr(0,n-1)+'&hellip;' : this;
};
var toggleClass = function (className)
{
  if (this.hasClass(className))
  {
    this.classList.remove(className);
    return;
  }
  this.classList.add(className);
};
var galleries = ["history", "favorites", "submissions", "tag"];
var whichGallery = function() {
  for (var i = 0; i < galleries.length; i++)
    if (document.location.pathname.indexOf(galleries[i]) != -1)
      return galleries[i];
  return null;
};
var populateNavbar = function () {
  var nav = document.getElementById("nav");
  var navbar = document.createElement("div");
  navbar.id = "navbar";
  var menu_slider = document.createElement("div");
  menu_slider.id = "menu_slider";
  var gallery = whichGallery();
  var tag = gallery ? document.location.hash.slice(1) : null;
  var navbar_content = [
    "<div class='favorites-btn'>",
      "<a href='/favorites'><img src='img/favorites_icon_" + (gallery == "favorites" ? "fill" : "blue") + ".png'></a>",
    "</div>",
    "<div class='history-btn'>",
      "<a href='/history'><img src='img/history_icon_" + (gallery == "history" ? "fill" : "blue") + ".png'></a>",
    "</div>",
    "<div class='navbar-center'>",
      "<label for='slider_box' onclick='toggleClass.apply(this,[\"slid\"]);toggleClass.apply(document.getElementById(\"slide_down_menu\"),[\"opened_menu\"]);'>",
        gallery ? (gallery == "tag"
          ? ("<span class='pointer'>#" + tag + "</span>")
          : ("<img class='gallery_icon' src='img/" + gallery + "_icon_gray.png'><span class='pointer'>" + gallery.toUpperCase() + "</span>"))
        : "<img id='tagsurf-logo' src='img/logo.png'></img>",
        "<img id='slider-icon' " + (gallery ? "" : "class='vtop' ") + "src='img/down_arrow.png'></img>",
      "</label>",
    "</div>",
  ];
  var menu_slider_content = [
    "<input type='checkbox' name='slider_box' id='slider_box' style='display:none'>",
    "<div id='slide_down_menu' class='pointer'>",
      "<ul>",
      	"<li><div>",
      	  "<a href='/trending'><img class='menu_icon' src='img/trending_icon_gray.png'></img>&nbsp;&nbsp;&nbsp;TRENDING</a>",
      	"</div></li>",
      	"<li><div>",
      	  "<a href='/favorites'><img class='menu_icon' src='img/favorites_icon_gray.png'></img>&nbsp;&nbsp;&nbsp;FAVORITES</a>",
        "</div></li>",
        "<li><div>",
      	  "<a href='/submissions'><img class='menu_icon' src='img/submissions_icon_gray.png'></img>&nbsp;&nbsp;&nbsp;SUBMISSIONS</a>",
        "</div></li>",
        "<li><div>",
          "<a href='/options'><img class='menu_icon' src='img/options_icon.png'></img>&nbsp;&nbsp;&nbsp;OPTIONS</a>",
        "</div></li>",
        "<li><div>",
          "<a id='logout'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;LOGOUT</a>",
        "</div></li>",
      "</ul>",
    "</div>",
  ];
  navbar.innerHTML = navbar_content.join('\n');
  menu_slider.innerHTML = menu_slider_content.join('\n');
  nav.appendChild(navbar);
  nav.appendChild(menu_slider);
  document.getElementById("logout").onclick = function() {
    window.location = "/users/sign_out";
  };
};
var addCss = function(css) {
    var n = document.createElement("style");
    n.type = "text/css";
    if (n.styleSheet)
        n.styleSheet.cssText = css;
    else
        n.appendChild(document.createTextNode(css));
    document.getElementsByTagName("head")[0].appendChild(n);
};