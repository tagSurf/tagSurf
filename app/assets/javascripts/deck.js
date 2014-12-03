var deck_proto = {
	constants: {
		buffer_minimum: 5,
		stack_depth: 3,
		login_spacing: 15,
		retries: 2
	},
	voted_keys: {},
	topCard: function() {
		return this.cards[0];
	},
	shouldPromote: function() {
		var topCard = this.topCard();
		return topCard && topCard.zIndex < this.constants.stack_depth;
	},
	popData: function(rdata) {
		var i, d, preloads = [];
		for (i = 0; i < rdata.length; i++) {
			d = rdata[i];
			if (d.type == "login") {
				this.loginCard = d;
			} else if ((!this.known_keys[d.id] && !this.voted_keys[d.id])) {
				this.known_keys[d.id] = true
				preloads.push(d);
			} else if (preloads.length == 0 && this.cards.length == 0) {
				this.deal();
			}
		}
		return preloads;		
	},
	cardLoaded: function(c) {
		c.isLoaded = true;
		console.log("card loaded for deck #" + this.tag);
		this.cards.push(c);
		if (this.shareDeck) {
			this.shareIndex += 1;
			if (!(this.shareIndex % this.constants.login_spacing))
				this.cards.push(this.loginCard);
		}
		this.deal();
	},
	dataPath: function() {
		if (!isAuthorized()) {
			var p = "/api",
				path = document.location.pathname;
			if (this.firstCard || this.tag
				!= path.split("/")[2])
				p += "/share/" + this.tag + "/" +
					(this.firstCard ? this.firstCard.id : 0);
			else
				p += path;
			return p + "/20/" + (this.shareOffset++ * 20);
		}
		return "/api/media/" + this.tag;
	},
	refill: function () {
		console.log("deck.refill called #" + this.tag);
		if (this.refilling)
			return;
		var self = this;
		console.log("deck.refill executed #" + this.tag);
		self.refilling = true;
		xhr(this.dataPath(), null, function(response_data) {
			self.refilling = false;
			console.log("card get successful");
			image.load(self.popData(response_data.data.map(newCard)),
				window.innerWidth - 40, function(c) {
					self.cardLoaded(c);
				});
			self.retries = 0;
			self.refillTimeout = 500;
		}, function(response, status) {
			DEBUG && console.log("deck.refill xhr error");
			self.refilling = false;
			if (status == 401) {
				cardCbs.notSafe();
				messageBox("Sorry, no #" + self.tag, response.errors
					+ "<br><br>Control Safe Surf from Options");
			} else if (status == 404) {
				if (self.retries < self.constants.retries) {
					self.retries += 1;
					setTimeout(function() { self.refill(); }, self.refillTimeout);
					self.refillTimeout *= 2;
				}
				else {
					self.getEndCard().setFailMsg();
					self.fadeIn(true);
					self.retries = 0;
					self.refillTimeout = 500;
				}
			} else {
				self.retries += 1;
				self.refillTimeout *= 2;
				setTimeout(function() { self.refill(); }, self.refillTimeout);
			}
		});
	},
	skipTutorial: function() {
		this.cards = this.cards.filter(function(card) {
			return card.type != "tutorial";
		});
		this.deal();
	},
	removeLoginCards: function () {
		this.cards = this.cards.filter(function(card){
			return card.type != "login";
		});
		this.deal();
	},
	shift: function() {
		this.cards.shift();
		this.deal();
	},
	purge: function() {
		if (DEBUG)
			console.log("purge deck #" + this.tag);
		this.cards = this.cards.filter(function(card) {
			return !deck_proto.voted_keys[card.id];
		});
	},
	getEndCard: function() {
		if (!slideContainer.childNodes.length) {
			this._endCard = newCard();
			this._endCard.show();
		}
		return this._endCard;
	},
	fadeIn: function(force) {
		var topCard = this.topCard();
		if (throbber.active && (force || (topCard && topCard.isLoaded))) {
			scrollContainer.style.opacity = 1;
			throbber.off();
		}
	},
	deal: function() {
		if (this != current_deck)
			return;

		var i, c, shouldPromote = this.shouldPromote(),
			numCards = slideContainer.childNodes.length - 1;
		console.log('deck.deal for deck #' + this.tag);
		this.getEndCard();
		for (i = 0; i < this.constants.stack_depth; i++) {
			c = this.cards[i];
			if (!c) break;
			if (i >= numCards)
				c.show();
			else if (shouldPromote)
				c.promote();
		}
		this.fadeIn();
		if ((this.cards.length + image.loadCount()) <= this.constants.buffer_minimum)
			this.refill();
	}
};

var cardDecks = {};
var noLoad = function(d) {
	if (DEBUG)
		console.log("Image load error on card #" + d.id);
	analytics.track("Image Load Error", {
		card: d.id,
		surfing: current_tag
	});
};
var setDeck = function(tag, firstCard){
	var deck = cardDecks[tag];
	if (deck) {
		current_deck = deck;
		deck.purge();
		deck.deal();
		return;
	}
	current_deck = deck = cardDecks[tag] = Object.create(deck_proto);
	deck.tag = tag;
	deck.known_keys = {};
	deck.shareDeck = !isAuthorized();
	deck.shareOffset = 0;
	deck.shareIndex = 0;
	deck.retries = 0;
	deck.refillTimeout = 500;
	deck.cards = [];
	if (firstCard) {
		deck.cards[0] = deck.firstCard = firstCard;
		deck.known_keys[firstCard.id] = true;
		image.load(deck.cards, window.innerWidth - 40, function() {
			deck.firstCard.isLoaded = true;
			deck.deal();
		}, noLoad);
	}
	deck.refill();
};
