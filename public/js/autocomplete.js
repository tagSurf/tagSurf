var autocomplete = {
	data: null,
	nodes: {},
	handlers: {},
	populate: function() {
		xhr("/api/tags", null, function(response_data) {
			autocomplete.data = response_data.data;
			autocomplete._update();
		});
	},
	expand: function(listName, cb) {
	    autocomplete.nodes[listName].className = "autocomplete-open";
		cb && trans(autocomplete.nodes[listName], cb);
	},
	retract: function(listName) {
	    autocomplete.nodes[listName].className = "";
	},
	tapTag: function(tagName, listName, insertCurrent) {
		closeAutoComplete(tagName, !!insertCurrent);
		autocomplete.handlers[listName](tagName, insertCurrent);
	},
	addTag: function(tagName, listName) {
		var n = document.createElement("div");
		n.innerHTML = tagName;
		n.className = "tagline";
		var tlower = tagName.toLowerCase();
		for (var i = 1; i <= tlower.length; i++)
			n.className += " " + tlower.slice(0, i);
		autocomplete.nodes[listName].appendChild(n);
		n.onclick = function() {
			autocomplete.tapTag(tagName, listName);
		};
	},
	_update: function() {
		if (autocomplete.data) for (var listName in autocomplete.nodes) {
			var hasTrending = false;
			autocomplete.data.forEach(function(tag) {
				if (tag.name) {
					hasTrending = hasTrending || tag.name == "trending";
					autocomplete.addTag(tag.name, listName);
				}
			});
			if (!hasTrending)
				autocomplete.addTag("trending", listName);
		}
	},
	register: function(listName, cb, node) {
		autocomplete.handlers[listName] = cb || function() {};
		autocomplete.nodes[listName] = node || document.getElementById(listName);
		autocomplete._update();
	}
};
autocomplete.populate();