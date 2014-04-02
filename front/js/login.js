onload = function() {
	document.getElementById("ts-login-btn").onclick = function() {
		var e = document.getElementById("email").value;
		var p = document.getElementById("password").value;
		if (!e || !p)
			return alert("please provide your email and password");
		document.cookie = "ts=" + e;
		window.location = "feed.html";
	};
};