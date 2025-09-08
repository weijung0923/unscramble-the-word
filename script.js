class UnscrambleGame {
    constructor() {
        this.words = [
            { word: 'kite', emoji: '🪁' },
            { word: 'pine', emoji: '🌲' },
            { word: 'ripe', emoji: '🍌' },
            { word: 'fine', emoji: '👌' },
            { word: 'lime', emoji: '🍋' },
            { word: 'bike', emoji: '🚲' },
            { word: 'time', emoji: '⏰' },
            { word: 'hike', emoji: '🧗🏻‍♂️' }
        ];
        
        this.currentWordIndex = 0;
        this.currentWord = '';
        this.scrambledLetters = [];
        this.answerBoxes = [];
        this.alphabetTiles = [];
        this.correctMessages = [
            "Good job!🤓👍",
            "Excellent!🤩",
            "Well done👏"
        ];
        this.messageIndex = 0;
        
        this.initializeGame();
        this.setupEventListeners();
    }
    
    initializeGame() {
        this.currentWordIndex = 0;
        this.loadWord();
        this.updateProgress();
    }
    
    loadWord() {
        const wordData = this.words[this.currentWordIndex];
        this.currentWord = wordData.word;
        
        // Update image
        document.getElementById('currentImage').textContent = wordData.emoji;
        
        // Scramble letters (ensure they're in wrong order)
        this.scrambledLetters = this.scrambleWord(this.currentWord);
        
        // Clear answer boxes
        this.answerBoxes = Array(4).fill('');
        this.updateAnswerBoxes();
        
        // Generate alphabet tiles
        this.generateAlphabetTiles();
    }
    
    scrambleWord(word) {
        let letters = word.split('');
        let scrambled = [...letters];
        
        // Ensure letters are in wrong order
        let attempts = 0;
        do {
            for (let i = scrambled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
            }
            attempts++;
        } while (scrambled.join('') === word && attempts < 10);
        
        return scrambled;
    }
    
    generateAlphabetTiles() {
        const container = document.getElementById('alphabetContainer');
        container.innerHTML = '';
        this.alphabetTiles = [];
        
        this.scrambledLetters.forEach((letter, index) => {
            const tile = document.createElement('div');
            tile.className = 'alphabet-tile';
            tile.textContent = letter.toUpperCase();
            tile.dataset.letter = letter;
            tile.dataset.index = index;
            tile.draggable = true;
            
            // Click/tap events
            tile.addEventListener('click', () => this.selectLetter(tile));
            
            // Drag events
            tile.addEventListener('dragstart', (e) => this.handleDragStart(e, tile));
            tile.addEventListener('dragend', (e) => this.handleDragEnd(e, tile));
            
            container.appendChild(tile);
            this.alphabetTiles.push(tile);
        });
    }
    
    selectLetter(tile) {
        if (tile.classList.contains('used')) return;
        
        // Find first empty box
        const emptyIndex = this.answerBoxes.findIndex(box => box === '');
        if (emptyIndex === -1) return; // All boxes full
        
        // Add letter to answer box
        this.answerBoxes[emptyIndex] = tile.dataset.letter;
        tile.classList.add('used');
        
        this.updateAnswerBoxes();
        this.playClickSound();
    }
    
    updateAnswerBoxes() {
        const boxes = document.querySelectorAll('.answer-box');
        boxes.forEach((box, index) => {
            box.textContent = this.answerBoxes[index] || '';
            box.classList.toggle('filled', this.answerBoxes[index] !== '');
        });
    }
    
    setupEventListeners() {
        // Check button
        document.getElementById('checkButton').addEventListener('click', () => this.checkAnswer());
        
        // Play again button
        document.getElementById('playAgainButton').addEventListener('click', () => this.playAgain());
        
        // Answer box events (click and drag)
        document.querySelectorAll('.answer-box').forEach((box, index) => {
            box.addEventListener('click', () => this.removeLetter(index));
            
            // Drag events for answer boxes
            box.addEventListener('dragover', (e) => this.handleDragOver(e));
            box.addEventListener('drop', (e) => this.handleDrop(e, index));
            box.addEventListener('dragenter', (e) => this.handleDragEnter(e));
            box.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        });
        
        // Touch events for mobile
        this.setupTouchEvents();
    }
    
    removeLetter(boxIndex) {
        if (this.answerBoxes[boxIndex] === '') return;
        
        const letter = this.answerBoxes[boxIndex];
        this.answerBoxes[boxIndex] = '';
        
        // Find and restore the corresponding tile
        const tile = this.alphabetTiles.find(t => 
            t.dataset.letter === letter && t.classList.contains('used')
        );
        if (tile) {
            tile.classList.remove('used');
        }
        
        this.updateAnswerBoxes();
        this.playClickSound();
    }
    
    // Drag and Drop Methods
    handleDragStart(e, tile) {
        if (tile.classList.contains('used')) {
            e.preventDefault();
            return;
        }
        
        e.dataTransfer.setData('text/plain', tile.dataset.letter);
        e.dataTransfer.effectAllowed = 'move';
        tile.classList.add('dragging');
    }
    
    handleDragEnd(e, tile) {
        tile.classList.remove('dragging');
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }
    
    handleDragEnter(e) {
        e.preventDefault();
        e.target.classList.add('drag-over');
    }
    
    handleDragLeave(e) {
        e.target.classList.remove('drag-over');
    }
    
    handleDrop(e, boxIndex) {
        e.preventDefault();
        e.target.classList.remove('drag-over');
        
        const letter = e.dataTransfer.getData('text/plain');
        const tile = this.alphabetTiles.find(t => 
            t.dataset.letter === letter && !t.classList.contains('used')
        );
        
        if (tile && this.answerBoxes[boxIndex] === '') {
            this.answerBoxes[boxIndex] = letter;
            tile.classList.add('used');
            this.updateAnswerBoxes();
            this.playClickSound();
        }
    }
    
    // Touch Events for Mobile
    setupTouchEvents() {
        let touchStartX = 0;
        let touchStartY = 0;
        let draggedElement = null;
        let isDragging = false;
        let touchStartTime = 0;
        
        // Touch start
        document.addEventListener('touchstart', (e) => {
            const tile = e.target.closest('.alphabet-tile');
            if (tile && !tile.classList.contains('used')) {
                draggedElement = tile;
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                touchStartTime = Date.now();
                isDragging = false;
                
                // Don't prevent default here to allow click events
            }
        }, { passive: true });
        
        // Touch move
        document.addEventListener('touchmove', (e) => {
            if (draggedElement && !isDragging) {
                const touch = e.touches[0];
                const deltaX = touch.clientX - touchStartX;
                const deltaY = touch.clientY - touchStartY;
                
                // Only start dragging if moved more than 15px
                if (Math.abs(deltaX) > 15 || Math.abs(deltaY) > 15) {
                    isDragging = true;
                    draggedElement.classList.add('dragging');
                    draggedElement.style.position = 'fixed';
                    // Calculate offset based on screen size
                    const offset = window.innerWidth <= 600 ? 22.5 : window.innerWidth <= 1024 ? 32.5 : 37.5;
                    draggedElement.style.left = (touch.clientX - offset) + 'px';
                    draggedElement.style.top = (touch.clientY - offset) + 'px';
                    draggedElement.style.zIndex = '1000';
                    draggedElement.style.pointerEvents = 'none';
                }
                
                if (isDragging) {
                    e.preventDefault();
                }
            } else if (isDragging && draggedElement) {
                const touch = e.touches[0];
                const offset = window.innerWidth <= 600 ? 22.5 : window.innerWidth <= 1024 ? 32.5 : 37.5;
                draggedElement.style.left = (touch.clientX - offset) + 'px';
                draggedElement.style.top = (touch.clientY - offset) + 'px';
                e.preventDefault();
            }
        }, { passive: false });
        
        // Touch end
        document.addEventListener('touchend', (e) => {
            if (draggedElement) {
                const touch = e.changedTouches[0];
                const touchDuration = Date.now() - touchStartTime;
                
                if (isDragging) {
                    // Handle drag end
                    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
                    const answerBox = elementBelow?.closest('.answer-box');
                    
                    if (answerBox) {
                        const boxIndex = parseInt(answerBox.dataset.position);
                        if (this.answerBoxes[boxIndex] === '') {
                            this.answerBoxes[boxIndex] = draggedElement.dataset.letter;
                            draggedElement.classList.add('used');
                            this.updateAnswerBoxes();
                            this.playClickSound();
                        }
                    }
                    
                    // Reset tile position
                    draggedElement.style.position = '';
                    draggedElement.style.left = '';
                    draggedElement.style.top = '';
                    draggedElement.style.zIndex = '';
                    draggedElement.style.pointerEvents = '';
                    draggedElement.classList.remove('dragging');
                } else if (touchDuration < 500) {
                    // Handle tap/click (short touch without movement)
                    // Let the click event handle this
                    setTimeout(() => {
                        if (draggedElement && !isDragging) {
                            this.selectLetter(draggedElement);
                        }
                    }, 10);
                }
                
                draggedElement = null;
                isDragging = false;
            }
        });
    }
    
    checkAnswer() {
        const userAnswer = this.answerBoxes.join('').toLowerCase();
        
        if (userAnswer === this.currentWord) {
            this.showCorrectMessage();
            this.playCorrectSound();
            this.createFireworks();
            
            setTimeout(() => {
                this.nextWord();
            }, 2000);
        } else {
            this.showIncorrectMessage();
            this.playIncorrectSound();
        }
    }
    
    nextWord() {
        this.currentWordIndex++;
        
        if (this.currentWordIndex >= this.words.length) {
            this.showCompletionMessage();
        } else {
            this.loadWord();
            this.updateProgress();
        }
    }
    
    updateProgress() {
        const progress = ((this.currentWordIndex + 1) / this.words.length) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('currentWord').textContent = this.currentWordIndex + 1;
    }
    
    showCorrectMessage() {
        const message = this.correctMessages[this.messageIndex % this.correctMessages.length];
        this.messageIndex++;
        this.showMessage(message, '#4CAF50');
    }
    
    showIncorrectMessage() {
        this.showMessage("Oops, try again😅", '#f44336');
    }
    
    showCompletionMessage() {
        this.showMessage("Congratulations! 🎉", '#FF9800');
        this.createFireworks();
        this.playFireworksSound();
        
        setTimeout(() => {
            document.getElementById('playAgainButton').style.display = 'block';
            document.getElementById('checkButton').style.display = 'none';
        }, 2000);
    }
    
    showMessage(text, color = '#333') {
        const overlay = document.getElementById('messageOverlay');
        const content = document.getElementById('messageContent');
        
        content.textContent = text;
        content.style.color = color;
        overlay.style.display = 'flex';
        
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 1500);
    }
    
    createFireworks() {
        const container = document.getElementById('fireworksContainer');
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const firework = document.createElement('div');
                firework.className = 'firework';
                firework.style.left = Math.random() * 100 + '%';
                firework.style.top = Math.random() * 100 + '%';
                firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                container.appendChild(firework);
                
                setTimeout(() => {
                    firework.remove();
                }, 1000);
            }, i * 100);
        }
    }
    
    playAgain() {
        document.getElementById('playAgainButton').style.display = 'none';
        document.getElementById('checkButton').style.display = 'block';
        this.initializeGame();
    }
    
    // Sound effects (using Web Audio API)
    playClickSound() {
        this.playTone(800, 0.1, 'sine');
    }
    
    playCorrectSound() {
        // Clapping sound effect
        this.playTone(523, 0.2, 'sine'); // C5
        setTimeout(() => this.playTone(659, 0.2, 'sine'), 100); // E5
        setTimeout(() => this.playTone(784, 0.3, 'sine'), 200); // G5
    }
    
    playIncorrectSound() {
        // Uh-oh sound effect
        this.playTone(200, 0.3, 'sawtooth');
        setTimeout(() => this.playTone(150, 0.3, 'sawtooth'), 150);
    }
    
    playFireworksSound() {
        // Fireworks sound effect
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.playTone(400 + Math.random() * 400, 0.2, 'sine');
            }, i * 200);
        }
    }
    
    playTone(frequency, duration, type = 'sine') {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (error) {
            // Fallback for browsers that don't support Web Audio API
            console.log('Audio not supported');
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new UnscrambleGame();
});
