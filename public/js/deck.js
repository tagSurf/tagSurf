var deck_proto = {
	constants: {
		buffer_minimum: 5,
		stack_depth: 3
	},
	known_keys: {},
	topCard: function() {
		return this.cards[0];
	},
	refreshCards: function(zIndex) {
		var topCard = this.cards[0];
		if (this.cards.length == 1 && topCard && topCard.surfsUp)
			topCard.setFailMsg();
		else {
			slideContainer.innerHTML = "";
			for (var i = 0; i < this.constants.stack_depth; i++)
				(i < this.cards.length) && this.cards[i].build(zIndex--, this.cbs);
		}
	},
	popData: function(rdata, firstCard) {
		var i, starters = [], others = [], preloads = [];

		if (!isAuthorized())
			preloads = rdata;
		else {
			if (firstCard) this.known_keys[firstCard.id] = true;
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
			if (firstCard) this.cards.unshift(firstCard);
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
	build: function (update, firstCard) {
		var self = this;
		if (!update) {
			throbber.on();
			clearStack();
		}
		xhr(this.dataPath(firstCard), null, function(response_data) {
			var rdata = response_data.data.map(newCard);
			if (update)
				self.cardsToLoad = self.cardsToLoad.concat(self.popData(rdata));
			else {
				self.cards = [];
				self.cardsToLoad = self.cardsToLoad.concat(self.popData(rdata, firstCard).slice(self.constants.stack_depth));
				self.refreshCards(self.constants.stack_depth - 1);
			}
		}, function(response, status) {
			if (status == 401){
				messageBox("Oops", response.errors + " <br><br><i>Control Safe Surf from Options</i>");
			}
			if (!update) {
				self.cards = [];
				self.refreshCards();
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
	}
};

var cardDecks = {};
var getDeck = function(tag, firstCard, cbs){
	var deck = cardDecks[tag];
	if (deck) {
		deck.purge();
		return deck;
	}
	deck = cardDecks[tag] = Object.create(deck_proto);
	deck.cbs = cbs;
	deck.tag = tag;
	deck.shareSwap = false;
	deck.shareOffset = 0;
	deck.cards = [];
	deck.cardsToLoad = [];
	deck.build(false, firstCard);
	return deck;
};
var removeCard = function(c) {
	for (var tag in cardDecks)
		cardDecks[tag].remove(c);
};
