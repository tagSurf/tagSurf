var deck_proto = {
	constants: {
		buffer_minimum: 5,
		stack_depth: 3,
		login_spacing: 5
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
		console.log("preload cards");
	},
	dataPath: function(firstCard) {
		if (!isAuthorized()) {
			var p = "/api";
			this.shareDeck = true;
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
		if (!update) {
			throbber.on(true);			
			clearStack();
			self.building = true;
		}
		console.log("deck build, update = " + update + " firstCard = ", firstCard);
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
			console.log("deck build xhr error");
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
		console.log("purge deck");
		this.cards = this.cards.filter(function(card) {
			return !deck_proto.known_keys[card.id];
		});
		if (this.shareDeck) {
			var cards_since_last_login = 0;
			for (i = 0; i < this.cards.length; ++i) {
				if (this.cards[i].type != "login")
					++cards_since_last_login;
				else {
					if (cards_since_last_login < (this.constants.login_spacing - 1)) {
						var login_card = this.cards[i],
							push_index = cards_since_last_login - (this.constants.login_spacing - 1);
						if (this.cards[i+push_index].type != "login")
							this.cards.splice((i+push_index), 0, login_card);
						else
							this.cards.splice(i, 1);
					}
					cards_since_last_login = 0;
				}
			}
		}
	},
	remove: function(c) {
		this.cards.splice(this.cards.indexOf(c), 1);
		console.log("remove c from deck #" + this.tag + " card = ", c);
		if (this.cards.length < this.constants.buffer_minimum)
			this.build(true);
	},
	refresh: function() {
		this.preloadCards();
		console.log("deck refresh");
		if (this.cards.length == 1 && this.topCard() && this.topCard().surfsUp) {
			console.log("refresh calls build");
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
			console.log("delay deal because deck is building");
			return;
		}
		if (this.cards.length > 1 && cardbox.childNodes.length > 1 
			&& (topCard.surfsUp || topCard.type == "End-Of-Feed")) {
			console.log("removed top card", this.topCard());
			console.log("cards.length = " + this.cards.length + " cardbox.length = " + cardbox.childNodes.length);
			this.topCard().remove();
		}
		if (this.topCard().zIndex < this.constants.stack_depth)
			for (var i = 0; i < cardbox.childNodes.length; i++) {
				this.cards[i] && this.cards[i].showing && this.cards[i].promote();
				console.log("promote cards");
				console.log("cards.length = " + this.cards.length + " cardbox.length = " + cardbox.childNodes.length);
			}
		for (var i = cardbox.childNodes.length; i < this.constants.stack_depth; i++) {
			var c = this.cards[i];
			if (!c && this.cards[i - 1] && (this.cards[i - 1].type == "End-Of-Feed" || this.cards[i - 1].surfsUp)) {
				console.log("Skip deal because reached end of cards and last card is set");
				return;
			}
			else if (!c) {
				c = this.cards[i] = newCard();
				console.log("create throbber card, i = " + i);
				console.log("cards.length = " + this.cards.length + " cardbox.length = " + cardbox.childNodes.length);
				c.show();
				return;
			}
			else {
				c.show(this.cardCbs);
				console.log("show bottom card. i = " + i);
			}
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
	deck.shareDeck = false;
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
