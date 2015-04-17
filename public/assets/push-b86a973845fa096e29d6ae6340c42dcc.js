var authorizedSession=null,cardIndex=0,currentUser={id:null,email:null,username:null,slug:null,vote_btns:!0,admin:!1,unseen_bumps:0,unseen_refs:0},returnTrue=function(){return!0},hasSwiped=!1,hasKeySwiped=!1,hasSwitchedTags=!1,current_gallery_image=null,DEBUG=!1;(-1!=document.location.hostname.indexOf("localhost")||-1!=document.location.hostname.indexOf("staging.tagsurf.co")||-1!=document.location.hostname.indexOf("192.168")||-1!=document.location.hostname.indexOf("172.20"))&&(DEBUG=!0);var hasClass=function(e,t){return e.className&&new RegExp("(^|\\s)"+t+"(\\s|$)").test(e.className)};Number.prototype.mod=function(e){return(this%e+e)%e},String.prototype.trunc=String.prototype.trunc||function(e){return this.length>e?this.substr(0,e-1)+"&hellip;":this};var toggleClass=function(e,t){var n=hasClass(this,e);n&&"on"!=t?this.classList.remove(e):n||"off"==t||this.classList.add(e)},galleries=["history","favorites","submissions","tag","bumps"],whichGallery=function(){for(var e=0;e<galleries.length;e++)if(-1!=document.location.pathname.indexOf(galleries[e]))return galleries[e];return null},isGallery=function(){var e=whichGallery();return null==e?!1:!0},isAuthorized=function(){return null!=authorizedSession?authorizedSession:(-1==document.location.href.indexOf("share")||-1!=document.location.href.indexOf("shares")?(authorizedSession=!0,isDesktop()||(currentUser.vote_btns=!1),setTimeout(function(){getUser()},3e3)):authorizedSession=!1,authorizedSession)},getUser=function(){authorizedSession&&!currentUser.id&&xhr("/api/users","GET",function(e){"not found"!=e.user&&(currentUser.id=e.user.id,currentUser.email=e.user.email,currentUser.username=e.user.username,currentUser.slug=e.user.slug,currentUser.admin=e.user.admin,currentUser.safeSurf=e.user.safe_mode,currentUser.unseen_bumps=e.unseen_bumps,currentUser.unseen_refs=e.unseen_referrals,currentUser.unseen_bumps+currentUser.unseen_refs!=0&&updateMenuBadges(currentUser.unseen_bumps+currentUser.unseen_refs),isGallery()&&"bumps"==whichGallery()&&updateGalleryBadges(currentUser.unseen_refs,currentUser.unseen_bumps,!0))},function(e){"not found"==e.user&&DEBUG&&console.log("Error: User not found")}),setTimeout(function(){userStatsPoller()},5e3)},userStatsPoller=function(){xhr("/api/users","GET",function(e){"not found"!=e.user&&(currentUser.safeSurf=e.user.safe_mode,(currentUser.unseen_bumps!=e.unseen_bumps||currentUser.unseen_refs!=e.unseen_referrals)&&(currentUser.unseen_bumps=e.unseen_bumps,currentUser.unseen_refs=e.unseen_referrals,updateMenuBadges(currentUser.unseen_bumps+currentUser.unseen_refs),isGallery()&&"bumps"==whichGallery()&&updateGalleryBadges(currentUser.unseen_refs,currentUser.unseen_bumps)))},function(e){"not found"==e.user&&DEBUG&&console.log("Error: User not found")}),setTimeout(function(){userStatsPoller()},5e3)},current_tag,current_deck,cardCbs,tinput,inputContainer,slideContainer,scrollContainer,closeAutoComplete=function(e){e?(slideContainer.className="",scrollContainer.insertBefore(inputContainer,scrollContainer.firstChild)):modal.backOff(function(){slideContainer.className="",scrollContainer.insertBefore(inputContainer,scrollContainer.firstChild)}),tinput.active=!1},clearStack=function(){var e=current_deck.getEndCard();e&&e.unshow();for(var t=slideContainer.childNodes.length,n=0;t>n;n++)current_deck.cards[n].showing&&current_deck.cards[n].unshow()},newtags=[],pushTags=function(){if(newtags.length>0){for(;newtags.length;)xhr("/api/media/"+currentMedia.id+"/tags/"+newtags.shift(),"POST",null,null);autocomplete.populate()}},popTrending,fadeInBody=function(){addCss({"html, body":function(){return"width: "+window.innerWidth+"px; height: "+window.innerHeight+"px; opacity: 1;"}})},shareVotes=[],stashVotesAndLogin=function(){sessionStorage.setItem("lastPath",current_tag+"~"+currentMedia.id),sessionStorage.setItem("shareVotes",JSON.stringify(shareVotes)),window.location="/users/sign_in"},messageBox=function(e,t,n,s,i){var r=document.createElement("div"),o=document.createElement("div"),a=document.createElement("img"),u=document.createElement("p"),d=document.createElement("p"),c=document.createElement("div");i="undefined"==typeof i?!1:i,o.className="close-button-container pointer",a.className="x-close-button",a.src="http://assets.tagsurf.co/img/Close.png",gesture.listen("down",o,modal.callPrompt),o.appendChild(a),r.appendChild(o),u.className="prompt-title",u.innerHTML=e?e:"Oops",r.appendChild(u),d.className="prompt-message",d.innerHTML=t?t:"Something went wrong",r.appendChild(d),c.className="msgbox-btn","undefined"==typeof n?(c.innerHTML="OK",s?gesture.listen("tap",c,s):gesture.listen("tap",c,modal.callPrompt)):(c.innerHTML=n,"login"!=n||s?s?gesture.listen("tap",c,s):gesture.listen("tap",c,modal.callPrompt):gesture.listen("tap",c,function(){window.location="/users/sign_in"})),gesture.listen("down",c,function(){c.classList.add("ts-active-button")}),gesture.listen("up",c,function(){c.classList.remove("ts-active-button")}),r.appendChild(c),modal.promptIn(r,null,i)},buildVoteButtons=function(e,t){var n=document.createElement("div"),s=document.createElement("div"),i=document.createElement("img"),r=document.createElement("img");i.src="http://assets.tagsurf.co/img/downvote_btn.png",r.src="http://assets.tagsurf.co/img/upvote_btn.png",i.id="downvote-icon",r.id="upvote-icon",s.className="vote-button hidden",s.id="vote-button-left",n.className="vote-button hidden",n.id="vote-button-right",s.appendChild(i),n.appendChild(r),gesture.listen("down",s,function(){s.firstChild.src="http://assets.tagsurf.co/img/downvote_btn-invert.png"}),gesture.listen("up",s,function(){setTimeout(function(){s.firstChild.src="http://assets.tagsurf.co/img/downvote_btn.png"},200)}),gesture.listen("tap",s,function(){modal.zoom.zoomed&&modal.callZoom(1),cardCbs.drag("left",-1,-1),setTimeout(function(){t("left")},200),analytics.track("Tap Downvote Button")}),gesture.listen("down",n,function(){n.firstChild.src="http://assets.tagsurf.co/img/upvote_btn-invert.png"}),gesture.listen("up",n,function(){setTimeout(function(){n.firstChild.src="http://assets.tagsurf.co/img/upvote_btn.png"},200)}),gesture.listen("tap",n,function(){modal.zoom.zoomed&&modal.callZoom(1),cardCbs.drag("right",1,1),setTimeout(function(){t("right")},200),analytics.track("Tap Upvote Button")}),document.body.appendChild(s),document.body.appendChild(n)},voteButtonsOn=function(){document.getElementById("vote-button-right")&&(toggleClass.apply(document.getElementById("vote-button-right"),["hidden","off"]),toggleClass.apply(document.getElementById("vote-button-left"),["hidden","off"]))},voteButtonsOff=function(){document.getElementById("vote-button-right")&&(toggleClass.apply(document.getElementById("vote-button-right"),["hidden","on"]),toggleClass.apply(document.getElementById("vote-button-left"),["hidden","on"]))},flashVoteButton=function(e){"right"==e?(document.getElementById("upvote-icon").src="http://assets.tagsurf.co/img/upvote_btn-invert.png",setTimeout(function(){document.getElementById("upvote-icon").src="http://assets.tagsurf.co/img/upvote_btn.png"},300)):"left"==e&&(document.getElementById("downvote-icon").src="http://assets.tagsurf.co/img/downvote_btn-invert.png",setTimeout(function(){document.getElementById("downvote-icon").src="http://assets.tagsurf.co/img/downvote_btn.png"},300))},currentMedia,panicCb,checkShare=function(e){var t=currentMedia;if(t&&-1!=t.type.indexOf("content")){if(share.on(t,e),refer.on(t),whichGallery())return;panic.on(t,panicCb),currentUser.vote_btns&&voteButtonsOn()}else t&&"login"==t.type?currentUser.vote_btns&&voteButtonsOn():(share.off(),panic.off(),voteButtonsOff(),addBarSlid&&slideAddBar())},setCurrentMedia=function(e,t){currentMedia=e,checkShare(t)},_addCss=function(e){var t=document.createElement("style");t.type="text/css",t.styleSheet?t.styleSheet.cssText=e:t.appendChild(document.createTextNode(e)),document.getElementsByTagName("head")[0].appendChild(t)},addedCss=[],addCss=function(e,t){var n,s="";for(n in e)s+=n+" { "+e[n]()+" } ";isNaN(t)&&addedCss.push(e),_addCss(s)},getOrientation=function(){return window.innerWidth<window.innerHeight?"portrait":"landscape"},maxCardHeight,resizeCb,setMaxCardHeight=function(){maxCardHeight=window.innerHeight-240},setResizeCb=function(e){resizeCb=e};setMaxCardHeight();var lastWidth=window.innerWidth;window.onresize=function(){!isDesktop()&&lastWidth==window.innerWidth||throbber.active||(lastWidth=window.innerWidth,setMaxCardHeight(),addedCss.forEach(addCss),resizeCb&&resizeCb())};var xhr=function(e,t,n,s,i,r){var o=new XMLHttpRequest;DEBUG&&console.log("XHR Request. Path: "+e+" action: "+(t||"GET")),"undefined"==typeof i&&(i=!0),o.open(t||"GET",e,i),"PATCH"==t&&o.setRequestHeader("Content-type","application/json"),o.onreadystatechange=function(){if(4==o.readyState){var t="<"==o.responseText.charAt(0)?{errors:o.responseText}:JSON.parse(o.responseText);if(t.errors||200!=o.status){if(s&&s(t,o.status),DEBUG&&401!=o.status&&404!=o.status){var i="XHR error! Request failed. Path:"+e+" Errors: "+t.errors+" Response: "+o.responseText+" Status: "+o.status;console.log(i),!isDesktop()&&alert(i)}}else n&&n(t)}},o.send(r)},mod=function(e){for(var t=e.targets?e.targets:e.target?[e.target]:e.className?document.getElementsByClassName(e.className):e.id?[document.getElementById(e.id)]:[],n=e.property||"display",s=e.value||(e.show?"block":e.hide?"none":""),i=0;i<t.length;i++)t[i].style[n]=s},__ua=navigator.userAgent,_ua={isUIWebView:/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(__ua),isSafariOrUIWebView:/(iPhone|iPod|iPad).*AppleWebKit/i.test(__ua),isIphone:-1!=__ua.indexOf("iPhone"),isIpad:-1!=__ua.indexOf("iPad"),isIos:-1!=__ua.indexOf("iPhone")||-1!=__ua.indexOf("iPad"),isMobile:-1!=__ua.toLowerCase().indexOf("mobile"),isAndroid:-1!=__ua.indexOf("Android"),isNativeAndroid:-1!=__ua.indexOf("AndroidWebView"),isFacebook:-1!=__ua.indexOf("FB"),isStockAndroid:-1!=__ua.indexOf("Mozilla/5.0")&&-1!=__ua.indexOf("Android ")&&-1!=__ua.indexOf("AppleWebKit")&&-1==__ua.indexOf("Chrome")},isIos=function(){return _ua.isIos},isUIWebView=function(){return _ua.isUIWebView&&!_ua.isFacebook},isIpad=function(){return _ua.isIpad},isIphone=function(){return _ua.isIphone},isDesktop=function(){return!_ua.isMobile&&!_ua.isAndroid&&!_ua.isIos},isTablet=function(){return _ua.isIpad||_ua.isAndroid&&!_ua.isMobile},isMobile=function(){return _ua.isMobile},isAndroid=function(){return _ua.isAndroid},isNativeAndroid=function(){return _ua.isNativeAndroid},isStockAndroid=function(){return _ua.isStockAndroid},isNarrow=function(){return window.innerWidth<700},trans=function(e,t,n,s){var i,r=n&&1==n.split(" ").length,o=function(){n&&(r?e.classList.remove(n):e.style["-webkit-transition"]=""),s&&(e.style["-webkit-transform"]=""),i&&(clearTimeout(i),i=null),e.removeEventListener("webkitTransitionEnd",o,!1),t&&t()};e.addEventListener("webkitTransitionEnd",o,!1),n&&(r?e.classList.add(n):(e.style["-webkit-transition"]=n,i=setTimeout(o,parseInt(n.split(" ")[1])))),s&&(e.style["-webkit-transform"]=s)},validEmail=function(e){var t=e.indexOf("@",1),n=e.indexOf(".",t);return-1==t||-1==n||n==e.length-1||t+2>n?!1:!0},requestAnimFrame;!function(){for(var e=0,t=["ms","moz","webkit","o"],n=0;n<t.length&&!window.requestAnimationFrame;++n)window.requestAnimationFrame=window[t[n]+"RequestAnimationFrame"],window.cancelAnimationFrame=window[t[n]+"CancelAnimationFrame"]||window[t[n]+"CancelRequestAnimationFrame"];window.requestAnimationFrame||(window.requestAnimationFrame=function(t){var n=(new Date).getTime(),s=Math.max(0,16-(n-e)),i=window.setTimeout(function(){t(n+s)},s);return e=n+s,i}),requestAnimFrame=window.requestAnimationFrame,window.cancelAnimationFrame||(window.cancelAnimationFrame=function(e){clearTimeout(e)})}();