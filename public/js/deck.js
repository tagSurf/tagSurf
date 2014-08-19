var deck_proto = {
	constants: {
		buffer_minimum: 5,
		stack_depth: 3,
		login_spacing: 4
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
		if (DEBUG)	
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
		if (this.building)
			return;
		var self = this;
		self.building = true;
		if (DEBUG)
			console.log("deck.build, update = " + update + " firstCard = ", firstCard);
		xhr(this.dataPath(firstCard), null, function(response_data) {
			var rdata = response_data.data.map(newCard);
			self.cardsToLoad = self.cardsToLoad.concat(self.popData(rdata));
			self.building = false;
			console.log("deck build complete");
			self.build_retry = false;
			if (update)
				self.preloadCards();	
			else
				self.preloadCards(self.constants.stack_depth);
		}, function(response, status) {
			if (status == 401){
				self.building = false;
				messageBox("Oops", response.errors 
					+ "<br/><br/><i>Control Safe Surf from Options</i>");
				self.deal();
				return;
			}
			if (DEBUG)
				console.log("deck.build xhr error");
			self.building = false;
			self.build_retry = !self.build_retry
			if (self.build_retry){
				self.deal();
				throbber.active && throbber.off();	
				self.refresh();
			}
		});
	},
	skipTutorial: function() {
		this.cards = this.cards.filter(function(card) {
			return card.type != "tutorial";
		});
		this.refresh();
	},
	purge: function() {
		if (DEBUG)
			console.log("purge deck");
		this.cards = this.cards.filter(function(card) {
			return !deck_proto.voted_keys[card.id];
		});
		if (this.shareDeck) {
			// re-space login cards in deck after purge
			var cardsSinceLoginCard = 0;
			for (i = 0; i < this.cards.length; ++i) {
				if (this.cards[i].type != "login") {
					++cardsSinceLoginCard;
					continue;
				}
				if (cardsSinceLoginCard < this.constants.login_spacing) {
					var loginCard = this.cards[i], pushIndex,
						diff = this.constants.login_spacing - cardsSinceLoginCard;
						diff = diff < 0 ? this.constants.login_spacing + Math.abs(diff) : diff; 
						pushIndex = i + diff < this.cards.length - 1 ? i + diff : this.cards.length - 1;
					if ((this.cards[pushIndex] == "login") && (pushIndex != i)) {
						this.cards.splice(i, 1);
						--i;
						continue;
					} else {
						this.cards.splice(pushIndex, 0, this.cards.splice(i, 1)[0]);
						++cardsSinceLoginCard;
						continue;
					}
				}
				cardsSinceLoginCard = 0;
			}
		}
	},
	remove: function(c) {
		if (this.cards.indexOf(c) != -1) {
			this.cards.splice(this.cards.indexOf(c), 1);
			if (DEBUG)
				console.log("Remove card ", c, " from deck #" + this.tag);
		}
		if (current_deck == this)
			this.refresh();
	},
	refresh: function() {
		this.preloadCards();
		if (this.cards.length < this.constants.buffer_minimum)
			this.build(true);
	},
	demoteCard: function (c, positions) {
		if (this.cards.indexOf(c) != -1) {
			var currentIndex = this.cards.indexOf(c),
				newIndex = currentIndex + positions < this.cards.length - 1 ? 
					currentIndex + positions : this.cards.length - 1; 
			for (var i = 0; i < (newIndex - currentIndex); i++)
				c.demote(); 
			this.cards.splice(newIndex, 0, this.cards.splice(currentIndex, 1)[0]);
			if (currentIndex < this.constants.stack_depth)
				this.deal();
		}
	},
	promoteCard: function (c, positions) {
		if (this.cards.indexOf(c) != -1) {
			var currentIndex = this.cards.indexOf(c),
				newIndex = currentIndex - positions >= 0 ? currentIndex - positions : 0; 
			for (var i = currentIndex; i > (currentIndex - newIndex); i--)
				c.promote();
			this.cards.splice(newIndex, 0, this.cards.splice(currentIndex, 1)[0]);
			if (newIndex < this.constants.stack_depth)
				this.deal();
		}
	},
	deal: function() {
		// deck dealer
		console.log("deck.deal");
		var cardbox = document.getElementById("slider"),
			self = this;
		if (this.building && (this.cards.length < 1 || this.topCard().type == "waves")) {
			// Delay deal until update is complete
			setTimeout(function() { self.deal(); }, 3000)
			if(DEBUG)
				console.log("Delay deal because deck is building");
			return;
		}
		if (!this.topCard())
			return;
		if (this.cards.length == 1 && this.topCard().type == "End-Of-Feed" && this.topCard().showing)
			return;
		else if (this.cards.length == 1 && this.topCard().type == "waves")
			this.topCard().setFailMsg();
		if (this.cards.length > 1 && (this.topCard().type == "waves" || this.topCard().type == "End-Of-Feed")) {
			if(DEBUG)
				console.log("Removed top card #" + this.topCard().id + " cards.length = " + this.cards.length + " cardbox.length = " + cardbox.childNodes.length + " card.surfsUp = " + this.topCard().surfsUp + " card = ", this.topCard());
			this.topCard().remove();
		}
		!this.topCard().showing && this.topCard().show(this.cardCb, this.constants.stack_depth);
		if (this.topCard().zIndex < this.constants.stack_depth) {
			// If top card needs promoting
			var zIndexCatchUp = this.constants.stack_depth - this.topCard().zIndex;
			for (var i = 0; i < zIndexCatchUp; i++) {
				// Promote all visible cards as many times as top card needs promoting
				for (var f = 0; f < cardbox.childNodes.length; f++)
					this.cards[f] && this.cards[f].showing && this.cards[f].promote();
			}
		}
		for (var i = cardbox.childNodes.length; i < this.constants.stack_depth; i++) {
			var c = this.cards[i];
			if (!c && this.cards[i - 1] && (this.cards[i - 1].type == "End-Of-Feed" 
				|| this.cards[i - 1].type == "waves")) {
				if(DEBUG)				
					console.log("Skip deal because reached end of cards and last card is set");
				return;
			} else if (c && c.type == "waves" && this.cards[i + 1]) {
				c.remove(null);
				if (!this.cards[i].showing)
					this.cards[i].show(this.cardCbs, this.constants.stack_depth - i)
				else
					for (var f = i; f < cardbox.childNodes.length; f++)
						this.cards[f] && this.cards[f].showing && this.cards[f].promote();
			} else if (!c) {
				c = this.cards[i] = newCard();
				if (DEBUG)
					console.log("Create new throbber card, i = " + i + " cards.length = " + this.cards.length + " cardbox.length = " + cardbox.childNodes.length);
				c.show();
				return;
			} else 
				c.show(this.cardCbs, this.constants.stack_depth - i);
		}
		if (this.cards[1] && this.cards[1].surfsUp && this.cards[1].type == "content" 
			&& this.cards[2] && !this.cards[2].surfsUp) {
			if (this.cards.length > this.constants.stack_depth) {
				console.log("Punted card because it wasn't ready to be shown");
				this.demoteCard(this.cards[1], this.cards.length - 1);
			} 
			else 
				this.cards[1].remove();
		}
		throbber.active && throbber.off();
		this.dealing = false;
	}
};

var cardDecks = {};
var getDeck = function(tag, firstCard, cardCbs){
	var deck = cardDecks[tag];
	if (deck) {
		deck.purge();
		deck.refresh();
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
	deck.build_retry = false;	
	if (firstCard) {
		deck.cards[0] = firstCard;
		deck.known_keys[firstCard.id] = true;
		deck.deal();
		deck.build(true);
	}
	else {
		var c = deck.cards[0] = newCard();
		c.show();
		deck.build(false);
	}
	return deck;
};
var removeFromDecks = function(c) {
	if(c.surfsUp || c.type == "End-Of-Feed")
		current_deck.remove(c);
	else
		for (var tag in cardDecks)
			cardDecks[tag].remove(c);
};
