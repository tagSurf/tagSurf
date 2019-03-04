
var autocomplete = {
	data: null,
	nodes: {},
	inputs: {},
	handlers: {},
	viewing: {},
	populate: function() {
		xhr("/api/tags", null, function(response_data) {
			autocomplete.data = response_data.data;
			autocomplete._update();
		});
	},
	expand: function(listName, cb) {
		autocomplete.viewing[listName] = true;
		autocomplete.nodes[listName].className = "autocomplete autocomplete-open";
		cb && trans(autocomplete.nodes[listName], cb);
	},
	retract: function(listName) {
		if (!autocomplete.viewing[listName])
			return;
		autocomplete.viewing[listName] = false;
		autocomplete.inputs[listName].blur();
		var acnode = autocomplete.nodes[listName];
		acnode.className = "autocomplete";
		trans(acnode, function() {
			acnode.className = "autocomplete hider";
		});
	},
	tapTag: function(tagName, listName, insertCurrent) {
		autocomplete.handlers[listName](tagName, insertCurrent);
	    autocomplete.retract(listName);
	},
	addTag: function(tagName, listName) {
		var n = document.createElement("div");
		n.innerHTML = tagName;
		n.className = "tagline";
		var tlower = tagName.toLowerCase();
		for (var i = 1; i <= tlower.length; i++){
			if(["blackout"].includes(tlower.slice(0,i)))
				continue;
			n.className += " " + tlower.slice(0, i);
		}
		autocomplete.nodes[listName].firstChild.appendChild(n);
		n.onclick = function() {
			autocomplete.tapTag(tagName, listName);
		};
	},
	_update: function(targetList) {
		if (autocomplete.data) for (var listName in autocomplete.nodes) {
			if(targetList && targetList != listName)
				continue;
			else {
				var hasTrending = false;
				autocomplete.nodes[listName].firstChild.innerHTML = "";
				autocomplete.data.forEach(function(tag) {
					if (tag.name == "trending" && listName == "add-tag-autocomplete")
						return;
					if (tag.name) {
						hasTrending = hasTrending || tag.name == "trending";
						autocomplete.addTag(tag.name, listName);
					}
				});
				if (!hasTrending && listName != "add-tag-autocomplete")
					autocomplete.addTag("trending", listName);
			}
		}
	},
	register: function(listName, tinput, opts) {
		opts = opts || {};
		autocomplete.inputs[listName] = tinput;
		autocomplete.handlers[listName] = opts.tapCb || function() {};

		var n = autocomplete.nodes[listName] = opts.node
			|| document.getElementById(listName);
		n.appendChild(document.createElement("div"));
		drag.makeDraggable(n, { constraint: "horizontal" });

		autocomplete._update(listName);
		gesture.listen("down", tinput, returnTrue);
		gesture.listen("up", tinput, function(e) {
			if (!autocomplete.viewing[listName]) {
				opts.expandCb && opts.expandCb();
				mod({
					className: "tagline",
					show: true
				});
				autocomplete.expand(listName, function() {
					tinput.active = true;
					tinput.focus();
				});
				return true;
			}
		});
		tinput.onkeyup = function(e) {
			e = e || window.event;
			var code = e.keyCode || e.which;
			if (code == 13 || code == 3) {
				tinput.blur();
				opts.enterCb && opts.enterCb();
			} else if (tinput.value) {
				mod({
					className: "tagline",
					hide: true
				});
				var tagfrag = tinput.value.toLowerCase();
				if (tagfrag.charAt(0) == "#")
					tagfrag = tagfrag.slice(1);
				mod({
					className: tagfrag,
					show: true
				});
			} else mod({
				className: "tagline",
				show: true
			});
			opts.keyUpCb && opts.keyUpCb();
		};
	}
};
autocomplete.populate();