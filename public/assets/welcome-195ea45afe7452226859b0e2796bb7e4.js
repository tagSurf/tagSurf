function hideAlert(){element=document.getElementById("alertContainer"),element.style.display="none"}var authorizedSession=null,cardIndex=0,currentUser={id:null,email:null,slug:null,vote_btns:!0,admin:!1},returnTrue=function(){return!0},hasSwiped=!1,hasKeySwiped=!1,hasSwitchedTags=!1,DEBUG=!1;(-1!=document.location.hostname.indexOf("localhost")||-1!=document.location.hostname.indexOf("staging.tagsurf.co")||-1!=document.location.hostname.indexOf("192.168")||-1!=document.location.hostname.indexOf("172.20"))&&(DEBUG=!0);var hasClass=function(e,t){return e.className&&new RegExp("(^|\\s)"+t+"(\\s|$)").test(e.className)};Number.prototype.mod=function(e){return(this%e+e)%e},String.prototype.trunc=String.prototype.trunc||function(e){return this.length>e?this.substr(0,e-1)+"&hellip;":this};var toggleClass=function(e,t){var n=hasClass(this,e);n&&"on"!=t?this.classList.remove(e):n||"off"==t||this.classList.add(e)},galleries=["history","favorites","submissions","tag"],whichGallery=function(){for(var e=0;e<galleries.length;e++)if(-1!=document.location.pathname.indexOf(galleries[e]))return galleries[e];return null},isGallery=function(){var e=whichGallery();return null==e?!1:!0},isAuthorized=function(){return null!=authorizedSession?authorizedSession:(-1==document.location.href.indexOf("share")?(authorizedSession=!0,isDesktop()||(currentUser.vote_btns=!1),setTimeout(function(){getUser()},3e3)):authorizedSession=!1,authorizedSession)},getUser=function(){authorizedSession&&!currentUser.id&&xhr("/api/users","GET",function(e){"not found"!=e.user&&(currentUser.id=e.user.id,currentUser.email=e.user.email,currentUser.slug=e.user.slug,currentUser.admin=e.user.admin,currentUser.safeSurf=e.user.safe_mode)},function(e){"not found"==e.user&&DEBUG&&console.log("Error: User not found")})},current_tag,current_deck,cardCbs,tinput,inputContainer,slideContainer,scrollContainer,closeAutoComplete=function(e){e?(slideContainer.className="",scrollContainer.insertBefore(inputContainer,scrollContainer.firstChild)):modal.backOff(function(){slideContainer.className="",scrollContainer.insertBefore(inputContainer,scrollContainer.firstChild)}),tinput.active=!1},clearStack=function(){var e=current_deck.getEndCard();e&&e.unshow();for(var t=slideContainer.childNodes.length,n=0;t>n;n++)current_deck.cards[n].showing&&current_deck.cards[n].unshow()},newtags=[],pushTags=function(){if(newtags.length>0){for(;newtags.length;)xhr("/api/media/"+currentMedia.id+"/tags/"+newtags.shift(),"POST",null,null);autocomplete.populate()}},popTrending,fadeInBody=function(){addCss({"html, body":function(){return"width: "+window.innerWidth+"px; height: "+window.innerHeight+"px; opacity: 1;"}})},shareVotes=[],stashVotesAndLogin=function(){sessionStorage.setItem("lastPath",current_tag+"~"+currentMedia.id),sessionStorage.setItem("shareVotes",JSON.stringify(shareVotes)),window.location="/users/sign_in"},messageBox=function(e,t,n,i,a){var s=document.createElement("div"),r=document.createElement("div"),o=document.createElement("img"),l=document.createElement("p"),c=document.createElement("p"),d=document.createElement("div");a="undefined"==typeof a?!1:a,r.className="close-button-container pointer",o.className="x-close-button",o.src="http://assets.tagsurf.co/img/Close.png",gesture.listen("down",r,modal.callPrompt),r.appendChild(o),s.appendChild(r),l.className="prompt-title",l.innerHTML=e?e:"Oops",s.appendChild(l),c.className="prompt-message",c.innerHTML=t?t:"Something went wrong",s.appendChild(c),d.className="msgbox-btn","undefined"==typeof n?(d.innerHTML="OK",i?gesture.listen("tap",d,i):gesture.listen("tap",d,modal.callPrompt)):(d.innerHTML=n,"login"!=n||i?i?gesture.listen("tap",d,i):gesture.listen("tap",d,modal.callPrompt):gesture.listen("tap",d,function(){window.location="/users/sign_in"})),gesture.listen("down",d,function(){d.classList.add("ts-active-button")}),gesture.listen("up",d,function(){d.classList.remove("ts-active-button")}),s.appendChild(d),modal.promptIn(s,null,a)},buildVoteButtons=function(e,t){var n=document.createElement("div"),i=document.createElement("div"),a=document.createElement("img"),s=document.createElement("img");a.src="http://assets.tagsurf.co/img/downvote_btn.png",s.src="http://assets.tagsurf.co/img/upvote_btn.png",a.id="downvote-icon",s.id="upvote-icon",i.className="vote-button hidden",i.id="vote-button-left",n.className="vote-button hidden",n.id="vote-button-right",i.appendChild(a),n.appendChild(s),gesture.listen("down",i,function(){i.firstChild.src="http://assets.tagsurf.co/img/downvote_btn-invert.png"}),gesture.listen("up",i,function(){setTimeout(function(){i.firstChild.src="http://assets.tagsurf.co/img/downvote_btn.png"},200)}),gesture.listen("tap",i,function(){modal.zoom.zoomed&&modal.callZoom(1),cardCbs.drag("left",-1,-1),setTimeout(function(){t("left")},200),analytics.track("Tap Downvote Button")}),gesture.listen("down",n,function(){n.firstChild.src="http://assets.tagsurf.co/img/upvote_btn-invert.png"}),gesture.listen("up",n,function(){setTimeout(function(){n.firstChild.src="http://assets.tagsurf.co/img/upvote_btn.png"},200)}),gesture.listen("tap",n,function(){modal.zoom.zoomed&&modal.callZoom(1),cardCbs.drag("right",1,1),setTimeout(function(){t("right")},200),analytics.track("Tap Upvote Button")}),document.body.appendChild(i),document.body.appendChild(n)},voteButtonsOn=function(){document.getElementById("vote-button-right")&&(toggleClass.apply(document.getElementById("vote-button-right"),["hidden","off"]),toggleClass.apply(document.getElementById("vote-button-left"),["hidden","off"]))},voteButtonsOff=function(){document.getElementById("vote-button-right")&&(toggleClass.apply(document.getElementById("vote-button-right"),["hidden","on"]),toggleClass.apply(document.getElementById("vote-button-left"),["hidden","on"]))},flashVoteButton=function(e){"right"==e?(document.getElementById("upvote-icon").src="http://assets.tagsurf.co/img/upvote_btn-invert.png",setTimeout(function(){document.getElementById("upvote-icon").src="http://assets.tagsurf.co/img/upvote_btn.png"},300)):"left"==e&&(document.getElementById("downvote-icon").src="http://assets.tagsurf.co/img/downvote_btn-invert.png",setTimeout(function(){document.getElementById("downvote-icon").src="http://assets.tagsurf.co/img/downvote_btn.png"},300))},currentMedia,panicCb,checkShare=function(e){var t=currentMedia;if(t&&"content"==t.type){if(share.on(t,e),whichGallery())return;panic.on(t,panicCb),currentUser.vote_btns&&voteButtonsOn()}else t&&"login"==t.type?currentUser.vote_btns&&voteButtonsOn():(share.off(),panic.off(),voteButtonsOff(),addBarSlid&&slideAddBar())},setCurrentMedia=function(e,t){currentMedia=e,checkShare(t)},_addCss=function(e){var t=document.createElement("style");t.type="text/css",t.styleSheet?t.styleSheet.cssText=e:t.appendChild(document.createTextNode(e)),document.getElementsByTagName("head")[0].appendChild(t)},addedCss=[],addCss=function(e,t){var n,i="";for(n in e)i+=n+" { "+e[n]()+" } ";isNaN(t)&&addedCss.push(e),_addCss(i)},getOrientation=function(){return window.innerWidth<window.innerHeight?"portrait":"landscape"},maxCardHeight,resizeCb,setMaxCardHeight=function(){maxCardHeight=window.innerHeight-240},setResizeCb=function(e){resizeCb=e};setMaxCardHeight();var lastWidth=window.innerWidth;window.onresize=function(){!isDesktop()&&lastWidth==window.innerWidth||throbber.active||(lastWidth=window.innerWidth,setMaxCardHeight(),addedCss.forEach(addCss),resizeCb&&resizeCb())};var xhr=function(e,t,n,i,a,s){var r=new XMLHttpRequest;DEBUG&&console.log("XHR Request. Path: "+e+" action: "+(t||"GET")),"undefined"==typeof a&&(a=!0),r.open(t||"GET",e,a),"PATCH"==t&&r.setRequestHeader("Content-type","application/json"),r.onreadystatechange=function(){if(4==r.readyState){var t="<"==r.responseText.charAt(0)?{errors:r.responseText}:JSON.parse(r.responseText);if(t.errors||200!=r.status){if(i&&i(t,r.status),DEBUG&&401!=r.status&&404!=r.status){var a="XHR error! Request failed. Path:"+e+" Errors: "+t.errors+" Response: "+r.responseText+" Status: "+r.status;console.log(a),!isDesktop()&&alert(a)}}else n&&n(t)}},r.send(s)},mod=function(e){for(var t=e.targets?e.targets:e.target?[e.target]:e.className?document.getElementsByClassName(e.className):e.id?[document.getElementById(e.id)]:[],n=e.property||"display",i=e.value||(e.show?"block":e.hide?"none":""),a=0;a<t.length;a++)t[a].style[n]=i},__ua=navigator.userAgent,_ua={isUIWebView:/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(__ua),isSafariOrUIWebView:/(iPhone|iPod|iPad).*AppleWebKit/i.test(__ua),isIphone:-1!=__ua.indexOf("iPhone"),isIpad:-1!=__ua.indexOf("iPad"),isIos:-1!=__ua.indexOf("iPhone")||-1!=__ua.indexOf("iPad"),isMobile:-1!=__ua.toLowerCase().indexOf("mobile"),isAndroid:-1!=__ua.indexOf("Android"),isNativeAndroid:-1!=__ua.indexOf("AndroidWebView"),isFacebook:-1!=__ua.indexOf("FB"),isStockAndroid:-1!=__ua.indexOf("Mozilla/5.0")&&-1!=__ua.indexOf("Android ")&&-1!=__ua.indexOf("AppleWebKit")&&-1==__ua.indexOf("Chrome")},isIos=function(){return _ua.isIos},isUIWebView=function(){return _ua.isUIWebView&&!_ua.isFacebook},isIpad=function(){return _ua.isIpad},isIphone=function(){return _ua.isIphone},isDesktop=function(){return!_ua.isMobile&&!_ua.isAndroid&&!_ua.isIos},isTablet=function(){return _ua.isIpad||_ua.isAndroid&&!_ua.isMobile},isMobile=function(){return _ua.isMobile},isAndroid=function(){return _ua.isAndroid},isNativeAndroid=function(){return _ua.isNativeAndroid},isStockAndroid=function(){return _ua.isStockAndroid},isNarrow=function(){return window.innerWidth<700},trans=function(e,t,n,i){var a,s=n&&1==n.split(" ").length,r=function(){n&&(s?e.classList.remove(n):e.style["-webkit-transition"]=""),i&&(e.style["-webkit-transform"]=""),a&&(clearTimeout(a),a=null),e.removeEventListener("webkitTransitionEnd",r,!1),t&&t()};e.addEventListener("webkitTransitionEnd",r,!1),n&&(s?e.classList.add(n):(e.style["-webkit-transition"]=n,a=setTimeout(r,parseInt(n.split(" ")[1])))),i&&(e.style["-webkit-transform"]=i)},validEmail=function(e){var t=e.indexOf("@",1),n=e.indexOf(".",t);return-1==t||-1==n||n==e.length-1||t+2>n?!1:!0},requestAnimFrame;!function(){for(var e=0,t=["ms","moz","webkit","o"],n=0;n<t.length&&!window.requestAnimationFrame;++n)window.requestAnimationFrame=window[t[n]+"RequestAnimationFrame"],window.cancelAnimationFrame=window[t[n]+"CancelAnimationFrame"]||window[t[n]+"CancelRequestAnimationFrame"];window.requestAnimationFrame||(window.requestAnimationFrame=function(t){var n=(new Date).getTime(),i=Math.max(0,16-(n-e)),a=window.setTimeout(function(){t(n+i)},i);return e=n+i,a}),requestAnimFrame=window.requestAnimationFrame,window.cancelAnimationFrame||(window.cancelAnimationFrame=function(e){clearTimeout(e)})}();var gesture={gid:0,preventDefault:!0,thresholds:{swipe:{minDistance:35,maxTime:400,minDP:600,maxDP:1e3},drag:{minDP:0,maxDP:1e3},tap:{maxDistance:10,maxTime:700,waitTime:300,maxCount:2},hold:{maxDistance:null,interval:1e3},up:{androidDelay:600},pinch:{}},_vars:{active:!1,startTime:null,dragTime:null,startPos:null,lastPos:null,tapCount:0,holdCount:0,tapTimeout:null,holdInterval:null,stopTimeout:null,firstPinch:null,stopPropagation:!1,preventDefault:!1,iosPinch:!1,iosPinching:!1},gevents:{GestureStart:"gesturestart",GestureChange:"gesturechange",GestureEnd:"gestureend"},events:isMobile()&&{Start:"touchstart",Stop:"touchend",Move:"touchmove",Cancel:"touchcancel"}||{Start:"mousedown",Stop:"mouseup",Move:"mousemove"},handlers:{drag:{},swipe:{},tap:{},up:{},down:{},hold:{},pinch:{}},tuneThresholds:function(){if(!isIos())for(var e in gesture.thresholds)for(var t in gesture.thresholds[e]){var n=t.slice(3);"Distance"==n?gesture.thresholds[e][t]/=2:"DP"==n&&(gesture.thresholds[e][t]*=2)}},getPos:function(e){return void 0==e.x&&(e.x=e.pageX||e.changedTouches[0].pageX,e.y=e.pageY||e.changedTouches[0].pageY),{x:e.x,y:e.y}},getDiff:function(e,t){var n={};return n.x=t.x-e.x,n.y=t.y-e.y,n.distance=Math.sqrt(n.x*n.x+n.y*n.y),n.direction=Math.abs(n.x)>Math.abs(n.y)?n.x>0?"right":"left":n.y>0?"down":"up",n},pinchDiff:function(e){return isIos()?e.scale:gesture.getDiff(gesture.getPos(e.touches[0]),gesture.getPos(e.touches[1]))},pixelsPerSecond:function(e,t,n){var i=gesture.thresholds[n];return Math.min(i.maxDP,Math.max(i.minDP,e/t))*(isIos()?1:.5)},isMulti:function(e){return isMobile()&&e.touches.length>1},onGestureStart:function(){},onGestureChange:function(e,t){gesture.triggerPinch(t,Math.pow(e.scale,1/3))},onGestureEnd:function(e,t){gesture.triggerPinch(t),t.gvars.iosPinching=!1},onStart:function(e,t){var n=gesture.thresholds,i=t.gvars;return i.active=!0,i.holdCount=0,i.startTime=i.dragTime=Date.now(),i.startPos=i.lastPos=gesture.getPos(e),i.tapTimeout&&(clearTimeout(i.tapTimeout),i.tapTimeout=null),gesture.isMulti(e)?isAndroid()?i.firstPinch=gesture.pinchDiff(e):i.iosPinching=!0:i.holdInterval=setInterval(function(){return!i.active||n.hold.maxDistance&&n.hold.maxDistance<gesture.getDiff(i.startPos,i.lastPos).distance?(clearInterval(i.holdInterval),i.holdInterval=null,void 0):(i.holdCount+=1,gesture.triggerHold(t,n.hold.interval*i.holdCount),void 0)},n.hold.interval),gesture.triggerDown(t)},onStop:function(e,t,n){var i=t.gvars;if(!n&&i.holdInterval&&(clearInterval(i.holdInterval),i.holdInterval=null),i.active){var a=gesture.thresholds,s=gesture.getPos(e),r=gesture.getDiff(i.startPos,s),o=Date.now()-i.startTime;return i.active=!(!e.touches||!e.touches.length),e.touches&&1==e.touches.length&&gesture.triggerPinch(t),i.active||i.iosPinching||(o<a.swipe.maxTime&&r.distance>a.swipe.minDistance?gesture.triggerSwipe(t,r.direction,r.distance,r.x,r.y,gesture.pixelsPerSecond(r.distance,o,"swipe")):o<a.tap.maxTime&&r.distance<a.tap.maxDistance&&(i.tapCount+=1,i.tapCount==a.tap.maxCount?gesture.triggerTap(t):i.tapTimeout=setTimeout(gesture.triggerTap,a.tap.waitTime,t))),gesture.triggerUp(t,n)}},onMove:function(e,t){var n=t.gvars;if(n.active){var i=gesture.getPos(e),a=gesture.getDiff(n.lastPos,i),s=Date.now(),r=s-n.dragTime;if(n.lastPos=i,n.dragTime=s,!gesture.isMulti(e))return gesture.triggerDrag(t,a.direction,a.distance,a.x,a.y,gesture.pixelsPerSecond(a.distance,r,"drag"));isAndroid()&&gesture.triggerPinch(t,gesture.pinchDiff(e).distance/n.firstPinch.distance)}},gWrap:function(e){var t={};return["GestureStart","GestureChange","GestureEnd"].forEach(function(n){t[n]=function(t){return t.preventDefault(),t.stopPropagation(),gesture["on"+n](t,e)||!1}}),t},eWrap:function(e){var t={};return["Start","Stop","Move"].forEach(function(n){t[n]=function(t){return e.gvars.preventDefault&&t.preventDefault(),e.gvars.stopPropagation&&t.stopPropagation(),gesture["on"+n](t,e)||gesture.preventDefault&&t.preventDefault()||t.stopPropagation()||!1}}),gesture.events.Cancel&&(t.Cancel=t.Stop),t},listen:function(e,t,n,i,a){if(!t.gid){t.gid=++gesture.gid;var s=t.listeners=gesture.eWrap(t);for(var r in gesture.events)t.addEventListener(gesture.events[r],s[r]);t.gvars=JSON.parse(JSON.stringify(gesture._vars))}if("pinch"==e&&isIos()){var o=gesture.gWrap(t);for(var r in gesture.gevents)t.addEventListener(gesture.gevents[r],o[r]);for(var l in o)t.listeners[l]=o[l];t.gvars.iosPinch=!0}t.gvars.stopPropagation=i,t.gvars.preventDefault=a,gesture.handlers[e][t.gid]||(gesture.handlers[e][t.gid]=[]),gesture.handlers[e][t.gid].push(n)},unlisten:function(e){if(e.gid){var t=e.listeners;for(var n in gesture.events)e.removeEventListener(gesture.events[n],t[n]);if(e.gvars.iosPinch)for(var n in gesture.gevents)e.removeEventListener(gesture.gevents[n],t[n]);for(var i in gesture.handlers)e.gid in gesture.handlers[i]&&delete gesture.handlers[i][e.gid];delete e.gid}},triggerPinch:function(e,t){var n=gesture.handlers.pinch[e.gid];if(n)for(var i=0;i<n.length;i++)n[i](t)},triggerSwipe:function(e,t,n,i,a,s){var r=gesture.handlers.swipe[e.gid];if(hasSwiped=!0,r)for(var o=0;o<r.length;o++)r[o](t,n,i,a,s)},triggerTap:function(e){var t=e.gvars,n=gesture.handlers.tap[e.gid];if(n)for(var i=0;i<n.length;i++)n[i](t.tapCount);t.tapCount=0,t.tapTimeout=null},triggerDrag:function(e,t,n,i,a,s){var r=!1,o=gesture.handlers.drag[e.gid];if(o)for(var l=0;l<o.length;l++)r=o[l](t,n,i,a,s)||r;return r},triggerHold:function(e,t){var n=gesture.handlers.hold[e.gid];if(n)for(var i=0;i<n.length;i++)n[i](t)},triggerUp:function(e,t){var n=!1,i=gesture.handlers.up[e.gid];if(i)for(var a=0;a<i.length;a++)n=i[a](t)||n;return n},triggerDown:function(e){var t=!1,n=gesture.handlers.down[e.gid];if(n)for(var i=0;i<n.length;i++)t=n[i]()||t;return t}};gesture.tuneThresholds();var populateNavbar=function(){var e=document.getElementById("nav"),t=document.createElement("div");t.id="navbar";var n=document.createElement("div");n.id="menu-slider";var i=document.createElement("div");i.id="tag-adder";var a=whichGallery(),s=a?document.location.hash.slice(1):null,r=["<div id='favorites-btn'>","<a onclick='starCallback();'><img id='favorites-icon' src='http://assets.tagsurf.co/img/favorites_icon_blue.png'></a>","</div>","<div id='add-btn'>","<a onclick='slideAddBar();'><img id='add-icon' src='http://assets.tagsurf.co/img/add_icon_blue.png'></a>","</div>","<div class='navbar-center'>","<label id='slider-label' for='slider-box' ontouchmove='return false;' onclick='slideNavMenu();'>","<span id='main-logo'>",a?"tag"==a?"<span class='pointer'>#"+s+"</span>":"<img class='gallery-icon' src='http://assets.tagsurf.co/img/"+a+"_icon_gray.png'><span id='gallery-name' class='pointer'>"+a.toUpperCase()+"</span>":"<img id='tagsurf-logo' src='http://assets.tagsurf.co/img/logo_big.png'></img>","</span><span id='history-logo'>HISTORY</span>","<img id='slider-icon' "+(a?"":"class='vtop' ")+"src='http://assets.tagsurf.co/img/down_arrow_nav.png'></img>","</label>","</div>"],o=["<input type='checkbox' name='slider-box' id='slider-box' style='display:none'>","<div id='slide-down-menu' class='pointer'>","<ul>","<li><a href='/feed'><div>","<img class='menu-icon' src='http://assets.tagsurf.co/img/trending_icon_gray.png'></img>","<img class='menu-icon' src='http://assets.tagsurf.co/img/trending_icon_white.png'></img>","&nbsp;&nbsp;&nbsp;TRENDING","</div></a></li>","<li><a href='/favorites'><div>","<img class='menu-icon' src='http://assets.tagsurf.co/img/favorites_icon_gray.png'></img>","<img class='menu-icon' src='http://assets.tagsurf.co/img/favorites_icon_white.png'></img>","&nbsp;&nbsp;&nbsp;FAVORITES","</div></a></li>","<li><a href='/history'><div>","<img class='menu-icon' src='http://assets.tagsurf.co/img/history_icon_gray.png'></img>","<img class='menu-icon' src='http://assets.tagsurf.co/img/history_icon_white.png'></img>","&nbsp;&nbsp;&nbsp;HISTORY","</div></a></li>","<li><a id='options-btn'><div>","<img class='menu-icon' src='http://assets.tagsurf.co/img/options_icon_gray.png'></img>","<img class='menu-icon' src='http://assets.tagsurf.co/img/options_icon_white.png'></img>","&nbsp;&nbsp;&nbsp;OPTIONS","</div></a></li>","<li><a id='logout'><div>","<img class='menu-icon' src='http://assets.tagsurf.co/img/logout_icon_gray.png'></img>","<img class='menu-icon inverted' src='http://assets.tagsurf.co/img/logout_icon_white.png'></img>","&nbsp;&nbsp;&nbsp;LOGOUT","</div></a></li>","</ul>","</div>"],l=["<input type='checkbox' name='slider-box' id='slider-box' style='display:none'>","<div id='slide-down-menu' class='pointer'>","<ul>","<li><a onclick='popTrending();'><div>","<img class='menu-icon' src='http://assets.tagsurf.co/img/trending_icon_gray.png'></img>","<img class='menu-icon' src='http://assets.tagsurf.co/img/trending_icon_white.png'></img>","&nbsp;&nbsp;&nbsp;TRENDING","</div></a></li>","<li><a id='options-btn'><div>","<img class='menu-icon' src='http://assets.tagsurf.co/img/options_icon_gray.png'></img>","<img class='menu-icon' src='http://assets.tagsurf.co/img/options_icon_white.png'></img>","&nbsp;&nbsp;&nbsp;OPTIONS","</div></a></li>","<li><a id='login'><div>","<img class='menu-icon inverted' src='http://assets.tagsurf.co/img/logout_icon_gray.png'></img>","<img class='menu-icon' src='http://assets.tagsurf.co/img/logout_icon_white.png'></img>","&nbsp;&nbsp;&nbsp;LOGIN","</div></a></li>","</ul>","</div>"],c=isAuthorized()?o:l;t.innerHTML=r.join("\n"),n.innerHTML=c.join("\n"),i.innerHTML="<input value='#newtag' spellcheck='false' autocomplete='off' autocapitalize='off' autocorrect='off'><img src='http://assets.tagsurf.co/img/add_tag_button.png'><div id='add-tag-autocomplete' class='autocomplete hider'></div>",e.appendChild(t),e.appendChild(n),e.appendChild(i),i.firstChild.nextSibling.onclick=function(){var e=i.firstChild.value.slice(1);e&&"newtag"!=e&&(newtags.push(e),slideAddBar(),addCallback&&addCallback(e))},fadeInBody(),addCss({"#add-tag-autocomplete":function(){return"width: "+i.firstChild.clientWidth+"px"},".autocomplete-open":function(){return"height: "+(isDesktop()?window.innerHeight-200:150)+"px !important"}}),autocomplete.register("add-tag-autocomplete",i.firstChild,{enterCb:function(){autocomplete.tapTag(i.firstChild.value.slice(1),"add-tag-autocomplete")},tapCb:function(e){i.firstChild.value="#"+e,i.firstChild.nextSibling.onclick()},keyUpCb:function(){var e=i.firstChild;"#"!=e.value.charAt(0)&&(e.value="#"+e.value.replace(/#/g,""))},expandCb:function(){i.firstChild.value="#"}}),add_icon=document.getElementById("add-icon"),isAuthorized()?document.getElementById("logout").onclick=function(){window.location="/users/sign_out"}:document.getElementById("login").onclick=stashVotesAndLogin,document.getElementById("options-btn").onclick=function(){var e=document.createElement("div"),t=document.createElement("div"),n=document.createElement("img"),i=document.createElement("div"),a=function(){checkShare(),modal.backOff(),modal.modalOut()},s=buildOptionsTable(a);e.className="center-label",n.src="http://assets.tagsurf.co/img/Close.png",n.className="modal-close-button",n.id="options-close-button",t.innerHTML="Options",t.className="options-title",i.innerHTML="<a class='blue bold big-lnk' id='terms-lnk'>Terms of Use</a> | <a class='blue bold big-lnk' id='privacy-lnk'>Privacy Policy</a>",i.className="tos-line",e.appendChild(t),e.appendChild(s),e.appendChild(n),e.appendChild(i),slideNavMenu(!0),share.off(),panic.off(),voteButtonsOff(),modal.modalIn(e,a),initDocLinks(checkShare)}},buildOptionsTable=function(e){var t=document.createElement("table"),n=t.insertRow(0),i=t.insertRow(1),a=t.insertRow(2),s=t.insertRow(3),r=a.insertCell(0),o=a.insertCell(1),l=s.insertCell(0),c=n.insertCell(0),d=n.insertCell(1),u=i.insertCell(0),g=document.createElement("div"),p=document.createElement("div"),m=document.createElement("div"),f=document.createElement("div"),h=document.createElement("div"),v=document.createElement("div");if("undefined"!=typeof tutorial&&tutorial.paused)var b=t.insertRow(0),w=b.insertCell(0),C=document.createElement("div");return t.className="inline options-table",m.innerHTML='<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="safe-surf-checkbox"'+(currentUser&&currentUser.safeSurf||!isAuthorized()?" checked":"")+'> <label class="onoffswitch-label" for="myonoffswitch"> <span class="onoffswitch-inner"></span> <span class="onoffswitch-switch"></span> </label> <div class="onoffswitch-cover" style="display:'+(isAuthorized()&&!isUIWebView()?"none":"block")+';"></div>',p.innerHTML="Safe Surf",p.className=h.className="options-key-text",u.colSpan=l.colSpan=2,g.innerHTML="Safe Surf filters NSFW content<br>out of your feed and galleries.<br><i>(NSFW = Not Safe For Work)</i>",g.className=f.className="options-key-desc",gesture.listen("down",m,function(){isAuthorized()?isUIWebView()?(messageBox("Sorry","Disabling Safe Surf is not allowed for native applications on this device<br/><br/>Visit us in your mobile browser<br/>at <span class='blue'>www.tagsurf.co</span> for full features"),analytics.track("Unauthorized iOS Toggle Safe Surf")):(m.firstChild.checked=!m.firstChild.checked,xhr("/api/users/"+currentUser.slug,"PATCH",null,null,null,JSON.stringify({safe_mode:m.firstChild.checked})),currentUser.safeSurf=m.firstChild.checked,autocomplete.populate(),whichGallery()&&location.reload(),analytics.track("Toggle Safe Surf",{safeSurf:currentUser.safeSurf})):(messageBox("Oops","Login to disable Safe Surf","login",stashVotesAndLogin),analytics.track("Unauthorized Toggle Safe Surf"))}),m.className=v.className="onoffswitch-container",c.appendChild(p),d.appendChild(m),u.appendChild(g),v.innerHTML='<input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="safe-surf-checkbox"'+(currentUser.vote_btns?" checked":"")+'> <label class="onoffswitch-label" for="myonoffswitch"> <span class="onoffswitch-inner"></span> <span class="onoffswitch-switch"></span> </label>',h.innerHTML="Vote Buttons",h.style.fontSize="150%",f.innerHTML="Turn off voting buttons and just swipe",gesture.listen("down",v,function(){v.firstChild.checked=!v.firstChild.checked,currentUser.vote_btns=v.firstChild.checked;sessionStorage.getItem("vote_btns");analytics.track("Toggle Vote Buttons",{voteButtons:currentUser.vote_btns})}),r.appendChild(h),o.appendChild(v),l.appendChild(f),"undefined"!=typeof tutorial&&tutorial.paused?(C.innerHTML="Resume Tutorial",C.className=isMobile()?"msgbox-btn biggest pointer":"msgbox-btn really-big pointer",C.id="resume-btn",w.colSpan="2",gesture.listen("tap",C,function(){e(),tutorial.resume(1e3)}),gesture.listen("down",C,function(){C.classList.add("ts-active-button")}),gesture.listen("up",C,function(){C.classList.remove("ts-active-button")}),tutorial.paused&&w.appendChild(C),t):t},navMenuSlid=!1,slideNavMenu=function(e){autocomplete.viewing.autocomplete&&closeAutoComplete(null,!0),addBarSlid&&slideAddBar(!0),navMenuSlid=!navMenuSlid,toggleClass.apply(document.getElementById("slider-label"),["slid",navMenuSlid?"on":"off"]),toggleClass.apply(document.getElementById("slide-down-menu"),["opened-menu",navMenuSlid?"on":"off"]),1==e||modal.zoom.zoomed||modal.modal.on||(navMenuSlid?modal.halfOn(slideNavMenu):modal.backOff())},add_icon,add_state="blue",add_icons={fill:"http://assets.tagsurf.co/img/add_icon_fill.png",blue:"http://assets.tagsurf.co/img/add_icon_blue.png"},addBarSlid=!1,slideAddBar=function(e){return isAuthorized()?(autocomplete.viewing.autocomplete&&(autocomplete.retract("autocomplete"),closeAutoComplete(null,!0)),autocomplete.viewing["add-tag-autocomplete"]&&autocomplete.retract("add-tag-autocomplete"),navMenuSlid&&slideNavMenu(!0),addBarSlid=!addBarSlid,(!addBarSlid||currentMedia)&&(add_state=addBarSlid?"fill":"blue",add_icon.src=add_icons[add_state],toggleClass.apply(document.getElementById("tag-adder"),["opened-menu",addBarSlid?"on":"off"]),document.getElementById("tag-adder").firstChild.value="#newtag",1==e||modal.zoom.zoomed||modal.modal.on||(addBarSlid?modal.halfOn(slideAddBar):modal.backOff())),void 0):(messageBox("Oops","You need to login to add a tag","login",stashVotesAndLogin),void 0)},starCallback,setStarCallback=function(e){starCallback=e},addCallback,setAddCallback=function(e){addCallback=e},setFavIcon=function(e){document.getElementById("favorites-icon").src="http://assets.tagsurf.co/img/favorites_icon_"+(e?"fill":"blue")+".png"},drag={_direction2constraint:{up:"horizontal",down:"horizontal",left:"vertical",right:"vertical"},nativeScroll:function(e,t){gesture.listen("up",e,function(){return t.up&&t.up(),!0},!0,!1),gesture.listen("down",e,function(){return t.down&&t.down(),!0},!0,!1);var n,i,a={up:"down",down:"up",right:"left",left:"right"},s=function(){i&&(clearTimeout(i),i=null),i=setTimeout(function(){t.drag(a[n],0,0,0)},100)};gesture.listen("drag",e,function(i,a,s,r){var o=e.parentNode.scrollHeight-e.parentNode.scrollTop===e.parentNode.clientHeight,l=0===e.parentNode.scrollTop;return n=i,t.drag&&t.drag(i,a,s,r),l&&"down"==i||o&&"up"==i?!1:!t.constraint||t.constraint==drag._direction2constraint[i]},!0,!1),gesture.listen("swipe",e,function(n){"up"==n&&e.parentNode.scrollTop>=e.parentNode.scrollHeight-(e.parentNode.clientHeight+800)&&t.swipe&&t.swipe()},!0,!1),e.parentNode.addEventListener("scroll",function(e){return t.scroll&&t.scroll(e),t.drag&&s(),!0},!1)},makeDraggable:function(e,t){if(t=t||{},!t.interval&&!t.force&&!isStockAndroid())return drag.nativeScroll(e.firstChild,t);var n,i,a,s;e.xDrag=0,e.yDrag=0,e.classList.add("hardware-acceleration"),e.style["-webkit-transform"]="translate3d(0,0,0)",-1==e.className.indexOf("carousel")&&(e.style.overflow="visible",e.parentNode.style.overflow="visible"),e.parentNode.addEventListener("scroll",function(){return!1},!1),n=function(){e.animating||(e.dragging=!1,e.touchedDown=!0,e.animating=!1,e.xDragStart=e.xDrag,e.yDragStart=e.yDrag,t.down&&t.down())},i=function(n){var i=0,a=0,s=!1;e.touchedDown=e.dragging=!1,0==e.animating&&(t.interval?("vertical"!=t.constraint&&(a=e.yDrag%t.interval,0!=a&&(e.yDrag-=Math.abs(a)<=t.interval/2?a:t.interval+a,n=e.yDrag<e.yDragStart?"up":e.yDrag>e.yDragStart?"down":"hold")),"horizontal"!=t.constraint&&(i=e.xDrag%t.interval,0!=i&&(e.xDrag-=Math.abs(i)<=t.interval/2?i:t.interval+i,n=e.xDrag<e.xDragStart?"left":e.xDrag>e.xDragStart?"right":"hold")),n&&(e.animating=!0,trans(e,function(){e.animating=!1},"-webkit-transform 300ms ease-out"),e.style["-webkit-transform"]="translate3d("+e.xDrag+"px,"+e.yDrag+"px,0)")):("horizontal"!=t.constraint&&(e.xDrag>0?(e.xDrag=0,s=!0,n="right"):Math.abs(e.xDrag)>e.scrollWidth-e.parentNode.clientWidth&&(e.xDrag=-(e.scrollWidth-e.parentNode.clientWidth),s=!0,n="left")),"vertical"!=t.constraint&&(e.yDrag>0?(e.yDrag=0,s=!0,n="up"):e.yDrag<-(e.scrollHeight-e.parentNode.clientHeight)&&(e.yDrag=-(e.scrollHeight-e.parentNode.clientHeight),s=!0,n="down")),s&&(e.animating=!0,trans(e,function(){e.animating=!1,t.drag&&t.drag(n,0,0,0),t.scroll&&t.scroll()},"-webkit-transform 300ms ease-out"),e.style["-webkit-transform"]="translate3d("+e.xDrag+"px,"+e.yDrag+"px,0)")),t.up&&t.up(n))},a=function(n,i,a,s){e.touchedDown&&(e.dragging=!0,"vertical"!=t.constraint&&e.yDrag>-(e.scrollHeight-2*e.parentNode.clientHeight/3)&&(e.yDrag+=s),"horizontal"!=t.constraint&&Math.abs(e.xDrag)<e.scrollWidth-2*e.parentNode.clientWidth/3&&(e.xDrag+=a),e.style["-webkit-transform"]="translate3d("+e.xDrag+"px,"+e.yDrag+"px,0)",t.drag&&t.drag(n,i,a,s),t.scroll&&t.scroll())},s=function(n,a,s,r,o){var l=t.interval?e.xDrag%t.interval:-s,c=t.interval?e.yDrag%t.interval:.3*o;if(0==e.animating){if("horizontal"!=t.constraint&&e.xDrag<=0&&Math.abs(e.xDrag)<e.scrollWidth-e.parentNode.clientWidth)if("right"==n)e.xDrag-=l;else{if("left"!=n)return;e.xDrag+=t.interval?-(t.interval+l):l}if("vertical"!=t.constraint&&e.yDrag<=0&&e.yDrag>-(e.scrollHeight-e.parentNode.clientHeight))if("up"==n)e.yDrag-=c;else{if("down"!=n)return;e.yDrag-=t.interval?-(t.interval+c):-c}trans(e,function(){e.animating=!1,i(n)},"-webkit-transform 300ms ease-out"),e.animating=!0,e.style["-webkit-transform"]="translate3d("+e.xDrag+"px,"+e.yDrag+"px,0)"}},e.isDraggable&&gesture.unlisten(e),e.isDraggable=!0,gesture.listen("drag",e,a),gesture.listen("down",e,n),gesture.listen("swipe",e,s),gesture.listen("up",e,i)}};Element.prototype.remove=function(){this.parentElement.removeChild(this)},NodeList.prototype.remove=HTMLCollection.prototype.remove=function(){for(var e=0,t=this.length;t>e;e++)this[e]&&this[e].parentElement&&this[e].parentElement.removeChild(this[e])},String.prototype.trunc=String.prototype.trunc||function(e){return this.length>e?this.substr(0,e-1)+"&hellip;":this};var carousel={view:document.createElement("div"),activeCircle:null,translateDistance:window.innerWidth,inactivityTimeout:null,animating:!1,images:[],current_card:0,total_cards:0,endButton:!1,_build:function(){addCss({"#carousel":function(){return"height: "+window.innerHeight+"px; width: "+window.innerWidth+"px"},".carousel-container":function(){return"width: "+5*window.innerWidth+"px"},".carousel-image-container":function(){return"width: "+window.innerWidth+"px"}});var e,t=document.createElement("div"),n=document.createElement("div"),i=document.createElement("div"),a=document.createElement("div");for(carousel.view.id="carousel",t.className="carousel-container",n.className="carousel-order-indicator",a.id="next-button",a.className="advnc-tutorial-btn",a.innerHTML="Next",gesture.listen("tap",a,carousel.nextButtonCallback),n.appendChild(i),n.appendChild(a),carousel.view.appendChild(t),carousel.view.appendChild(n),drag.makeDraggable(t,{constraint:"vertical",interval:carousel.translateDistance,up:carousel.orderIndicationCallback}),document.body.appendChild(carousel.view),e=1;6>=e;++e)carousel.images.push("http://assets.tagsurf.co/img/tutorial/tutorial_"+e+".png");isAndroid()?carousel.images.push("http://assets.tagsurf.co/img/tutorial/tutorial_homescreen_android.png"):carousel.images.push("http://assets.tagsurf.co/img/tutorial/tutorial_homescreen_ios.png"),carousel._populate(),gesture.listen("down",carousel.view.firstChild,carousel.downCallback)},orderIndicationCallback:function(e){"left"==e&&carousel.activeCircle.nextSibling&&(carousel.current_card+1==carousel.total_cards-1&&(carousel.setEndButton(),carousel.swipeCallback("left")),carousel.activeCircle.classList.remove("active-circle"),carousel.activeCircle.nextSibling.classList.add("active-circle"),carousel.activeCircle=carousel.activeCircle.nextSibling,carousel.current_card+=1),"right"==e&&carousel.activeCircle.previousSibling&&(carousel.activeCircle.classList.remove("active-circle"),carousel.activeCircle.previousSibling.classList.add("active-circle"),carousel.activeCircle=carousel.activeCircle.previousSibling,carousel.current_card-=1)
},_populate:function(){var e,t,n,i;for(e in carousel.images)t=document.createElement("div"),t.className="carousel-image-container",n=new Image,n.src=carousel.images[e],t.appendChild(n),i=document.createElement("div"),i.className="indicator-circle",0==e&&(i.className+=" active-circle",carousel.activeCircle=i),carousel.view.firstChild.appendChild(t),carousel.view.lastChild.firstChild.appendChild(i),carousel.total_cards+=1},swipeCallback:function(e){var t=carousel.view.firstChild,n=t.xDrag%carousel.translateDistance;if(t.xDrag<=0&&t.xDrag>-(t.scrollWidth-carousel.translateDistance)&&0==carousel.animating){if("right"==e)t.xDrag-=n;else{if("left"!=e)return;t.xDrag-=carousel.translateDistance+n}carousel.orderIndicationCallback(e),trans(t,function(){t.animating=!1},"-webkit-transform 300ms ease-out"),t.animating=!0,t.style["-webkit-transform"]="translate3d("+t.xDrag+"px,0,0)"}},nextButtonCallback:function(){carousel.endButton?(carousel.off(),analytics.track("Completed Tutorial"),document.forms[0].submit()):carousel.current_card+1==carousel.total_cards-1?(carousel.setEndButton(),carousel.swipeCallback("left")):(clearInterval(carousel.inactivityTimeout),carousel.inactivityTimeout=null,carousel.swipeCallback("left"))},setEndButton:function(){document.getElementById("next-button").innerHTML="Got it!",carousel.endButton=!0},downCallback:function(){clearInterval(carousel.inactivityTimeout),carousel.inactivityTimeout=null},on:function(){carousel.view.style.visibility="visible",carousel.view.style.opacity=1,carousel.inactivityTimeout=setInterval(function(){carousel.swipeCallback("left")},5e3)},off:function(){carousel.view.style.opacity=0,trans(carousel.view,function(){carousel.view.style.visibility="hidden"}),clearInterval(carousel.inactivityTimeout)}};carousel._build(),carousel.on(),fadeInBody();