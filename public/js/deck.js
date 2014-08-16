var deck_proto = {
	constants: {
		buffer_minimum: 5,
		stack_depth: 3
	},
	known_keys: {},
	topCard: function() {
		return this.cards[0];
	},
	popData: function(rdata) {
		var i, starters = [], others = [], preloads = [];
		if (!isAuthorized()) {
			for (i = 0; i < rdata.length; i++) {
				if (!this.known_keys[rdata[i].id] || rdata[i].type == "login")
						preloads.push(rdata[i]);
			}
		}
		else {
			for (i = 0; i < rdata.length; i++) {
				if (!this.known_keys[rdata[i].id]) {
					var d = rdata[i];
					((!d.animated && starters.length < this.constants.stack_depth)
						? starters : others).push(d);
				}
			}
			for (i = 0; i < starters.length; i++) preloads.push(starters[i]);
			for (i = 0; i < others.length; i++) preloads.push(others[i]);
		}
		this.cards = this.cards.concat(preloads);
		return preloads;
	},
	preloadCards: function(num) {
		if (!this.cardsToLoad.length)
			return;
		var size = this.cardsToLoad.length < num ? this.cardsToLoad.length : num;
		size = size ? size : this.cardsToLoad.length;
		image.load(this.cardsToLoad.splice(0, size), window.innerWidth - 40);
	},
	dataPath: function(firstCard) {
		if (!isAuthorized()) {
			var p = "/api";
			if (this.shareSwap) {
				this.shareSwap = false;
				this.shareOffset = 0;
			}
			if (firstCard || this.tag
				!= document.location.pathname.split("/")[2])
				p += "/share/" + this.tag + "/" +
					(firstCard ? firstCard.id : 0);
			else
				p += document.location.pathname;
			return p + "/20/" + (this.shareOffset++ * 20);
		}
		return "/api/media/" + this.tag;
	},
	build: function (update, firstCard) {
		var self = this;
		self.building = true;
		if (!update) {
			throbber.on(true);			
			clearStack();
		}
		xhr(this.dataPath(firstCard), null, function(response_data) {
			var rdata = response_data.data.map(newCard);
			self.cardsToLoad = self.cardsToLoad.concat(self.popData(rdata));
			self.building = false;
			if (update)
				self.refresh();	
			else 
				self.preloadCards(self.stack_depth);
		}, function(response, status) {
			if (status == 401){
				self.cards[0] = newCard();
				self.cards[0].show();
				self.cards[0].setFailMsg();
				messageBox("Oops", response.errors + " <br><br><i>Control Safe Surf from Options</i>");
				self.building = false;
				return;
			}
			self.building = false;
			if (update)
				self.refresh();
		});
	},
	skipTutorial: function() {
		this.cards = this.cards.filter(function(card) {
			return card.type != "tutorial";
		});
	},
	purge: function() {
		this.cards = this.cards.filter(function(card) {
			return !this.known_keys[card.id];
		});
	},
	remove: function(c) {
		this.cards.splice(this.cards.indexOf(c), 1);
		if (this.cards.length < this.constants.buffer_minimum)
			this.build(true);
	},
	refresh: function() {
		this.preloadCards();
		if (this.cards.length == 1 && this.topCard() && this.topCard().surfsUp) {
			this.build(true);
			this.deal()
			if (this.topCard().surfsUp)
				this.topCard().setFailMsg();
			else
				this.topCard() && this.topCard().setTop();
			return;
		}
		this.deal();
		this.topCard() && this.topCard().setTop();
	},
	deal: function() {
		var cardbox = document.getElementById("slider"),
			self = this,
			topCard = this.topCard();
		if (this.building) {
			setTimeout(function() { self.deal(); }, 1000)
			return;
		}
		if(this.cards.length > 1 && cardbox.childNodes.length > 1 
			&& (topCard.surfsUp || topCard.type == "End-Of-Feed")) {
			this.topCard().remove();
		}
		for (var i = 0; i < cardbox.childNodes.length; i++)
			this.cards[i] && this.cards[i].showing && this.cards[i].promote();
		for (var i = cardbox.childNodes.length; i < this.constants.stack_depth; i++) {
			var c = this.cards[i];
			if (!c && this.cards[i - 1] && (this.cards[i - 1].type == "End-Of-Feed" || this.cards[i - 1].surfsUp))
				return;
			else if (!c) {
				c = this.cards[i] = newCard();
				c.show();
				return;
			}
			else
				c.show(this.cardCbs);
		}
		throbber.active && throbber.off();
	}
};

var cardDecks = {};
var getDeck = function(tag, firstCard, cardCbs){
	var deck = cardDecks[tag];
	if (deck) {
		deck.purge();
		return deck;
	}
	deck = cardDecks[tag] = Object.create(deck_proto);
	deck.cardCbs = cardCbs;
	deck.tag = tag;
	deck.shareSwap = false;
	deck.shareOffset = 0;
	deck.cards = [];
	deck.cardsToLoad = [];
	deck.building = false;	
	if (firstCard) {
		deck.cards[0] = firstCard;
		deck.known_keys[firstCard.id] = true;
		deck.deal();
		deck.build(true);
	}
	else
		deck.build(false, firstCard);
	return deck;
};
var removeFromDecks = function(c) {
	if(c.surfsUp || c.type == "End-Of-Feed")
		current_deck.remove(c);
	else
		for (var tag in cardDecks)
			cardDecks[tag].remove(c);
};
