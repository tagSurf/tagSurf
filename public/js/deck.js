var deck_proto = {
	constants: {
		buffer_minimum: 5,
		stack_depth: 3
	},
	known_keys: {},
	topCard: function() {
		return this.cards[0];
	},
	refreshCards: function(update) {
		if (!update)
			clearStack();
		if (this.cards.length == 1 && this.topCard() && this.topCard().surfsUp) {
			this.topCard().setFailMsg();
			return;
		}
		this.deal();
		if (this.topCard() && this.topCard().surfsUp)
			this.deal();
		this.topCard().setTop();
	},
	popData: function(rdata) {
		var i, starters = [], others = [], preloads = [];

		if (!isAuthorized())
			preloads = rdata;
		else {
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
	build: function (update, firstCard) {
		var self = this;
		if (!update) {
			throbber.on(true);			
			clearStack();
		}
		xhr(this.dataPath(firstCard), null, function(response_data) {
			var rdata = response_data.data.map(newCard);
			self.cardsToLoad = self.cardsToLoad.concat(self.popData(rdata));
			if (!update) {
				self.preloadCards(3);
			}
			self.refreshCards(update);
		}, function(response, status) {
			if (status == 401){
				messageBox("Oops", response.errors + " <br><br><i>Control Safe Surf from Options</i>");
			}
			if (!update) {
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
		this.topCard() && this.topCard().setTop();
	},
	deal: function() {
		var cardbox = document.getElementById("slider");
		if(this.cards.length > 1 && (this.topCard().surfsUp || this.topCard().type == "End-Of-Feed")) {
			this.topCard().cbs.remove = null;
			this.topCard().remove();
		}
		else if (this.topCard() && this.topCard().surfsUp) {
			this.build(true);
			return;
		}
		for (var i = 0; i < cardbox.childNodes.length; i++)
			this.cards[i] && this.cards[i].showing && this.cards[i].promote();
		for (var i = cardbox.childNodes.length; i < this.constants.stack_depth; i++) {
			var c = this.cards[i];
			if (!c && this.cards[i - 1] && this.cards[i - 1].surfsUp)
				return;
			else if (!c) {
				c = this.cards[i] = newCard();
				c.show();
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
	deck.shareSwap = false;
	deck.shareOffset = 0;
	deck.cards = [];
	deck.cardsToLoad = [];	
	if (firstCard && firstCard.showing) {
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
