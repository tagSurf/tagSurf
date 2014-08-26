var deck_proto = {
	constants: {
		buffer_minimum: 5,
		stack_depth: 3,
		login_spacing: 5
	},
	voted_keys: {},
	topCard: function() {
		return this.cards[0];
	},
	popData: function(rdata) {
		var i, d, preloads = [];
		for (i = 0; i < rdata.length; i++) {
			d = rdata[i];
			if ((!this.known_keys[d.id] && !this.voted_keys[d.id]) || d.type == "login") {
				this.known_keys[d.id] = true
				preloads.push(d);
			}
		}
		return preloads;
	},
	cardLoaded: function(c) {
		this.cards.push(c);
		this.deal();
	},
	dataPath: function() {
		if (!isAuthorized()) {
			var p = "/api";
			if (this.firstCard || this.tag
				!= document.location.pathname.split("/")[2])
				p += "/share/" + this.tag + "/" +
					(this.firstCard ? this.firstCard.id : 0);
			else
				p += document.location.pathname;
			return p + "/20/" + (this.shareOffset++ * 20);
		}
		return "/api/media/" + this.tag;
	},
	refill: function () {
		if (this.refilling || (this.cards.length + image.loadCount()
			>= this.constants.buffer_minimum))
			return;
		var self = this;
		self.refilling = true;
		xhr(this.dataPath(), null, function(response_data) {
			self.refilling = false;
			image.load(self.popData(response_data.data.map(newCard)),
				window.innerWidth - 40, function(c) {
					self.cardLoaded(c);
				});
		});
	},
	skipTutorial: function() {
		this.cards = this.cards.filter(function(card) {
			return card.type != "tutorial";
		});
		this.refill();
		this.deal();
	},
	purge: function() {
		if (DEBUG)
			console.log("purge deck #" + this.tag);
		this.cards = this.cards.filter(function(card) {
			return !deck_proto.voted_keys[card.id];
		});
		if (this.shareDeck)
			this.spaceLoginCards();
	},
	removeLoginCards: function () {
		this.cards = this.cards.filter(function(card){
			return card.type != "login";
		});
	},
	spaceLoginCards: function() {
		if (!this.shareDeck)
			return;
		var loginCard;
		for (i = 0; i < this.cards.length; i++) {
			if (this.cards[i].type == "login") {
				loginCard = this.cards.splice(i, 1)[0];
				break;
			}
		}
		this.removeLoginCards();
		for (i = this.constants.login_spacing; i < this.cards.length; i += this.constants.login_spacing)
			this.cards.splice(i, 0, loginCard);
	},
	remove: function(c) {
		if (this.cards.indexOf(c) != -1) {
			this.cards.splice(this.cards.indexOf(c), 1);
			if (DEBUG)
				console.log("Remove card ", c, " from deck #" + this.tag);
		}
		if (current_deck == this)
			this.refill();
	},
	deal: function() {
		var i, c, slider = document.getElementById("slider");
		for (i = 0; i < this.constants.stack_depth; i++) {
			c = this.cards[i];
			if (!c) break;
			if (i < slider.childNodes.length)
				c.promote();
			else
				c.show();
		}
		this.topCard() && throbber.off();
	}
};

var cardDecks = {};
var getDeck = function(tag, firstCard, cardCbs){
	var deck = cardDecks[tag];
	if (deck) {
		deck.purge();
		deck.refill();
		return deck;
	}
	deck = cardDecks[tag] = Object.create(deck_proto);
	deck.cardCbs = cardCbs;
	deck.tag = tag;
	deck.known_keys = {};
	deck.shareDeck = !isAuthorized();
	deck.shareOffset = 0;
	deck.cards = [];
	if (firstCard) {
		deck.cards[0] = deck.firstCard = firstCard;
		deck.known_keys[firstCard.id] = true;
		image.load(deck.cards, window.innerWidth - 40,
			function() { deck.deal(); });
	}
	deck.refill();
	return deck;
};
var removeFromDecks = function(c) {
	if(c.type == "waves" || c.type == "End-Of-Feed" || c.type == "login")
		current_deck.remove(c);
	else
		for (var tag in cardDecks)
			cardDecks[tag].remove(c);
};
