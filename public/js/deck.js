var deck = {
	constants: {
		buffer_minimum: 5,
		stack_depth: 3
	},
	cardIndex: 0,
	topCard: null,
	shareSwap: false,
	shareOffset: 0,
	known_keys: {},
	cards: [],
	cardsToLoad: [],
	refreshCards: function(zIndex, startIndex) {
		deck.cardIndex = (typeof startIndex === "undefined") ? 0 : startIndex;
		if (deck.cards.length == 1 && deck.topCard.throbbing)
			deck.topCard.setFailMsg();
		else {
			slideContainer.innerHTML = "";
			for (var i = 0; i < deck.constants.stack_depth; i++)
				(i < deck.cards.length) && deck.cards[i].build(zIndex--);
		}
	},
	popData: function(rdata, firstCard) {
		var i, starters = [], others = [], preloads = [];

		if (!isAuthorized())
			preloads = rdata;
		else {
			if (firstCard) deck.known_keys[firstCard.id] = true;
			for (i = 0; i < rdata.length; i++) {
				if (!deck.known_keys[rdata[i].id]) {
					var d = rdata[i];
					((!d.animated && starters.length < 3)
						? starters : others).push(d);
					deck.known_keys[d.id] = true;
				}
			}
			for (i = 0; i < starters.length; i++) preloads.push(starters[i]);
			for (i = 0; i < others.length; i++) preloads.push(others[i]);
			if (firstCard) deck.cards.unshift(firstCard);
		}

		deck.cards = deck.cards.concat(preloads);
		return preloads;
	},
	preloadCards: function() {
		if (deck.cardsToLoad.length) {
			image.load(deck.cardsToLoad, window.innerWidth - 40);
			deck.cardsToLoad = [];
		}
	},
	dataPath: function(firstCard) {
		if (!isAuthorized()) {
			var p = "/api";
			if (deck.shareSwap) {
				deck.shareSwap = false;
				deck.shareOffset = 0;
			}
			if (firstCard || current_tag
				!= document.location.pathname.split("/")[2])
				p += "/share/" + current_tag + "/" +
					(firstCard ? firstCard.id : 0);
			else
				p += document.location.pathname;
			return p + "/20/" + (deck.shareOffset++ * 20);
		}
		return "/api/media/" + current_tag;
	},
	build: function (update, firstCard) {
		if (!update) {
			throbber.on();
			clearStack();
		}

		xhr(deck.dataPath(firstCard), null, function(response_data) {
			var rdata = response_data.data.map(newCard);
			if (update)
				deck.cardsToLoad = deck.cardsToLoad.concat(deck.popData(rdata));
			else {
				deck.cards = [];
				deck.cardsToLoad = deck.cardsToLoad.concat(deck.popData(rdata, firstCard).slice(deck.constant.stack_depth));
				deck.refreshCards(deck.constants.stack_depth - 1);
			}
		}, function(response, status) {
			if (status == 401){
				messageBox("Oops", response.errors + " <br><br><i>Control Safe Surf from Options</i>");
			}
			if (!update) {
				deck.cards = [];
				deck.refreshCards();
			}
		});
	},
	skipTutorial: function() {
		deck.cards = deck.cards.filter(function(card) {
			return card.type != "tutorial";
		});
	}
};