var deck_proto = {
	constants: {
		buffer_minimum: 5,
		stack_depth: 3
	},
	known_keys: {},
	topCard: function() {
		if (this.cards[0])
			return this.cards[0];
		else if (this.firstCard)
			return this.firstCard;
	},
	refreshCards: function(zIndex, update) {
		var topCard = this.cards[0];
		if (this.cards.length == 1 && topCard && topCard.surfsUp)
			topCard.setFailMsg();
		else if (!update)
			clearStack()
		this.deal();
	},
	popData: function(rdata) {
		var i, starters = [], others = [], preloads = [];

		if (!isAuthorized())
			preloads = rdata;
		else {
			if (this.firstCard) this.known_keys[this.firstCard.id] = true;
			for (i = 0; i < rdata.length; i++) {
				if (!this.known_keys[rdata[i].id]) {
					var d = rdata[i];
					((!d.animated && starters.length < 3)
						? starters : others).push(d);
					this.known_keys[d.id] = true;
				}
			}
			for (i = 0; i < starters.length; i++) preloads.push(starters[i]);
			for (i = 0; i < others.length; i++) preloads.push(others[i]);
			if (this.firstCard && (this.firstCard != this.cards[0])) this.cards.unshift(this.firstCard);
			else if (this.firstCard) this.cards.splice(1, 1, this.firstCard);
		}

		this.cards = this.cards.concat(preloads);
		return preloads;
	},
	preloadCards: function() {
		if (this.cardsToLoad.length) {
			image.load(this.cardsToLoad, window.innerWidth - 40);
			this.cardsToLoad = [];
		}
	},
	dataPath: function(firstCard) {
		if (!isAuthorized()) {
			var p = "/api";
			if (this.shareSwap) {
				this.shareSwap = false;
				this.shareOffset = 0;
			}
			if (firstCard || current_tag
				!= document.location.pathname.split("/")[2])
				p += "/share/" + current_tag + "/" +
					(firstCard ? firstCard.id : 0);
			else
				p += document.location.pathname;
			return p + "/20/" + (this.shareOffset++ * 20);
		}
		return "/api/media/" + current_tag;
	},
	build: function (update) {
		var self = this;
		if (!update && this.firstCard && !this.firstCard.showing) {
			throbber.on();			
			clearStack();
		}
		xhr(this.dataPath(this.firstCard), null, function(response_data) {
			var rdata = response_data.data.map(newCard);
			if (update)
				self.cardsToLoad = self.cardsToLoad.concat(self.popData(rdata));
			else {
				self.cards = [];
				self.cardsToLoad = self.cardsToLoad.concat(self.popData(rdata, self.firstCard).slice(self.constants.stack_depth));
				self.refreshCards(self.constants.stack_depth - 1);
			}
		}, function(response, status) {
			if (status == 401){
				messageBox("Oops", response.errors + " <br><br><i>Control Safe Surf from Options</i>");
			}
			if (!update) {
				self.cards = [];
				self.refreshCards(update);
			}
		});
	},
	skipTutorial: function() {
		this.cards = this.cards.filter(function(card) {
			return card.type != "tutorial";
		});
	},
	purge: function() {
		// get rid of old cards, etc
		//   - use known_keys
	},
	remove: function(c) {
		this.cards.splice(this.cards.indexOf(c), 1);
		if (this.cards.length < this.constants.buffer_minimum)
			this.build(true);
	},
	refresh: function() {
		this.preloadCards();
		this.deal();
		var topCard = this.topCard();
		topCard && topCard.setTop();
	},
	deal: function() {
		var cardbox = document.getElementById("slider");
		if(this.cards.length > 1 && (this.topCard().surfsUp || this.topCard().type == "End-Of-Feed"))
			this.topCard().remove(this.topCard());
		else if (this.topCard().surfsUp) {
			this.build(true);
			return;
		}
		for (var i = 0; i < cardbox.childNodes.length; i++)
			this.cards[i].showing && this.cards[i].promote();
		for (var i = cardbox.childNodes.length; i < this.constants.stack_depth; i++) {
			var c = this.cards[i];
			if (!c && this.cards[i - 1] && this.cards[i - 1].surfsUp)
				return;
			else if (!c) {
				c = newCard();
				c.show(this.cardCbs);
				return;
			}
			else
				c.show(this.cardCbs);
		}
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
	deck.firstCard = firstCard;
	deck.shareSwap = false;
	deck.shareOffset = 0;
	deck.cards = [];
	deck.cardsToLoad = [];
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
