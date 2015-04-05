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
          "&nbsp;&nbsp;&nbsp;SURF",
        "</div></a></li>",
        "<li><a href='/bumps'><div>",
          "<img class='menu-icon' src='http://assets.tagsurf.co/img/bumps_icon_gray.png'></img>",
          "<img class='menu-icon' src='http://assets.tagsurf.co/img/bumps_icon_white.png'></img>",
          "&nbsp;&nbsp;&nbsp;BUMPS",
        "</div><div id='slider-badge' class='badge-icon small-badge inline hidden'></div></a></li>",
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
          "&nbsp;&nbsp;&nbsp;SURF",
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
