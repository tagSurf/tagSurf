var swipeCss = 
{
	translationScale: 1.35,
	rotationScale: 0.075,
	bound: window.innerWidth,
	style: document.createElement('style'),
	_init: function () 
	{
		swipeCss.style.type = "text/css";
		swipeCss.style.rel = "stylesheet";
	},
	_build: function ()
	{
		var i = -swipeCss.bound, animationString = "", animationTitle, 
			translateQuantity, rotateQuantity, sign;
		for (;i < swipeCss.bound; ++i)
		{
			sign = (translateQuantity < 0) ? "-" : "";
			translateQuantity = Math.round(i * swipeCss.translationScale);
			rotateQuantity = Math.round(i * swipeCss.rotationScale);
			animationString += "@keyframes swipe_animation" + translateQuantity;
			animationString += "{0%{transform: translate3d(" + translateQuantity + "px,0,0) rotate(" + rotateQuantity + "deg); -webkit-transform: translate3d(" + translateQuantity + "px,0,0) rotate(" + rotateQuantity + "deg);}";
			animationString += "100%{transform: translate3d("+sign+"600px,0,0) rotate("+sign+"60deg); -webkit-transform: translate3d("+sign+"600px,0,0) rotate("+sign+"60deg);}}";
			animationString += "@-webkit-keyframes swipe_animation" + translateQuantity;
			animationString += "{0%{transform: translate3d(" + translateQuantity + "px,0,0) rotate(" + rotateQuantity + "deg); -webkit-transform: translate3d(" + translateQuantity + "px,0,0) rotate(" + rotateQuantity + "deg);}";
			animationString += "100%{transform: translate3d("+sign+"600px,0,0) rotate("+sign+"60deg); -webkit-transform: translate3d("+sign+"600px,0,0) rotate("+sign+"60deg);}}";
		}
		swipeCss.style.innerHTML = animationString;
	},
	build: function ()
	{
		swipeCss._init();
		swipeCss._build();
		document.getElementsByTagName("head")[0].appendChild(swipeCss.style);
	}
};
swipeCss.build();
