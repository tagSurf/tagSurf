Object.prototype.hasClass = function (className) 
{
  return this.className && new RegExp("(^|\\s)" + className + "(\\s|$)").test(this.className);
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
var populateNavbar = function () {
  var navbar = document.getElementById('navbar');
  var menu_slider = document.getElementById('menu_slider');
  var navbar_content = [
    "<div class='history-btn'>",
      "<img src='img/history_icon_blue.png'>",
    "</div>",
    "<div class='navbar-center logo'>",
      "<label for='slider_box' id='navbar_label' onclick='toggleClass.apply(this,[\"slid\"]);toggleClass.apply(document.getElementById(\"slide_down_menu\"),[\"opened_menu\"]);'>",
	"<div>",
	  "<img id='tagsurf-logo' src='img/logo.png'></img>",
	  "<img id='slider-icon' src='img/down_arrow.png'></img>",
	"</div>",
      "</label>",
    "</div>",
    "<div class='favorites-btn'>",
      "<img src='img/star_icon.png'></img>",
    "</div>",
  ];
  var menu_slider_content = [
    "<input type='checkbox' name='slider_box' id='slider_box' style='display:none'>",
    "<div id='slide_down_menu'>",
      "<ul>",
	"<li>",
	  "<span><img class='menu_icon' src='img/trending_icon_gray.png'></img>&nbsp;&nbsp;&nbsp;TRENDING</span>",
	"</li>",
	"<li>",
	  "<span><img class='menu_icon' src='img/star_icon_gray.png'></img>&nbsp;&nbsp;&nbsp;FAVORITES</span>",
	"</li>",
	"<li>",
	  "<span><img class='menu_icon' src='img/add_icon_gray.png'></img>&nbsp;&nbsp;&nbsp;SUBMISSIONS</span>",
	"</li>",
	"<li>",
	  "<span><img class='menu_icon' src='img/options_icon.png'></img>&nbsp;&nbsp;&nbsp;OPTIONS</span>",
	"</li>",
      "</ul>",
    "</div>",
  ];
  navbar.innerHTML = navbar_content.join('\n');
  menu_slider.innerHTML = menu_slider_content.join('\n');
};
