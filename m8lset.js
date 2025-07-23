/********************************************************
 *               PAGE MANAGER - NAVIGATION SYSTEM
 ********************************************************/
const PageManager = {
  // Initialize homepage
  initHomepage() {
    console.log('Initializing homepage...');
    const playSoloBtn = document.getElementById('playSoloBtn');
    const playMultiplayerBtn = document.getElementById('playMultiplayerBtn');

    if (playSoloBtn) {
      playSoloBtn.addEventListener('click', () => {
        console.log('Solo button clicked');
        window.location.href = 'playm8lset.html';
      });
      console.log('Solo button listener added');
    } else {
      console.error('Solo button not found');
    }

    if (playMultiplayerBtn) {
      playMultiplayerBtn.addEventListener('click', () => {
        console.log('Multiplayer button clicked');
        // Generate a new game ID and redirect to waiting room
        const gameId = this.generateGameId();
        window.location.href = `waitingroom.html?game=${gameId}&creator=true`;
      });
      console.log('Multiplayer button listener added');
    } else {
      console.error('Multiplayer button not found');
    }
  },

  // Initialize solo game
  initSoloGame() {
    const homeBtn = document.getElementById('homeBtn');
    if (homeBtn) {
      homeBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
      });
    }

    // Initialize the existing solo game
    if (typeof SoloGame !== 'undefined') {
      window.soloGame = new SoloGame();
      window.soloGame.initialize();
    }
  },

  // Initialize waiting room
  initWaitingRoom() {
    const homeBtn = document.getElementById('homeBtn');
    if (homeBtn) {
      homeBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to leave the waiting room?')) {
          window.location.href = 'index.html';
        }
      });
    }

    // Get game ID from URL
    const gameId = this.getURLParameter('game');
    const isCreator = this.getURLParameter('creator') === 'true';

    if (!gameId) {
      alert('Invalid game link. Redirecting to homepage.');
      window.location.href = 'index.html';
      return;
    }

    // Initialize waiting room logic
    if (typeof WaitingRoom !== 'undefined') {
      window.waitingRoom = new WaitingRoom(gameId, isCreator);
      window.waitingRoom.initialize();
    }
  },

  // Initialize multiplayer game
  initMultiplayerGame() {
    const homeBtn = document.getElementById('homeBtn');
    if (homeBtn) {
      homeBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to leave the game?')) {
          window.location.href = 'index.html';
        }
      });
    }

    // Get game ID from URL
    const gameId = this.getURLParameter('game');
    if (!gameId) {
      alert('Invalid game link. Redirecting to homepage.');
      window.location.href = 'index.html';
      return;
    }

    // Initialize multiplayer game
    if (typeof MultiplayerGame !== 'undefined') {
      window.multiplayerGame = new MultiplayerGame(gameId);
      window.multiplayerGame.initialize();
    }
  },

  // Generate unique game ID
  generateGameId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Get URL parameter
  getURLParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }
};

/********************************************************
 *               GAME LOGIC BASE CLASS
 ********************************************************/
class GameLogic {
  constructor() {
    // Predefine color themes (arrays of 3 colors each).
    this.colorThemes = [
      ['#ff0101', '#f1c40f', '#008002'],     // Red, Yellow, Green
      ['#800080', '#008002', '#ff0101'],     // Purple, Green, Red
      ['#1f73bc', '#0da215', '#dd9427']      // Blue, Green, Yellow
    ];

    // Predefine shape themes (arrays of 3 shape IDs).
    this.shapeThemes = [
     ['oval', 'diamond', 'squiggle'],
     ['hearts', 'squiggle', 'triangle'],
     ['squiggle', 'hearts', 'triangle'],
    ];

    // The user's current theme choice (index in the above arrays).
    this.colorThemeIndex = 0;
    this.shapeThemeIndex = 0;

    this.shapes = this.shapeThemes[this.shapeThemeIndex];
    this.colors = this.colorThemes[this.colorThemeIndex];
    this.fills = ['solid', 'striped', 'outline'];
    this.numbers = [1, 2, 3];

    // Game data
    this.deck = [];
    this.visibleCards = [];
    this.selectedCards = [];
    this.time = 0;
    this.timerStartTime = Date.now();
    this.timerInterval = null;
  }

  generateDeck() {
    const generatedDeck = [];
    this.shapes.forEach(shape => {
      this.colors.forEach(color => {
        this.fills.forEach(fill => {
          this.numbers.forEach(number => {
            generatedDeck.push({ shape, color, fill, number });
          });
        });
      });
    });
    return generatedDeck;
  }

  shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  isSet(cards) {
    const properties = ['shape', 'color', 'fill', 'number'];
    return properties.every(prop => {
      const values = cards.map(card => card[prop]);
      const unique = new Set(values);
      return (unique.size === 1 || unique.size === 3);
    });
  }

  findSet(cards) {
    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        for (let k = j + 1; k < cards.length; k++) {
          if (this.isSet([cards[i], cards[j], cards[k]])) {
            return [cards[i], cards[j], cards[k]];
          }
        }
      }
    }
    return null;
  }

  findAllSets(cards) {
    const allSets = [];
    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        for (let k = j + 1; k < cards.length; k++) {
          if (this.isSet([cards[i], cards[j], cards[k]])) {
            allSets.push([cards[i], cards[j], cards[k]]);
          }
        }
      }
    }
    return allSets;
  }

  countSets(cards) {
    let setCount = 0;
    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        for (let k = j + 1; k < cards.length; k++) {
          if (this.isSet([cards[i], cards[j], cards[k]])) {
            setCount++;
          }
        }
      }
    }
    return setCount;
  }

  ensurePlayableBoard() {
    this.visibleCards = this.deck.slice(0, 12);

    while (!this.findSet(this.visibleCards) && this.deck.length > this.visibleCards.length) {
      const cardsToAdd = Math.min(3, this.deck.length - this.visibleCards.length);
      this.visibleCards.push(...this.deck.slice(this.visibleCards.length, this.visibleCards.length + cardsToAdd));
    }

    if (!this.findSet(this.visibleCards)) {
      console.log('Game Over: No sets can be found, and no more cards to add!');
      return false;
    }
    return true;
  }

  createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('chat-card');

    for (let i = 0; i < card.number; i++) {
      const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgEl.setAttribute('viewBox', '0 0 200 400');
      svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');

      const useEl = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      useEl.setAttribute('href', `#${card.shape}`);

      if (card.fill === 'solid') {
        useEl.setAttribute('fill', card.color);
      } else if (card.fill === 'striped') {
        useEl.setAttribute('fill', card.color);
        useEl.setAttribute('mask', 'url(#mask-stripe)');
      } else {
        useEl.setAttribute('fill', 'transparent');
        useEl.setAttribute('stroke', card.color);
        useEl.setAttribute('stroke-width', '18');
      }

      svgEl.appendChild(useEl);
      cardDiv.appendChild(svgEl);
    }
    return cardDiv;
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerStartTime = Date.now() - (this.time * 1000); // Adjust for existing time
    
    this.timerInterval = setInterval(() => {
      this.time = Math.floor((Date.now() - this.timerStartTime) / 1000);
      const minutes = Math.floor(this.time / 60);
      const seconds = this.time % 60;
      const timerElement = document.getElementById('timer');
      if (timerElement) {
        timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}

/********************************************************
 *               GAME PERSISTENCE MANAGER
 ********************************************************/
class GamePersistence {
  constructor() {
    this.STORAGE_KEY = 'm8l_set_game_state';
    this.DEBOUNCE_DELAY = 300;
    this.saveTimeout = null;
    this.maxChatEntries = 100; // Limit chat history size
  }

  // Schedule an auto-save with debouncing
  scheduleAutoSave() {
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.saveGameState();
    }, this.DEBOUNCE_DELAY);
  }

  // Save current game state to sessionStorage
  saveGameState() {
    try {
      const gameState = this.collectGameState();
      const serialized = JSON.stringify(gameState);
      sessionStorage.setItem(this.STORAGE_KEY, serialized);
    } catch (error) {
      console.warn('Failed to save game state:', error);
    }
  }

  // Collect current game state from solo game instance
  collectGameState() {
    if (!window.soloGame) return null;
    
    const game = window.soloGame;
    return {
      version: '1.0',
      timestamp: Date.now(),
      deck: game.deck,
      visibleCards: game.visibleCards,
      selectedCards: game.selectedCards.map(card => ({
        ...card,
        // Don't save DOM references
        index: card.index
      })),
      time: game.time,
      timerStartTime: game.timerStartTime,
      currentPlayer: game.currentPlayer,
      chatLogEntries: game.chatLogEntries.slice(-this.maxChatEntries), // Limit chat history
      colorThemeIndex: game.colorThemeIndex,
      shapeThemeIndex: game.shapeThemeIndex,
      assistiveModeEnabled: game.assistiveModeEnabled,
      hasAssistanceBeenGiven: game.hasAssistanceBeenGiven
    };
  }

  // Load game state from sessionStorage
  loadGameState() {
    try {
      const saved = sessionStorage.getItem(this.STORAGE_KEY);
      if (!saved) return null;

      const gameState = JSON.parse(saved);
      
      // Validate the loaded state
      if (!this.validateGameState(gameState)) {
        console.warn('Invalid game state detected, starting fresh');
        this.clearSavedState();
        return null;
      }

      return gameState;
    } catch (error) {
      console.warn('Failed to load game state:', error);
      this.clearSavedState();
      return null;
    }
  }

  // Validate game state structure
  validateGameState(state) {
    if (!state || typeof state !== 'object') return false;
    
    const requiredFields = ['deck', 'visibleCards', 'time', 'currentPlayer'];
    return requiredFields.every(field => state.hasOwnProperty(field));
  }

  // Clear saved state
  clearSavedState() {
    try {
      sessionStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear saved state:', error);
    }
  }

  // Restore game state to solo game instance
  restoreGameState(gameInstance) {
    const savedState = this.loadGameState();
    if (!savedState || !gameInstance) return false;

    try {
      // Restore game variables
      gameInstance.deck = savedState.deck || [];
      gameInstance.visibleCards = savedState.visibleCards || [];
      gameInstance.selectedCards = savedState.selectedCards || [];
      gameInstance.time = savedState.time || 0;
      gameInstance.timerStartTime = savedState.timerStartTime || Date.now();
      gameInstance.currentPlayer = savedState.currentPlayer || 1;
      gameInstance.chatLogEntries = savedState.chatLogEntries || [];
      gameInstance.colorThemeIndex = savedState.colorThemeIndex || 0;
      gameInstance.shapeThemeIndex = savedState.shapeThemeIndex || 0;
      gameInstance.assistiveModeEnabled = savedState.assistiveModeEnabled || false;
      gameInstance.hasAssistanceBeenGiven = savedState.hasAssistanceBeenGiven || false;

      // Update theme arrays
      gameInstance.colors = gameInstance.colorThemes[gameInstance.colorThemeIndex];
      gameInstance.shapes = gameInstance.shapeThemes[gameInstance.shapeThemeIndex];

      // Restore UI state
      this.restoreUIState(gameInstance);

      return true;
    } catch (error) {
      console.warn('Failed to restore game state:', error);
      this.clearSavedState();
      return false;
    }
  }

  // Restore UI elements to match loaded state
  restoreUIState(gameInstance) {
    // Update timer display
    const minutes = Math.floor(gameInstance.time / 60);
    const seconds = gameInstance.time % 60;
    const timerElement = document.getElementById('timer');
    if (timerElement) {
      timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    // Update assistive mode button
    const assistiveBtn = document.getElementById('assistiveMode');
    if (assistiveBtn) {
      if (gameInstance.assistiveModeEnabled) {
        assistiveBtn.classList.add('active');
        assistiveBtn.textContent = 'Assistive Mode: ON';
      } else {
        assistiveBtn.classList.remove('active');
        assistiveBtn.textContent = 'Assistive Mode: OFF';
      }
    }

    // Render restored state
    gameInstance.renderBoard();
    gameInstance.renderAllChatEntries();
    gameInstance.updateCardsRemaining();
    gameInstance.updateSetStatus();

    // Restore timer if it was running
    if (gameInstance.time > 0) {
      gameInstance.startTimer();
    }

    // Restore assistive mode timer if needed
    if (gameInstance.assistiveModeEnabled && gameInstance.selectedCards.length === 0 && !gameInstance.hasAssistanceBeenGiven) {
      gameInstance.startAssistiveTimer();
    }
  }
}

/********************************************************
 *               SOLO GAME CLASS
 ********************************************************/
class SoloGame extends GameLogic {
  constructor() {
    super();
    this.gamePersistence = new GamePersistence();
    this.currentPlayer = 1;
    this.chatLogEntries = [];
    this.assistiveModeEnabled = false;
    this.assistiveTimer = null;
    this.hasAssistanceBeenGiven = false;
  }

  initialize() {
    console.log('Initializing solo game...');
    
    // Try to restore saved game state, otherwise start fresh
    const restored = this.gamePersistence.restoreGameState(this);
    
    if (!restored) {
      // No saved state, start fresh game
      this.resetGame();
    }
    
    this.setupEventListeners();
    
    // Set up periodic auto-save for ongoing games
    setInterval(() => {
      if (this.time > 0) { // Only save if game is active
        this.gamePersistence.scheduleAutoSave();
      }
    }, 30000); // Auto-save every 30 seconds as backup
  }

  setupEventListeners() {
    document.getElementById('reset')?.addEventListener('click', () => this.resetGame());
    document.getElementById('showSet')?.addEventListener('click', () => this.showSet());
    document.getElementById('themeBtn')?.addEventListener('click', () => this.showThemePopup());
    document.getElementById('assistiveMode')?.addEventListener('click', () => this.toggleAssistiveMode());
    document.getElementById('sendBtn')?.addEventListener('click', () => this.handleChatInput());
    document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleChatInput();
      }
    });

    // Add window resize listener to re-sync heights
    window.addEventListener('resize', () => this.syncChatHeightWithBoard());
  }

  resetGame() {
    this.stopTimer();
    this.time = 0;
    this.timerStartTime = Date.now();
    const timerElement = document.getElementById('timer');
    if (timerElement) {
      timerElement.textContent = "0:00";
    }

    this.deck = this.generateDeck();
    this.shuffleDeck(this.deck);
    this.ensurePlayableBoard();
    this.renderBoard();
    this.updateCardsRemaining();

    // Clear chat log
    this.chatLogEntries = [];
    this.renderAllChatEntries();
    this.selectedCards = [];

    // Reset assistive mode for new game
    this.clearAssistiveTimer();
    this.hasAssistanceBeenGiven = false;
    if (this.assistiveModeEnabled) {
      this.startAssistiveTimer();
    }

    this.updateSetStatus();
    this.startTimer();

    // Clear saved state and save new game state
    this.gamePersistence.clearSavedState();
    this.gamePersistence.scheduleAutoSave();
  }

  renderBoard() {
    const board = document.getElementById('board');
    if (!board) return;
    
    board.innerHTML = '';

    this.visibleCards.forEach((card, index) => {
      const cardElement = document.createElement('div');
      cardElement.classList.add('card');
      cardElement.dataset.index = index;
      cardElement.addEventListener('click', () => this.handleCardClick(card, index, cardElement));

      // Check if this card should be selected (from loaded state)
      const isSelected = this.selectedCards.some(selected => selected.index === index);
      if (isSelected) {
        cardElement.classList.add('selected');
      }

      // Render card shape(s)
      for (let i = 0; i < card.number; i++) {
        const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgEl.setAttribute('viewBox', '0 0 200 400');
        svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        const useEl = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        useEl.setAttribute('href', `#${card.shape}`);

        if (card.fill === 'solid') {
          useEl.setAttribute('fill', card.color);
        } else if (card.fill === 'striped') {
          useEl.setAttribute('fill', card.color);
          useEl.setAttribute('mask', 'url(#mask-stripe)');

          // Add stroke around striped shape
          const strokeUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
          strokeUse.setAttribute('href', `#${card.shape}`);
          strokeUse.setAttribute('stroke', card.color);
          strokeUse.setAttribute('fill', 'none');
          strokeUse.setAttribute('stroke-width', '19');
          svgEl.appendChild(strokeUse);
        } else {
          useEl.setAttribute('fill', 'transparent');
          useEl.setAttribute('stroke', card.color);
          useEl.setAttribute('stroke-width', '19');
        }

        svgEl.appendChild(useEl);
        cardElement.appendChild(svgEl);
      }

      board.appendChild(cardElement);
    });

    this.updateSetStatus();
    
    // Sync chat height with board height after rendering
    setTimeout(() => this.syncChatHeightWithBoard(), 10);
  }

handleCardClick(card, index, cardElement) {
  if (cardElement.classList.contains('selected')) {
    cardElement.classList.remove('selected');
    cardElement.classList.remove('assistant-selected');
    this.selectedCards = this.selectedCards.filter(c => c.index !== index);
    
    // Auto-save after card deselection
    this.gamePersistence.scheduleAutoSave();
    
    // Reset assistive timer when user deselects cards
    if (this.assistiveModeEnabled && this.selectedCards.length === 0) {
      this.startAssistiveTimer();
    }
  } else if (this.selectedCards.length < 3) {
    cardElement.classList.add('selected');
    this.selectedCards.push({ ...card, index });
    
    // Auto-save after card selection
    this.gamePersistence.scheduleAutoSave();
    
    // Clear assistive timer when user selects a card
    if (this.assistiveModeEnabled) {
      this.clearAssistiveTimer();
    }

    if (this.selectedCards.length === 3) {
      setTimeout(() => {
        if (this.isSet(this.selectedCards)) {
          this.addSetToChatLog(this.selectedCards);
          
          // Clear selections FIRST before removing cards
          document.querySelectorAll('.card.selected').forEach(cardEl => {
            cardEl.classList.remove('selected');
            cardEl.classList.remove('assistant-selected');
          });
          
          // Remove from deck (sort in reverse to remove correct indices)
          this.selectedCards.sort((a, b) => b.index - a.index)
            .forEach(({ index }) => this.deck.splice(index, 1));
          
          // Clear the selectedCards array
          this.selectedCards = [];
          
          this.ensurePlayableBoard();
          this.renderBoard();
          this.updateCardsRemaining();
          
          // Auto-save after successful set
          this.gamePersistence.scheduleAutoSave();
          
          // Start new assistive timer for next set
          if (this.assistiveModeEnabled) {
            this.startAssistiveTimer();
          }
        } else {
          this.showNotSetPopup();
          document.querySelectorAll('.card.selected')
            .forEach(cardEl => {
              cardEl.classList.remove('selected');
              cardEl.classList.remove('assistant-selected');
            });
          
          // Auto-save after incorrect set attempt
          this.gamePersistence.scheduleAutoSave();
          
          // Restart assistive timer after incorrect set
          if (this.assistiveModeEnabled) {
            this.startAssistiveTimer();
          }
          
          // Clear selections after incorrect set
          this.selectedCards = [];
        }
        
        this.hasAssistanceBeenGiven = false;
      }, 500);
    }
  }
}

  // Assistive mode methods
  startAssistiveTimer() {
    if (!this.assistiveModeEnabled) return;
    
    this.clearAssistiveTimer();
    this.hasAssistanceBeenGiven = false;
    
    this.assistiveTimer = setTimeout(() => {
      this.provideAssistance();
    }, 20000); // 20 seconds
  }

  clearAssistiveTimer() {
    if (this.assistiveTimer) {
      clearTimeout(this.assistiveTimer);
      this.assistiveTimer = null;
    }
  }

  provideAssistance() {
    if (!this.assistiveModeEnabled || this.hasAssistanceBeenGiven || this.selectedCards.length > 0) {
      return;
    }

    // Find all valid sets and select the first card from the first set
    const allSets = this.findAllSets(this.visibleCards);
    if (allSets.length > 0) {
      const firstSet = allSets[0];
      const firstCardToSelect = firstSet[0];
      
      // Find the index of this card in visibleCards
      const cardIndex = this.visibleCards.findIndex(card => 
        card.shape === firstCardToSelect.shape &&
        card.color === firstCardToSelect.color &&
        card.fill === firstCardToSelect.fill &&
        card.number === firstCardToSelect.number
      );

      if (cardIndex !== -1) {
        const cardElement = document.querySelector(`[data-index="${cardIndex}"]`);
        if (cardElement && !cardElement.classList.contains('selected')) {
          cardElement.classList.add('selected');
          cardElement.classList.add('assistant-selected');
          this.selectedCards.push({ ...firstCardToSelect, index: cardIndex });
          this.hasAssistanceBeenGiven = true;
          
          // Auto-save after assistance
          this.gamePersistence.scheduleAutoSave();
          
          // Show assistance notification
          this.showAssistanceNotification();
        }
      }
    }
  }

  showAssistanceNotification() {
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '20px';
    popup.style.left = '50%';
    popup.style.transform = 'translateX(-50%)';
    popup.style.backgroundColor = '#ff8c00';
    popup.style.color = 'white';
    popup.style.padding = '15px 25px';
    popup.style.borderRadius = '5px';
    popup.style.boxShadow = '0 4px 6px rgba(0,0,0,0.2)';
    popup.style.fontSize = '16px';
    popup.style.fontWeight = 'bold';
    popup.style.zIndex = '1001';

    const message = document.createElement('p');
    message.textContent = "🤖 Assistive Mode: I've selected a card to help you find a set!";
    message.style.margin = '0';
    popup.appendChild(message);

    document.body.appendChild(popup);

    // Auto-close after 4 seconds
    setTimeout(() => {
      if (document.body.contains(popup)) {
        document.body.removeChild(popup);
      }
    }, 4000);
  }

  toggleAssistiveMode() {
    this.assistiveModeEnabled = !this.assistiveModeEnabled;
    const button = document.getElementById('assistiveMode');
    
    if (button) {
      if (this.assistiveModeEnabled) {
        button.classList.add('active');
        button.textContent = 'Assistive Mode: ON';
        this.startAssistiveTimer();
      } else {
        button.classList.remove('active');
        button.textContent = 'Assistive Mode: OFF';
        this.clearAssistiveTimer();
        this.hasAssistanceBeenGiven = false;
      }
    }

    // Auto-save when toggling assistive mode
    this.gamePersistence.scheduleAutoSave();
  }

  // Chat and UI methods
  addSetToChatLog(cardsFound) {
    const entry = {
      type: 'set',
      player: this.currentPlayer,
      cards: cardsFound,
      timestamp: Date.now()
    };
    
    this.chatLogEntries.push(entry);
    this.renderChatEntry(entry);
    
    // Auto-save after adding to chat log
    this.gamePersistence.scheduleAutoSave();
  }

  addMessageToChatLog(message) {
    const entry = {
      type: 'message',
      player: this.currentPlayer,
      message: message.trim(),
      timestamp: Date.now()
    };
    
    this.chatLogEntries.push(entry);
    this.renderChatEntry(entry);
    
    // Auto-save after adding message
    this.gamePersistence.scheduleAutoSave();
  }

  renderChatEntry(entry) {
    const chatLog = document.getElementById('chatLog');
    if (!chatLog) return;
    
    if (entry.type === 'set') {
      const setEntry = document.createElement('div');
      setEntry.classList.add('chat-entry');
      
      const header = document.createElement('div');
      header.classList.add('set-header');
      header.textContent = `Set found by Player ${entry.player}`;
      setEntry.appendChild(header);
      
      const cardsContainer = document.createElement('div');
      cardsContainer.classList.add('set-cards');
      
      entry.cards.forEach(card => {
        const cardElement = this.createCardElement(card);
        cardsContainer.appendChild(cardElement);
      });
      
      setEntry.appendChild(cardsContainer);
      // Insert at the top (newest first)
      chatLog.insertBefore(setEntry, chatLog.firstChild);
    } else if (entry.type === 'message') {
      const messageEntry = document.createElement('div');
      messageEntry.classList.add('message-entry');
      
      const author = document.createElement('span');
      author.classList.add('message-author');
      author.textContent = `Player ${entry.player}:`;
      
      const text = document.createElement('span');
      text.classList.add('message-text');
      text.textContent = entry.message;
      
      messageEntry.appendChild(author);
      messageEntry.appendChild(text);
      // Insert at the top (newest first)
      chatLog.insertBefore(messageEntry, chatLog.firstChild);
    }
  }

  renderAllChatEntries() {
    const chatLog = document.getElementById('chatLog');
    if (!chatLog) return;
    
    chatLog.innerHTML = '';
    
    // Render in reverse order so newest appears at top
    this.chatLogEntries.slice().reverse().forEach(entry => {
      this.renderChatEntry(entry);
    });
  }

handleChatInput() {
   const chatInput = document.getElementById('chatInput');
   if (!chatInput) return;
   
   const message = chatInput.value.trim();
   
   if (message) {
     this.addMessageToChatLog(message);
     chatInput.value = '';
   }
 }

 updateCardsRemaining() {
   const cardsRemaining = document.getElementById('cardsRemaining');
   if (cardsRemaining) {
     const remaining = this.deck.length - this.visibleCards.length;
     cardsRemaining.textContent = `${remaining} cards remaining in the deck`;
   }
 }

 updateSetStatus() {
   const setCount = this.countSets(this.visibleCards);
   const setStatus = document.getElementById('setStatus');
   if (setStatus) {
     if (setCount > 0) {
       setStatus.textContent = `Status: ${setCount} set${setCount > 1 ? 's' : ''} can be found.`;
     } else {
       setStatus.textContent = 'Status: No sets can be found.';
     }
   }
 }

 syncChatHeightWithBoard() {
   // Only sync on desktop view
   if (window.innerWidth > 768) {
     const board = document.getElementById('board');
     const gameChat = document.querySelector('.game-chat');
     
     if (board && gameChat) {
       const boardHeight = board.offsetHeight;
       gameChat.style.height = `${boardHeight}px`;
     }
   } else {
     // Reset height on mobile
     const gameChat = document.querySelector('.game-chat');
     if (gameChat) {
       gameChat.style.height = 'auto';
     }
   }
 }

 showSet() {
   const validSet = this.findSet(this.visibleCards);
   if (validSet) {
     this.showSetPopup(validSet);
   } else {
     alert('No valid set found!');
   }
   this.updateSetStatus();
 }

 showNotSetPopup() {
   const popup = document.createElement('div');
   popup.style.position = 'fixed';
   popup.style.top = '20px';
   popup.style.left = '50%';
   popup.style.transform = 'translateX(-50%)';
   popup.style.backgroundColor = '#fff';
   popup.style.padding = '20px 30px';
   popup.style.borderRadius = '5px';
   popup.style.boxShadow = '0 4px 6px rgba(0,0,0,0.2)';
   popup.style.fontSize = '18px';
   popup.style.fontWeight = 'bold';
   popup.style.zIndex = '1001';
   popup.style.border = '2px solid #ff4444';

   const message = document.createElement('p');
   message.textContent = "Not a set! 👎";
   message.style.margin = '0';
   popup.appendChild(message);

   document.body.appendChild(popup);

   // Auto-close after 3 seconds
   setTimeout(() => {
     if (document.body.contains(popup)) {
       document.body.removeChild(popup);
     }
   }, 3000);
 }

 // Theme methods
 showThemePopup() {
   const overlay = document.createElement('div');
   overlay.classList.add('overlay');

   overlay.addEventListener('click', (e) => {
     if (e.target === overlay) {
       document.body.removeChild(overlay);
     }
   });

   const popup = document.createElement('div');
   popup.classList.add('popup');

   const title = document.createElement('h3');
   title.textContent = "Change Theme";
   popup.appendChild(title);

   const changeColourBtn = document.createElement('button');
   changeColourBtn.classList.add('btn');
   changeColourBtn.textContent = "Change Colours";
   changeColourBtn.onclick = () => {
     popup.innerHTML = '';
     this.showColourThemes(popup, overlay);
   };
   popup.appendChild(changeColourBtn);

   const changeShapeBtn = document.createElement('button');
   changeShapeBtn.classList.add('btn');
   changeShapeBtn.textContent = "Change Shapes";
   changeShapeBtn.onclick = () => {
     popup.innerHTML = '';
     this.showShapeThemes(popup, overlay);
   };
   popup.appendChild(changeShapeBtn);

   const closeBtn = document.createElement('button');
   closeBtn.classList.add('btn');
   closeBtn.textContent = "Close";
   closeBtn.onclick = () => {
     document.body.removeChild(overlay);
   };
   popup.appendChild(closeBtn);

   overlay.appendChild(popup);
   document.body.appendChild(overlay);
 }

showColourThemes(popup, overlay) {
  const title = document.createElement('h3');
  title.textContent = "Choose a Colour Theme";
  popup.appendChild(title);

  this.colorThemes.forEach((theme, index) => {
    const themeDiv = document.createElement('div');
    themeDiv.classList.add('theme-option');

    theme.forEach(col => {
      const colorBox = document.createElement('div');
      colorBox.style.width = '30px';
      colorBox.style.height = '30px';
      colorBox.style.display = 'inline-block';
      colorBox.style.margin = '0 5px';
      colorBox.style.backgroundColor = col;
      colorBox.style.border = '1px solid #000';
      themeDiv.appendChild(colorBox);
    });

    const selectBtn = document.createElement('button');
    selectBtn.classList.add('btn');
    selectBtn.textContent = "Select";
    selectBtn.onclick = () => {
      // Update theme index FIRST
      this.colorThemeIndex = index;
      
      // Apply theme changes immediately
      this.reinitializeDeckWithTheme();
      
      document.body.removeChild(overlay);
    };
    themeDiv.appendChild(selectBtn);

    popup.appendChild(themeDiv);
  });

  const backBtn = document.createElement('button');
  backBtn.classList.add('btn');
  backBtn.textContent = "Back";
  backBtn.onclick = () => {
    document.body.removeChild(overlay);
    this.showThemePopup();
  };
  popup.appendChild(backBtn);
}

showShapeThemes(popup, overlay) {
  const title = document.createElement('h3');
  title.textContent = "Choose a Shape Theme";
  popup.appendChild(title);

  this.shapeThemes.forEach((theme, index) => {
    const themeDiv = document.createElement('div');
    themeDiv.classList.add('theme-option');

    theme.forEach(shp => {
      const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgEl.setAttribute('viewBox', '0 0 200 400');
      svgEl.style.width = '30px';
      svgEl.style.height = '60px';
      svgEl.style.margin = '0 5px';

      const useEl = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      useEl.setAttribute('href', `#${shp}`);
      useEl.setAttribute('fill', '#555');
      svgEl.appendChild(useEl);

      themeDiv.appendChild(svgEl);
    });

    const selectBtn = document.createElement('button');
    selectBtn.classList.add('btn');
    selectBtn.textContent = "Select";
    selectBtn.onclick = () => {
      // Update theme index FIRST
      this.shapeThemeIndex = index;
      
      // Apply theme changes immediately
      this.reinitializeDeckWithTheme();
      
      document.body.removeChild(overlay);
    };
    themeDiv.appendChild(selectBtn);

    popup.appendChild(themeDiv);
  });

  const backBtn = document.createElement('button');
  backBtn.classList.add('btn');
  backBtn.textContent = "Back";
  backBtn.onclick = () => {
    document.body.removeChild(overlay);
    this.showThemePopup();
  };
  popup.appendChild(backBtn);
}

reinitializeDeckWithTheme() {
  // Get the current (old) theme arrays before they get updated
  const currentShapes = [...this.shapes]; // Copy current shapes
  const currentColors = [...this.colors]; // Copy current colors
  
  // Create mapping for shapes (preserve existing shapes that are in new theme)
  const newShapes = this.shapeThemes[this.shapeThemeIndex];
  const shapeMapping = {};
  
  currentShapes.forEach((oldShape, index) => {
    if (newShapes.includes(oldShape)) {
      // If old shape exists in new theme, keep it
      shapeMapping[oldShape] = oldShape;
    } else {
      // Map to corresponding position in new theme
      shapeMapping[oldShape] = newShapes[index];
    }
  });

  // Create mapping for colors (preserve existing colors that are in new theme)
  const newColors = this.colorThemes[this.colorThemeIndex];
  const colorMapping = {};
  
  currentColors.forEach((oldColor, index) => {
    if (newColors.includes(oldColor)) {
      // If old color exists in new theme, keep it
      colorMapping[oldColor] = oldColor;
    } else {
      // Map to corresponding position in new theme
      colorMapping[oldColor] = newColors[index];
    }
  });

  // NOW update the theme arrays
  this.colors = this.colorThemes[this.colorThemeIndex];
  this.shapes = this.shapeThemes[this.shapeThemeIndex];

  // Update existing visible cards with new theme
  this.visibleCards = this.visibleCards.map(card => ({
    ...card,
    color: colorMapping[card.color] || card.color,
    shape: shapeMapping[card.shape] || card.shape
  }));

  // Update remaining deck cards with new theme
  this.deck = this.deck.map(card => ({
    ...card,
    color: colorMapping[card.color] || card.color,
    shape: shapeMapping[card.shape] || card.shape
  }));

  // Update selected cards if any
  this.selectedCards = this.selectedCards.map(card => ({
    ...card,
    color: colorMapping[card.color] || card.color,
    shape: shapeMapping[card.shape] || card.shape
  }));

  // Update chat log entries with new theme
  this.chatLogEntries = this.chatLogEntries.map(entry => {
    if (entry.type === 'set' && entry.cards) {
      return {
        ...entry,
        cards: entry.cards.map(card => ({
          ...card,
          color: colorMapping[card.color] || card.color,
          shape: shapeMapping[card.shape] || card.shape
        }))
      };
    }
    return entry;
  });

  this.renderBoard();
  this.updateCardsRemaining();
  this.renderAllChatEntries();
  this.updateSetStatus();

  // Auto-save after theme change
  this.gamePersistence.scheduleAutoSave();
}

 showSetPopup(aSet) {
   const overlay = document.createElement('div');
   overlay.classList.add('overlay');

   overlay.addEventListener('click', (e) => {
     if (e.target === overlay) {
       document.body.removeChild(overlay);
     }
   });

   const popup = document.createElement('div');
   popup.classList.add('popup');

   aSet.forEach(card => {
     const cardDiv = this.createCardElement(card);
     popup.appendChild(cardDiv);
   });

   const closeBtn = document.createElement('button');
   closeBtn.classList.add('btn');
   closeBtn.textContent = "Close";
   closeBtn.onclick = () => document.body.removeChild(overlay);
   popup.appendChild(closeBtn);

   const showAllBtn = document.createElement('button');
   showAllBtn.classList.add('btn');
   showAllBtn.textContent = "Show All Sets";
   showAllBtn.onclick = () => {
     document.body.removeChild(overlay);
     const allSets = this.findAllSets(this.visibleCards);
     this.showAllSetsPopup(allSets);
   };
   popup.appendChild(showAllBtn);

   overlay.appendChild(popup);
   document.body.appendChild(overlay);
 }

 showAllSetsPopup(allSets) {
   const overlay = document.createElement('div');
   overlay.classList.add('overlay');

   overlay.addEventListener('click', (e) => {
     if (e.target === overlay) {
       document.body.removeChild(overlay);
     }
   });

   const popup = document.createElement('div');
   popup.classList.add('popup');

   const title = document.createElement('h3');
   title.textContent = `All Sets (${allSets.length})`;
   popup.appendChild(title);

   if (allSets.length === 0) {
     const noSetsMsg = document.createElement('p');
     noSetsMsg.textContent = "No sets available.";
     popup.appendChild(noSetsMsg);
   } else {
     allSets.forEach(singleSet => {
       const setContainer = document.createElement('div');
       setContainer.style.display = 'inline-flex';
       setContainer.style.margin = '10px';

       singleSet.forEach(card => {
         const cardDiv = this.createCardElement(card);
         setContainer.appendChild(cardDiv);
       });
       popup.appendChild(setContainer);
     });
   }

   const closeBtn = document.createElement('button');
   closeBtn.classList.add('btn');
   closeBtn.textContent = 'Close';
   closeBtn.onclick = () => document.body.removeChild(overlay);
   popup.appendChild(closeBtn);

   overlay.appendChild(popup);
   document.body.appendChild(overlay);
 }
}

/********************************************************
*               FIREBASE MANAGER
********************************************************/
class FirebaseManager {
 constructor() {
   this.database = null;
   this.initialized = false;
   this.listeners = new Map(); // Track active listeners for cleanup
 }

 // Initialize Firebase
 async initialize() {
   try {
     // Firebase configuration - REPLACE WITH YOUR ACTUAL CONFIG
     const firebaseConfig = {
       apiKey: "your-api-key-here",
       authDomain: "your-project.firebaseapp.com", 
       databaseURL: "https://your-project-default-rtdb.firebaseio.com/",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "123456789",
       appId: "your-app-id"
     };

     // Import Firebase modules from CDN
     if (!window.firebase) {
       // Load Firebase SDK
       await this.loadFirebaseSDK();
     }

     // Initialize Firebase app if not already initialized
     if (!firebase.apps.length) {
       firebase.initializeApp(firebaseConfig);
     }
     
     this.database = firebase.database();
     this.initialized = true;
     console.log('Firebase initialized successfully');
     return true;
   } catch (error) {
     console.error('Failed to initialize Firebase:', error);
     return false;
   }
 }

 // Dynamically load Firebase SDK
 async loadFirebaseSDK() {
   return new Promise((resolve, reject) => {
     // Load Firebase core
     const script1 = document.createElement('script');
     script1.src = 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js';
     script1.onload = () => {
       // Load Firebase database
       const script2 = document.createElement('script');
       script2.src = 'https://www.gstatic.com/firebasejs/9.0.0/firebase-database-compat.js';
       script2.onload = resolve;
       script2.onerror = reject;
       document.head.appendChild(script2);
     };
     script1.onerror = reject;
     document.head.appendChild(script1);
   });
 }

 // Create new game room
 async createGame(gameId, creatorData) {
   if (!this.initialized) {
     throw new Error('Firebase not initialized');
   }

   try {
     const gameRef = this.database.ref(`games/${gameId}`);
     const gameData = {
       players: {
         [creatorData.id]: {
           ...creatorData,
           joinedAt: firebase.database.ServerValue.TIMESTAMP,
           isCreator: true,
           points: 0
         }
       },
       gameState: {
         status: 'waiting',
         deck: [],
         visibleCards: [],
         currentSet: null,
         winner: null,
         startedAt: null
       },
       createdAt: firebase.database.ServerValue.TIMESTAMP,
       createdBy: creatorData.id
     };

     await gameRef.set(gameData);
     console.log('Game created successfully:', gameId);
     return true;
   } catch (error) {
     console.error('Failed to create game:', error);
     throw error;
   }
 }

 // Join existing game
 async joinGame(gameId, playerData) {
   if (!this.initialized) {
     throw new Error('Firebase not initialized');
   }

   try {
     const gameRef = this.database.ref(`games/${gameId}`);
     const snapshot = await gameRef.once('value');
     
     if (!snapshot.exists()) {
       throw new Error('Game not found');
     }

     const gameData = snapshot.val();
     if (gameData.gameState.status !== 'waiting') {
       throw new Error('Game already started');
     }

     // Add player to game
     const playerRef = gameRef.child(`players/${playerData.id}`);
     await playerRef.set({
       ...playerData,
       joinedAt: firebase.database.ServerValue.TIMESTAMP,
       isCreator: false,
       points: 0
     });

     console.log('Successfully joined game:', gameId);
     return true;
   } catch (error) {
     console.error('Failed to join game:', error);
     throw error;
   }
 }

 // Listen for player changes
 onPlayersChanged(gameId, callback) {
   if (!this.initialized) return;

   const playersRef = this.database.ref(`games/${gameId}/players`);
   const listener = playersRef.on('value', (snapshot) => {
     const players = snapshot.val() || {};
     callback(players);
   });

   // Store listener for cleanup
   this.listeners.set(`players-${gameId}`, { ref: playersRef, listener });
 }

 // Listen for game state changes
 onGameStateChanged(gameId, callback) {
   if (!this.initialized) return;

   const gameStateRef = this.database.ref(`games/${gameId}/gameState`);
   const listener = gameStateRef.on('value', (snapshot) => {
     const gameState = snapshot.val();
     if (gameState) {
       callback(gameState);
     }
   });

   // Store listener for cleanup
   this.listeners.set(`gameState-${gameId}`, { ref: gameStateRef, listener });
 }

 // Update game state
 async updateGameState(gameId, updates) {
   if (!this.initialized) {
     throw new Error('Firebase not initialized');
   }

   try {
     const gameStateRef = this.database.ref(`games/${gameId}/gameState`);
     await gameStateRef.update(updates);
     return true;
   } catch (error) {
     console.error('Failed to update game state:', error);
     throw error;
   }
 }

 // Update player score
 async updatePlayerScore(gameId, playerId, points) {
   if (!this.initialized) {
     throw new Error('Firebase not initialized');
   }

   try {
     const playerRef = this.database.ref(`games/${gameId}/players/${playerId}/points`);
     await playerRef.set(points);
     return true;
   } catch (error) {
     console.error('Failed to update player score:', error);
     throw error;
   }
 }

 // Send chat message
 async sendChatMessage(gameId, playerId, playerName, message) {
   if (!this.initialized) {
     throw new Error('Firebase not initialized');
   }

   try {
     const chatRef = this.database.ref(`games/${gameId}/chat`).push();
     await chatRef.set({
       playerId,
       playerName,
       message,
       timestamp: firebase.database.ServerValue.TIMESTAMP
     });
     return true;
   } catch (error) {
     console.error('Failed to send chat message:', error);
     throw error;
   }
 }

 // Listen for chat messages
 onChatMessages(gameId, callback) {
   if (!this.initialized) return;

   const chatRef = this.database.ref(`games/${gameId}/chat`).orderByChild('timestamp');
   const listener = chatRef.on('child_added', (snapshot) => {
     const message = snapshot.val();
     if (message) {
       callback(message);
     }
   });

   // Store listener for cleanup
   this.listeners.set(`chat-${gameId}`, { ref: chatRef, listener });
 }

 // Start multiplayer game
 async startGame(gameId, gameData) {
   if (!this.initialized) {
     throw new Error('Firebase not initialized');
   }

   try {
     const updates = {
       [`games/${gameId}/gameState/status`]: 'playing',
       [`games/${gameId}/gameState/deck`]: gameData.deck,
       [`games/${gameId}/gameState/visibleCards`]: gameData.visibleCards,
       [`games/${gameId}/gameState/startedAt`]: firebase.database.ServerValue.TIMESTAMP
     };

     await this.database.ref().update(updates);
     return true;
   } catch (error) {
     console.error('Failed to start game:', error);
     throw error;
   }
 }

 // Check if game exists
 async gameExists(gameId) {
   if (!this.initialized) return false;

   try {
     const snapshot = await this.database.ref(`games/${gameId}`).once('value');
     return snapshot.exists();
   } catch (error) {
     console.error('Failed to check game existence:', error);
     return false;
   }
 }

 // Clean up listeners
 cleanup(gameId = null) {
   if (gameId) {
     // Clean up specific game listeners
     const keys = Array.from(this.listeners.keys()).filter(key => key.includes(gameId));
     keys.forEach(key => {
       const { ref, listener } = this.listeners.get(key);
       ref.off('value', listener);
       this.listeners.delete(key);
     });
   } else {
     // Clean up all listeners
     this.listeners.forEach(({ ref, listener }) => {
       ref.off('value', listener);
     });
     this.listeners.clear();
   }
 }

 // Remove player from game (when leaving)
 async removePlayer(gameId, playerId) {
   if (!this.initialized) return;

   try {
     const playerRef = this.database.ref(`games/${gameId}/players/${playerId}`);
     await playerRef.remove();
     console.log('Player removed from game:', playerId);
   } catch (error) {
     console.error('Failed to remove player:', error);
   }
 }
}

/********************************************************
*               WAITING ROOM CLASS
********************************************************/
class WaitingRoom {
 constructor(gameId, isCreator) {
   this.gameId = gameId;
   this.isCreator = isCreator;
   this.playerId = this.generatePlayerId();
   this.playerName = '';
   this.players = {};
   this.firebase = new FirebaseManager();
   this.playerCount = 0;
 }

 async initialize() {
   console.log('Initializing waiting room for game:', this.gameId);
   
   try {
     // Initialize Firebase
     const firebaseReady = await this.firebase.initialize();
     if (!firebaseReady) {
       throw new Error('Failed to initialize Firebase');
     }

     // Set up UI
     this.setupUI();
     this.setupEventListeners();
     
     if (this.isCreator) {
       // Create new game
       await this.createGame();
     } else {
       // Join existing game
       await this.joinGame();
     }

     // Set up real-time listeners
     this.setupRealtimeListeners();
     
   } catch (error) {
     console.error('Failed to initialize waiting room:', error);
     this.showError('Failed to connect to game. Please check your internet connection and try again.');
   }
 }

 async createGame() {
   this.playerName = 'Player 1';
   const creatorData = {
     id: this.playerId,
     name: this.playerName,
     isCreator: true
   };

   try {
     await this.firebase.createGame(this.gameId, creatorData);
     console.log('Game created successfully');
   } catch (error) {
     console.error('Failed to create game:', error);
     throw error;
   }
 }

 async joinGame() {
   try {
     // Check if game exists
     const gameExists = await this.firebase.gameExists(this.gameId);
     if (!gameExists) {
       throw new Error('Game not found');
     }

     // Determine player number
     this.playerName = `Player ${this.playerCount + 1}`;
     const playerData = {
       id: this.playerId,
       name: this.playerName,
       isCreator: false
     };

     await this.firebase.joinGame(this.gameId, playerData);
     console.log('Joined game successfully');
   } catch (error) {
     console.error('Failed to join game:', error);
     if (error.message === 'Game not found') {
       this.showError('Game not found. Please check your invite link.');
     } else if (error.message === 'Game already started') {
       this.showError('This game has already started.');
     } else {
       throw error;
     }
   }
 }

 setupRealtimeListeners() {
   // Listen for player changes
   this.firebase.onPlayersChanged(this.gameId, (players) => {
     this.players = players;
     this.updatePlayersUI();
   });

   // Listen for game state changes (to detect when game starts)
   this.firebase.onGameStateChanged(this.gameId, (gameState) => {
     if (gameState.status === 'playing') {
       // Game started, redirect to multiplayer game
       window.location.href = `m8lwithfriends.html?game=${this.gameId}`;
     }
   });
 }

 setupUI() {
   // Set invite link
   const inviteLink = `${window.location.origin}/waitingroom.html?game=${this.gameId}`;
   const inviteLinkInput = document.getElementById('inviteLink');
   if (inviteLinkInput) {
     inviteLinkInput.value = inviteLink;
   }
   
   this.updateStartButtonVisibility();
 }

 setupEventListeners() {
   // Copy link button
   const copyLinkBtn = document.getElementById('copyLinkBtn');
   if (copyLinkBtn) {
     copyLinkBtn.addEventListener('click', () => {
       this.copyInviteLink();
     });
   }

   // Start game button (only for creator)
   const startGameBtn = document.getElementById('startGameBtn');
   if (startGameBtn) {
     startGameBtn.addEventListener('click', () => {
       if (this.isCreator && Object.keys(this.players).length >= 2) {
         this.startGame();
       }
     });
   }

   // Handle page unload (cleanup)
   window.addEventListener('beforeunload', () => {
     this.cleanup();
   });
 }

 copyInviteLink() {
   const inviteLinkInput = document.getElementById('inviteLink');
   if (!inviteLinkInput) return;

   inviteLinkInput.select();
   inviteLinkInput.setSelectionRange(0, 99999); // For mobile devices
   
   try {
     document.execCommand('copy');
     this.showCopyStatus('✓ Link copied to clipboard!', 'success');
   } catch (err) {
     console.error('Failed to copy link:', err);
     
     // Fallback: try modern clipboard API
     if (navigator.clipboard) {
       navigator.clipboard.writeText(inviteLinkInput.value).then(() => {
         this.showCopyStatus('✓ Link copied to clipboard!', 'success');
       }).catch(() => {
         this.showCopyStatus('Failed to copy link. Please copy manually.', 'error');
       });
     } else {
       this.showCopyStatus('Please copy the link manually.', 'error');
     }
   }
 }

 showCopyStatus(message, type) {
   const status = document.getElementById('copyStatus');
   if (status) {
     status.textContent = message;
     status.className = `copy-status ${type}`;
     
     setTimeout(() => {
       status.textContent = '';
       status.className = 'copy-status';
     }, 3000);
   }
 }

 updatePlayersUI() {
   const playersList = document.getElementById('playersList');
   const playerCount = document.getElementById('playerCount');
   
   if (!playersList || !playerCount) return;
   
   playersList.innerHTML = '';
   const playersArray = Object.values(this.players);
   
   // Sort players by join time (creator first)
   playersArray.sort((a, b) => {
     if (a.isCreator) return -1;
     if (b.isCreator) return 1;
     return (a.joinedAt || 0) - (b.joinedAt || 0);
   });

   playersArray.forEach((player, index) => {
     const playerElement = document.createElement('div');
     playerElement.className = 'player-item';
     
     // Update player names to be sequential
     const displayName = player.isCreator ? 'Player 1' : `Player ${index + 1}`;
     
     playerElement.innerHTML = `
       <span class="player-name">${displayName}</span>
       <span class="player-status">${player.isCreator ? 'Host' : 'Joined'}</span>
     `;
     
     // Highlight current player
     if (player.id === this.playerId) {
       playerElement.style.backgroundColor = '#e8f5e8';
       playerElement.style.borderLeftColor = '#28a745';
     }
     
     playersList.appendChild(playerElement);
   });
   
   playerCount.textContent = playersArray.length;
   this.updateStartButtonVisibility();
 }

 updateStartButtonVisibility() {
   const startBtn = document.getElementById('startGameBtn');
   const waitingMsg = document.getElementById('waitingMessage');
   
   if (!startBtn || !waitingMsg) return;
   
   const playerCount = Object.keys(this.players).length;
   
   if (this.isCreator && playerCount >= 2) {
     startBtn.style.display = 'block';
     waitingMsg.style.display = 'none';
   } else {
     startBtn.style.display = 'none';
     waitingMsg.style.display = 'block';
   }
 }

 async startGame() {
   console.log('Starting multiplayer game...');
   const loadingIndicator = document.getElementById('loadingIndicator');
   if (loadingIndicator) {
     loadingIndicator.style.display = 'block';
   }
   
   try {
     // Create game logic instance to generate deck
     const gameLogic = new GameLogic();
     const deck = gameLogic.generateDeck();
     gameLogic.shuffleDeck(deck);
     
     const visibleCards = deck.slice(0, 12);
     
     // Ensure there's at least one valid set
     while (!gameLogic.findSet(visibleCards) && deck.length > visibleCards.length) {
       const cardsToAdd = Math.min(3, deck.length - visibleCards.length);
       visibleCards.push(...deck.slice(visibleCards.length, visibleCards.length + cardsToAdd));
     }
     
     const gameData = {
       deck: deck,
       visibleCards: visibleCards
     };
     
     await this.firebase.startGame(this.gameId, gameData);
     
     // Redirect will happen automatically via listener
   } catch (error) {
     console.error('Failed to start game:', error);
     this.showError('Failed to start game. Please try again.');
     
     if (loadingIndicator) {
       loadingIndicator.style.display = 'none';
     }
   }
 }

 showError(message) {
   // Create error popup
   const errorPopup = document.createElement('div');
   errorPopup.style.position = 'fixed';
   errorPopup.style.top = '50%';
   errorPopup.style.left = '50%';
   errorPopup.style.transform = 'translate(-50%, -50%)';
   errorPopup.style.backgroundColor = '#f8d7da';
   errorPopup.style.color = '#721c24';
   errorPopup.style.padding = '20px 30px';
   errorPopup.style.borderRadius = '8px';
   errorPopup.style.border = '1px solid #f5c6cb';
   errorPopup.style.boxShadow = '0 4px 6px rgba(0,0,0,0.2)';
   errorPopup.style.zIndex = '1001';
   errorPopup.style.maxWidth = '400px';
   errorPopup.style.textAlign = 'center';

   const message_p = document.createElement('p');
   message_p.textContent = message;
   message_p.style.margin = '0 0 15px 0';
   errorPopup.appendChild(message_p);

const okBtn = document.createElement('button');
   okBtn.textContent = 'OK';
   okBtn.className = 'btn';
   okBtn.onclick = () => {
     document.body.removeChild(errorPopup);
     // Redirect to homepage on error
     window.location.href = 'index.html';
   };
   errorPopup.appendChild(okBtn);

   document.body.appendChild(errorPopup);
 }

 cleanup() {
   // Remove player from game and cleanup listeners
   if (this.firebase.initialized) {
     this.firebase.removePlayer(this.gameId, this.playerId);
     this.firebase.cleanup(this.gameId);
   }
 }

 generatePlayerId() {
   return 'player_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
 }
}

/********************************************************
*               MULTIPLAYER GAME CLASS
********************************************************/
class MultiplayerGame extends GameLogic {
 constructor(gameId) {
   super();
   this.gameId = gameId;
   this.playerId = this.generatePlayerId();
   this.playerName = '';
   this.players = {};
   this.firebase = new FirebaseManager();
   this.chatLogEntries = [];
   this.gameStarted = false;
   this.gameEnded = false;
 }

 async initialize() {
   console.log('Initializing multiplayer game:', this.gameId);
   
   try {
     // Initialize Firebase
     const firebaseReady = await this.firebase.initialize();
     if (!firebaseReady) {
       throw new Error('Failed to initialize Firebase');
     }

     // Check if game exists and get initial data
     const gameExists = await this.firebase.gameExists(this.gameId);
     if (!gameExists) {
       throw new Error('Game not found');
     }

     // Set up UI and event listeners
     this.setupUI();
     this.setupEventListeners();

     // Set up real-time listeners
     this.setupRealtimeListeners();

     // Determine player identity and join
     await this.joinGameAsPlayer();
     
   } catch (error) {
     console.error('Failed to initialize multiplayer game:', error);
     this.showError('Failed to join game. Please check your connection and try again.');
   }
 }

 async joinGameAsPlayer() {
   // For now, assign player name based on current players
   // In a full implementation, you'd maintain player identity from waiting room
   const playerCount = Object.keys(this.players).length;
   this.playerName = `Player ${playerCount + 1}`;

   console.log(`Joining game as ${this.playerName}`);
 }

 setupRealtimeListeners() {
   // Listen for player changes and scores
   this.firebase.onPlayersChanged(this.gameId, (players) => {
     this.players = players;
     this.updatePlayersScores();
     
     // Check for game end condition
     if (this.gameStarted && !this.gameEnded) {
       this.checkGameEndCondition();
     }
   });

   // Listen for game state changes
   this.firebase.onGameStateChanged(this.gameId, (gameState) => {
     if (gameState.status === 'playing' && !this.gameStarted) {
       this.startMultiplayerGame(gameState);
     } else if (gameState.status === 'finished') {
       this.endGame(gameState.winner);
     }
     
     // Update game state
     if (gameState.deck) {
       this.deck = gameState.deck;
     }
     if (gameState.visibleCards) {
       this.visibleCards = gameState.visibleCards;
       this.renderBoard();
       this.updateCardsRemaining();
       this.updateSetStatus();
     }
   });

   // Listen for chat messages
   this.firebase.onChatMessages(this.gameId, (message) => {
     this.displayChatMessage(message);
   });
 }

 startMultiplayerGame(gameState) {
   console.log('Starting multiplayer game with state:', gameState);
   this.gameStarted = true;
   
   // Initialize game with Firebase state
   this.deck = gameState.deck || this.generateDeck();
   this.visibleCards = gameState.visibleCards || [];
   
   // If no visible cards, ensure playable board
   if (this.visibleCards.length === 0) {
     this.shuffleDeck(this.deck);
     this.ensurePlayableBoard();
     
     // Update Firebase with new state (only if creator)
     this.updateGameStateInFirebase();
   }
   
   this.renderBoard();
   this.updateCardsRemaining();
   this.updateSetStatus();
   this.startTimer();
 }

 setupUI() {
   const gameIdElement = document.getElementById('gameId');
   if (gameIdElement) {
     gameIdElement.textContent = this.gameId.substring(0, 8);
   }
 }

 setupEventListeners() {
   document.getElementById('themeBtn')?.addEventListener('click', () => this.showThemePopup());
   document.getElementById('sendBtn')?.addEventListener('click', () => this.handleChatInput());
   document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
     if (e.key === 'Enter') {
       this.handleChatInput();
     }
   });
   
   document.getElementById('playAgainBtn')?.addEventListener('click', () => {
     window.location.href = `waitingroom.html?game=${PageManager.generateGameId()}&creator=true`;
   });
   
   document.getElementById('backHomeBtn')?.addEventListener('click', () => {
     window.location.href = 'index.html';
   });

   // Handle page unload (cleanup)
   window.addEventListener('beforeunload', () => {
     this.cleanup();
   });
 }

 // Override renderBoard for multiplayer
 renderBoard() {
   const board = document.getElementById('board');
   if (!board) return;
   
   board.innerHTML = '';

   this.visibleCards.forEach((card, index) => {
     const cardElement = document.createElement('div');
     cardElement.classList.add('card');
     cardElement.dataset.index = index;
     cardElement.addEventListener('click', () => this.handleMultiplayerCardClick(card, index, cardElement));

     // Render card shape(s)
     for (let i = 0; i < card.number; i++) {
       const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
       svgEl.setAttribute('viewBox', '0 0 200 400');
       svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');

       const useEl = document.createElementNS('http://www.w3.org/2000/svg', 'use');
       useEl.setAttribute('href', `#${card.shape}`);

       if (card.fill === 'solid') {
         useEl.setAttribute('fill', card.color);
       } else if (card.fill === 'striped') {
         useEl.setAttribute('fill', card.color);
         useEl.setAttribute('mask', 'url(#mask-stripe)');

         const strokeUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
         strokeUse.setAttribute('href', `#${card.shape}`);
         strokeUse.setAttribute('stroke', card.color);
         strokeUse.setAttribute('fill', 'none');
         strokeUse.setAttribute('stroke-width', '19');
         svgEl.appendChild(strokeUse);
       } else {
         useEl.setAttribute('fill', 'transparent');
         useEl.setAttribute('stroke', card.color);
         useEl.setAttribute('stroke-width', '19');
       }

       svgEl.appendChild(useEl);
       cardElement.appendChild(svgEl);
     }

     board.appendChild(cardElement);
   });

   this.updateSetStatus();
 }

 handleMultiplayerCardClick(card, index, cardElement) {
   if (!this.gameStarted || this.gameEnded) return;

   if (cardElement.classList.contains('selected')) {
     cardElement.classList.remove('selected');
     this.selectedCards = this.selectedCards.filter(c => c.index !== index);
   } else if (this.selectedCards.length < 3) {
     cardElement.classList.add('selected');
     this.selectedCards.push({ ...card, index });

     if (this.selectedCards.length === 3) {
       setTimeout(async () => {
         if (this.isSet(this.selectedCards)) {
           await this.handleValidSet();
         } else {
           this.handleInvalidSet();
         }
       }, 500);
     }
   }
 }

async handleValidSet() {
  try {
    // Award point to current player
    const currentPlayer = this.players[this.playerId];
    const newScore = (currentPlayer?.points || 0) + 1;
    
    await this.firebase.updatePlayerScore(this.gameId, this.playerId, newScore);

    // Clear selections FIRST before removing cards
    document.querySelectorAll('.card.selected').forEach(cardEl => {
      cardEl.classList.remove('selected');
    });

    // Remove cards from deck and update visible cards
    const sortedIndices = this.selectedCards.map(c => c.index).sort((a, b) => b - a);
    sortedIndices.forEach(index => {
      this.deck.splice(index, 1);
    });

    // Clear the selectedCards array
    this.selectedCards = [];

    // Add new cards if possible
    const newVisibleCards = [...this.visibleCards];
    sortedIndices.reverse().forEach(index => {
      newVisibleCards.splice(index, 1);
    });

    // Try to add 3 new cards
    const cardsToAdd = Math.min(3, this.deck.length - newVisibleCards.length);
    if (cardsToAdd > 0) {
      const nextCards = this.deck.slice(newVisibleCards.length, newVisibleCards.length + cardsToAdd);
      newVisibleCards.push(...nextCards);
    }

    // Update Firebase with new game state
    await this.firebase.updateGameState(this.gameId, {
      deck: this.deck,
      visibleCards: newVisibleCards
    });

    this.showSetFoundNotification();

  } catch (error) {
    console.error('Failed to handle valid set:', error);
    this.showError('Failed to process set. Please try again.');
  }
}

 handleInvalidSet() {
   this.showNotSetPopup();
   document.querySelectorAll('.card.selected').forEach(cardEl => {
     cardEl.classList.remove('selected');
   });
   this.selectedCards = [];
 }

 async updateGameStateInFirebase() {
   try {
     await this.firebase.updateGameState(this.gameId, {
       deck: this.deck,
       visibleCards: this.visibleCards
     });
   } catch (error) {
     console.error('Failed to update game state:', error);
   }
 }

 updatePlayersScores() {
   const playersScores = document.getElementById('playersScores');
   if (!playersScores) return;
   
   playersScores.innerHTML = '';
   
   // Sort players by points (descending)
   const sortedPlayers = Object.values(this.players).sort((a, b) => (b.points || 0) - (a.points || 0));
   
   sortedPlayers.forEach((player, index) => {
     const playerElement = document.createElement('div');
     playerElement.className = 'player-score-item';
     
     if (player.id === this.playerId) {
       playerElement.classList.add('current-player');
     }
     
     // Show crown for leader
     const isLeader = index === 0 && (player.points || 0) > 0;
     const crown = isLeader ? '👑 ' : '';
     
     playerElement.innerHTML = `
       <span class="player-score-name">${crown}${player.name || `Player ${index + 1}`}</span>
       <span class="player-score-points">${player.points || 0}</span>
     `;
     
     playersScores.appendChild(playerElement);
   });
 }

 async handleChatInput() {
   const chatInput = document.getElementById('chatInput');
   if (!chatInput) return;
   
   const message = chatInput.value.trim();
   if (message) {
     try {
       await this.firebase.sendChatMessage(this.gameId, this.playerId, this.playerName, message);
       chatInput.value = '';
     } catch (error) {
       console.error('Failed to send chat message:', error);
     }
   }
 }

 displayChatMessage(messageData) {
   const chatLog = document.getElementById('chatLog');
   if (!chatLog) return;
   
   const messageEntry = document.createElement('div');
   messageEntry.classList.add('message-entry');
   
   const author = document.createElement('span');
   author.classList.add('message-author');
   author.textContent = `${messageData.playerName}:`;
   
   const text = document.createElement('span');
   text.classList.add('message-text');
   text.textContent = messageData.message;
   
   messageEntry.appendChild(author);
   messageEntry.appendChild(text);
   
   // Insert at the top (newest first)
   chatLog.insertBefore(messageEntry, chatLog.firstChild);
 }

 checkGameEndCondition() {
   // Check if no more sets are possible and no cards left to deal
   const setsAvailable = this.countSets(this.visibleCards);
   const cardsRemaining = this.deck.length - this.visibleCards.length;
   
   if (setsAvailable === 0 && cardsRemaining === 0) {
     this.triggerGameEnd();
   }
 }

 async triggerGameEnd() {
   if (this.gameEnded) return;
   
   this.gameEnded = true;
   
   // Find winner
   const sortedPlayers = Object.values(this.players).sort((a, b) => (b.points || 0) - (a.points || 0));
   const winner = sortedPlayers[0];
   
   try {
     await this.firebase.updateGameState(this.gameId, {
       status: 'finished',
       winner: winner.name || winner.id
     });
   } catch (error) {
     console.error('Failed to update game end state:', error);
   }
   
   this.endGame(winner.name || winner.id);
 }

 endGame(winnerName) {
   this.stopTimer();
   this.gameEnded = true;
   
   // Show game over modal
   this.showGameOverModal(winnerName);
 }

 showGameOverModal(winnerName) {
   const modal = document.getElementById('gameOverModal');
   const finalScores = document.getElementById('finalScores');
   
   if (!modal || !finalScores) return;
   
   finalScores.innerHTML = '';
   
   // Sort players by score for final display
   const sortedPlayers = Object.values(this.players).sort((a, b) => (b.points || 0) - (a.points || 0));
   
   sortedPlayers.forEach((player, index) => {
     const scoreElement = document.createElement('div');
     scoreElement.className = 'final-score-item';
     
     if (index === 0) {
       scoreElement.classList.add('winner');
     }
     
     const crown = index === 0 ? '👑 ' : '';
     scoreElement.innerHTML = `
       <span>${crown}${player.name || `Player ${index + 1}`}</span>
       <span>${player.points || 0} points</span>
     `;
     
     finalScores.appendChild(scoreElement);
   });
   
   modal.style.display = 'flex';
 }

 showSetFoundNotification() {
   const popup = document.createElement('div');
   popup.style.position = 'fixed';
   popup.style.top = '20px';
   popup.style.left = '50%';
   popup.style.transform = 'translateX(-50%)';
   popup.style.backgroundColor = '#d4edda';
   popup.style.color = '#155724';
   popup.style.padding = '15px 25px';
   popup.style.borderRadius = '5px';
   popup.style.border = '1px solid #c3e6cb';
   popup.style.boxShadow = '0 4px 6px rgba(0,0,0,0.2)';
   popup.style.fontSize = '16px';
   popup.style.fontWeight = 'bold';
   popup.style.zIndex = '1001';

   const message = document.createElement('p');
   message.textContent = "✅ Valid set! +1 point";
   message.style.margin = '0';
   popup.appendChild(message);

   document.body.appendChild(popup);

   // Auto-close after 3 seconds
   setTimeout(() => {
     if (document.body.contains(popup)) {
       document.body.removeChild(popup);
     }
   }, 3000);
 }

 showNotSetPopup() {
   const popup = document.createElement('div');
   popup.style.position = 'fixed';
   popup.style.top = '20px';
   popup.style.left = '50%';
   popup.style.transform = 'translateX(-50%)';
   popup.style.backgroundColor = '#f8d7da';
   popup.style.color = '#721c24';
   popup.style.padding = '15px 25px';
   popup.style.borderRadius = '5px';
   popup.style.border = '1px solid #f5c6cb';
   popup.style.boxShadow = '0 4px 6px rgba(0,0,0,0.2)';
   popup.style.fontSize = '16px';
   popup.style.fontWeight = 'bold';
   popup.style.zIndex = '1001';

   const message = document.createElement('p');
   message.textContent = "❌ Not a set!";
   message.style.margin = '0';
   popup.appendChild(message);

   document.body.appendChild(popup);

   // Auto-close after 3 seconds
   setTimeout(() => {
     if (document.body.contains(popup)) {
       document.body.removeChild(popup);
     }
   }, 3000);
 }

 showError(message) {
   const errorPopup = document.createElement('div');
   errorPopup.style.position = 'fixed';
   errorPopup.style.top = '50%';
   errorPopup.style.left = '50%';
   errorPopup.style.transform = 'translate(-50%, -50%)';
   errorPopup.style.backgroundColor = '#f8d7da';
   errorPopup.style.color = '#721c24';
   errorPopup.style.padding = '20px 30px';
   errorPopup.style.borderRadius = '8px';
   errorPopup.style.border = '1px solid #f5c6cb';
   errorPopup.style.boxShadow = '0 4px 6px rgba(0,0,0,0.2)';
   errorPopup.style.zIndex = '1001';
   errorPopup.style.maxWidth = '400px';
   errorPopup.style.textAlign = 'center';

   const message_p = document.createElement('p');
   message_p.textContent = message;
   message_p.style.margin = '0 0 15px 0';
   errorPopup.appendChild(message_p);

   const okBtn = document.createElement('button');
   okBtn.textContent = 'OK';
   okBtn.className = 'btn';
   okBtn.onclick = () => {
     document.body.removeChild(errorPopup);
     window.location.href = 'index.html';
   };
   errorPopup.appendChild(okBtn);

   document.body.appendChild(errorPopup);
 }

 cleanup() {
   // Cleanup Firebase listeners
   if (this.firebase.initialized) {
     this.firebase.cleanup(this.gameId);
   }
   
   // Stop timer
   this.stopTimer();
 }

 generatePlayerId() {
   return 'player_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
 }
}

// Make sure PageManager is available globally
window.PageManager = PageManager;