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
				if ((!this.known_keys[rdata[i].id] && !this.voted_keys[rdata[i].id]) || rdata[i].type == "login")
						preloads.push(rdata[i]);
			}
		}
		else {
			for (i = 0; i < rdata.length; i++) {
				if (!this.known_keys[rdata[i].id] && !this.voted_keys[rdata[i].id]) {
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
			else {
				self.preloadCards(self.constants.stack_depth);
				if (self.shareDeck)
					self.spaceLoginCards();
			}
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
			this.spaceLoginCards();
		}
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
		this.cards = this.cards.filter(function(card){
			return card.type != "login";
		});
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
			// splice card from current position and insert it into new index with 0 removals
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
			// splice card from current position and insert it into new index with 0 removals
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
		// If the deck is building and there are no cards to deal
		if (this.building && (this.cards.length < 1 || this.topCard().type == "waves")) {
			// Delay deal until update is complete
			setTimeout(function() { self.deal(); }, 3000)
			if(DEBUG)
				console.log("Delay deal because deck is building");
			return;
		}
		// If no topCard, there is nothing to deal
		if (!this.topCard())
			return;
		// If topCard is an End-Of-Feed card with no cards behind it and it's showing there is nothing to deal
		if (this.cards.length == 1 && this.topCard().type == "End-Of-Feed" && this.topCard().showing)
			return;
		// If topCard is waves and there are no cards left in the deck set End-Of-Feed
		else if (this.cards.length == 1 && this.topCard().type == "waves")
			this.topCard().setFailMsg();
		// If there are cards in the deck and the topCard is waves or End-Of-Feed remove it
		if (this.cards.length > 1 && (this.topCard().type == "waves" || this.topCard().type == "End-Of-Feed")) {
			if(DEBUG)
				console.log("Removed top card #" + this.topCard().id + " cards.length = " + this.cards.length + " cardbox.length = " + cardbox.childNodes.length + " card.surfsUp = " + this.topCard().surfsUp + " card = ", this.topCard());
			this.topCard().remove();
		}
		// If topCard isn't showing, show it on top of stack
		!this.topCard().showing && this.topCard().show(this.cardCb, this.constants.stack_depth);
		// If topCard needs promoting...
		if (this.topCard().zIndex < this.constants.stack_depth) {
			var zIndexCatchUp = this.constants.stack_depth - this.topCard().zIndex;
			for (var i = 0; i < zIndexCatchUp; i++) {
				// Promote all visible cards as many times as topCard needs promoting
				for (var f = 0; f < cardbox.childNodes.length; f++)
					this.cards[f] && this.cards[f].showing && this.cards[f].promote();
			}
		}
		// If second card needs promoting
		if (this.cards[1] && this.cards[1].zIndex < this.constants.stack_depth - 1)
			// promote it 
			for (var i = 1; i < cardbox.childNodes.length; i++)
				this.cards[i] && this.cards[i].showing && this.cards[i].promote();
		// For as many cards as are missing from the table
		for (var i = cardbox.childNodes.length; i < this.constants.stack_depth; i++) {
			var c = this.cards[i];
			// If this is end of deck and waves or End-Of-Feed card is last one, end deal
			if (!c && this.cards[i - 1] && (this.cards[i - 1].type == "End-Of-Feed" 
				|| this.cards[i - 1].type == "waves")) {
				if(DEBUG)				
					console.log("Skip deal because reached end of cards and last card is set");
				return;
			} 
			// If there is a waves card with another card behind it, remove it
			else if (c && c.type == "waves" && this.cards[i + 1]) {
				c.remove(null);
				//If the new card isn't showing
				if (!this.cards[i].showing)
					// Show it
					this.cards[i].show(this.cardCbs, this.constants.stack_depth - i)
				else
					// If it's showing, promote it and all cards behind it
					for (var f = i; f < cardbox.childNodes.length; f++)
						this.cards[f] && this.cards[f].showing && this.cards[f].promote();
			} 
			// If there is not a card and the previous card is not waves
			else if (!c) {
				// Make a new waves card and show it, then end the deal
				c = this.cards[i] = newCard();
				if (DEBUG)
					console.log("Create new throbber card, i = " + i + " cards.length = " + this.cards.length + " cardbox.length = " + cardbox.childNodes.length);
				c.show();
				return;
			} 
			// Show the next card in the deck
			else 
				c.show(this.cardCbs, this.constants.stack_depth - i);
		}
		// If the second and third cards do not have populated images
		if (!this.shareDeck && this.cards[1] && this.cards[1].surfsUp && this.cards[1].type == "content" 
			&& ((this.cards[2] && !this.cards[2].surfsUp) || (this.cards[3] && !this.cards[3].surfsUp))) {
			// If there are more cards in the deck than on the table
			if (this.cards.length > this.constants.stack_depth) {
				if (DEBUG)
					console.log("Punted card #" + this.cards[1].id + " because it wasn't ready to be shown");
				// Send the unpopulated card to back of deck to give time for image load
				this.demoteCard(this.cards[1], this.cards.length - 1);
			} 
			// If what's on the table is all that's left, remove the unpopulated card
			else {
				this.cards[1].remove();
				if (DEBUG)
					console.log("Removed card #" + this.cards[1].id + " because it wasn't ready to be shown");
			}
		}
		// Turn throbber off
		throbber.active && throbber.off();
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
	if(c.type == "waves" || c.type == "End-Of-Feed" || c.type == "login")
		current_deck.remove(c);
	else
		for (var tag in cardDecks)
			cardDecks[tag].remove(c);
};
