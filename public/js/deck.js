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
					this.known_keys[d.id] = true
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
		if(DEBUG)	
			console.log("preload " + size + " cards");
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
		if(DEBUG)
			console.log("deck.build, update = " + update + " firstCard = ", firstCard);
		xhr(this.dataPath(firstCard), null, function(response_data) {
			var rdata = response_data.data.map(newCard);
			self.cardsToLoad = self.cardsToLoad.concat(self.popData(rdata));
			self.building = false;
			if (update)
				self.refresh();	
			else
				self.preloadCards(self.constants.stack_depth);
		}, function(response, status) {
			if (status == 401){
				self.cards[0] = newCard();
				self.cards[0].show();
				self.cards[0].setFailMsg();
				messageBox("Oops", response.errors + " <br><br><i>Control Safe Surf from Options</i>");
				self.building = false;
				return;
			}
			if(DEBUG)
				console.log("deck.build xhr error");
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
		if(DEBUG)
			console.log("purge deck");
		this.cards = this.cards.filter(function(card) {
			return !deck_proto.voted_keys[card.id];
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
		if(DEBUG)
			console.log("Remove card ", c, " from deck #" + this.tag);
		if (this.cards.length < this.constants.buffer_minimum)
			this.build(true);
	},
	refresh: function() {
		this.preloadCards();
		if(DEBUG)
			console.log("deck.refresh");
		if (this.cards.length == 1 && this.topCard() && !this.building && (this.topCard().surfsUp || this.topCard().type == "End-Of-Feed")) {
			if(DEBUG)
				console.log("deck.refresh calls deck.build");
			this.build(true);
			this.deal()
			if(DEBUG)
				console.log("deck.refresh calls deck.deal");
			if (this.topCard().surfsUp && this.topCard().type != "content" && !this.building)
				this.topCard().setFailMsg();
			else
				this.topCard() && this.topCard().setTop();
			return;
		}
		this.deal();
		if(DEBUG)
			console.log("deck.refresh calls deck.deal");
		this.topCard() && this.topCard().setTop();
	},
	deal: function() {
		var cardbox = document.getElementById("slider"),
			self = this,
			topCard = this.topCard();
		if (this.building) {
			setTimeout(function() { self.deal(); }, 3000)
			if(DEBUG)
				console.log("Delay deal because deck is building");
			return;
		}
		if (this.cards.length > 1 && (this.topCard().surfsUp || this.topCard().type == "End-Of-Feed") 
			&& this.topCard().type != "content") {
			if(DEBUG)
				console.log("Removed top card #" + this.topCard().id + " cards.length = " + this.cards.length + " cardbox.length = " + cardbox.childNodes.length + " card.surfsUp = " + this.topCard().surfsUp + " card = ", this.topCard());
			this.topCard().remove();
		}
		if (this.topCard().zIndex < this.constants.stack_depth){
			var indexCatchUp = this.constants.stack_depth - this.topCard().zIndex;
			for (var i = 0; i < indexCatchUp; i++) {
				for (var f = 0; f < cardbox.childNodes.length; f++)
					this.cards[f] && this.cards[f].showing && this.cards[f].promote();
			}
		}
		for (var i = cardbox.childNodes.length; i < this.constants.stack_depth; i++) {
			var c = this.cards[i];
			if (!c && this.cards[i - 1] && (this.cards[i - 1].type == "End-Of-Feed" || this.cards[i - 1].surfsUp)) {
				if(DEBUG)				
					console.log("Skip deal because reached end of cards and last card is set");
				return;
			} else if (!c) {
				c = this.cards[i] = newCard();
				if(DEBUG)
					console.log("Create new throbber card, i = " + i + "cards.length = " + this.cards.length + " cardbox.length = " + cardbox.childNodes.length);
				c.show();
				return;
			} else 
				c.show(this.cardCbs, this.constants.stack_depth - i);
		}
		// if (this.cards[1] && this.cards[1].surfsUp && this.cards[1].type == "content") {
		// 	this.cards[1].unshow();
		// 	this.cards.splice((this.cards.length-1), 0, this.cards.splice(1, 1)[0]);
		// 	this.cards[1] && this.cards[1].showing && this.cards[1].promote();
		// }
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
	deck.known_keys = {};
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
