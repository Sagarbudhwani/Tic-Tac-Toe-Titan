document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    themeIcon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.body.setAttribute('data-theme', newTheme);
        themeIcon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        
        // Save theme preference
        localStorage.setItem('theme', newTheme);
    });

    // Game state
    const gameState = {
        board: Array(9).fill(''),
        currentPlayer: 'X',
        gameMode: 'twoPlayer',
        aiFirst: false,
        difficulty: 'hard',
        gameActive: true,
        scores: { X: 0, O: 0 },
        playerSymbol: 'X',
        aiSymbol: 'O'
    };

    // DOM Elements
    const boardElement = document.getElementById('gameBoard');
    const cells = document.querySelectorAll('.cell');
    const turnText = document.getElementById('turnText');
    const turnIndicator = document.querySelector('.turn-indicator');
    const scoreX = document.getElementById('scoreX');
    const scoreO = document.getElementById('scoreO');
    const messageElement = document.getElementById('message');
    const resetBtn = document.getElementById('resetBtn');
    const newGameBtn = document.getElementById('newGameBtn');
    const twoPlayerModeBtn = document.getElementById('twoPlayerMode');
    const vsAIModeBtn = document.getElementById('vsAIMode');
    const playerFirstBtn = document.getElementById('playerFirst');
    const aiFirstBtn = document.getElementById('aiFirst');
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    const aiSettings = document.getElementById('aiSettings');

    // Winning combinations
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    // Initialize game
    function initGame() {
        console.log('Initializing game...');
        gameState.board = Array(9).fill('');
        gameState.gameActive = true;
        
        // Set starting player based on mode and first move setting
        if (gameState.gameMode === 'vsAI' && gameState.aiFirst) {
            gameState.currentPlayer = gameState.aiSymbol;
            gameState.playerSymbol = 'X';
            gameState.aiSymbol = 'O';
        } else {
            gameState.currentPlayer = 'X';
            gameState.playerSymbol = 'X';
            gameState.aiSymbol = 'O';
        }
        
        // Clear all cells
        cells.forEach(cell => {
            cell.classList.remove('x', 'o', 'winning-cell');
            cell.style.transform = 'scale(1)';
        });
        
        updateTurnDisplay();
        messageElement.className = 'message';
        messageElement.textContent = '';
        messageElement.style.display = 'none';
        
        updateScoreDisplay();
        
        // If AI goes first, make its move
        if (gameState.gameMode === 'vsAI' && gameState.aiFirst && gameState.gameActive) {
            console.log('AI making first move...');
            setTimeout(makeAIMove, 500);
        }
    }

    // Update turn display
    function updateTurnDisplay() {
        let playerText;
        if (gameState.gameMode === 'twoPlayer') {
            playerText = `Player ${gameState.currentPlayer}'s Turn`;
        } else {
            if (gameState.currentPlayer === gameState.playerSymbol) {
                playerText = "Your Turn";
            } else {
                playerText = "AI Thinking...";
            }
        }
        
        turnText.textContent = playerText;
        
        // Update turn indicator
        turnIndicator.className = 'turn-indicator';
        if (gameState.currentPlayer === 'X') {
            turnIndicator.classList.add('x');
        } else if (gameState.currentPlayer === 'O') {
            turnIndicator.classList.add('o');
        }
        
        if (gameState.gameMode === 'vsAI' && gameState.currentPlayer === gameState.aiSymbol) {
            turnIndicator.classList.add('ai');
        }
    }

    // Update score display
    function updateScoreDisplay() {
        scoreX.textContent = gameState.scores.X;
        scoreO.textContent = gameState.scores.O;
    }

    // Handle cell click
    function handleCellClick(e) {
        if (!gameState.gameActive) return;
        
        const cell = e.target.closest('.cell');
        if (!cell) return;
        
        const index = parseInt(cell.getAttribute('data-index'));
        
        // Check if cell is empty and game is active
        if (gameState.board[index] !== '' || !gameState.gameActive) {
            return;
        }
        
        // Make player move
        makeMove(index, gameState.currentPlayer);
        
        // Check for win or draw
        if (checkWin(gameState.currentPlayer)) {
            endGame(`${gameState.currentPlayer} Wins!`);
            gameState.scores[gameState.currentPlayer]++;
            updateScoreDisplay();
        } else if (checkDraw()) {
            endGame("It's a Draw!");
        } else {
            // Switch player
            gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
            updateTurnDisplay();
            
            // If playing against AI and it's AI's turn
            if (gameState.gameMode === 'vsAI' && 
                gameState.currentPlayer === gameState.aiSymbol && 
                gameState.gameActive) {
                setTimeout(makeAIMove, 700);
            }
        }
    }

    // Make a move
    function makeMove(index, player) {
        gameState.board[index] = player;
        const cell = cells[index];
        
        // Remove any existing classes
        cell.classList.remove('x', 'o');
        
        // Add the appropriate class
        if (player === 'X') {
            cell.classList.add('x');
        } else if (player === 'O') {
            cell.classList.add('o');
        }
        
        // Add a subtle animation
        cell.style.transform = 'scale(0.9)';
        setTimeout(() => {
            cell.style.transform = 'scale(1)';
        }, 150);
    }

    // Check for win
    function checkWin(player) {
        for (const combination of winningCombinations) {
            const isWinning = combination.every(index => {
                return gameState.board[index] === player;
            });
            
            if (isWinning) {
                // Highlight winning cells
                combination.forEach(index => {
                    cells[index].classList.add('winning-cell');
                });
                return true;
            }
        }
        return false;
    }

    // Check for draw
    function checkDraw() {
        return gameState.board.every(cell => cell !== '');
    }

    // End the game
    function endGame(message) {
        gameState.gameActive = false;
        messageElement.textContent = message;
        messageElement.className = 'message';
        
        if (message.includes('Win')) {
            messageElement.classList.add('win');
        } else {
            messageElement.classList.add('draw');
        }
        
        messageElement.style.display = 'block';
    }

    // AI move using minimax algorithm
    function makeAIMove() {
        if (!gameState.gameActive) return;
        
        console.log('AI making move...');
        let bestScore = -Infinity;
        let bestMove = null;
        
        // Try all possible moves
        for (let i = 0; i < 9; i++) {
            if (gameState.board[i] === '') {
                // Make the move
                gameState.board[i] = gameState.aiSymbol;
                let score = minimax(gameState.board, 0, false);
                // Undo the move
                gameState.board[i] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        // Make the best move if found
        if (bestMove !== null) {
            console.log('AI chose move:', bestMove);
            makeMove(bestMove, gameState.aiSymbol);
            
            // Check for win or draw
            if (checkWin(gameState.aiSymbol)) {
                endGame(`${gameState.aiSymbol} Wins!`);
                gameState.scores[gameState.aiSymbol]++;
                updateScoreDisplay();
            } else if (checkDraw()) {
                endGame("It's a Draw!");
            } else {
                gameState.currentPlayer = gameState.playerSymbol;
                updateTurnDisplay();
            }
        }
    }

    // Minimax algorithm for AI
    function minimax(board, depth, isMaximizing) {
        // Check for terminal states
        if (checkWin(gameState.aiSymbol)) return 10 - depth;
        if (checkWin(gameState.playerSymbol)) return depth - 10;
        if (checkDraw()) return 0;
        
        // Adjust depth based on difficulty
        let maxDepth = 9;
        if (gameState.difficulty === 'medium') maxDepth = 5;
        if (gameState.difficulty === 'easy') maxDepth = 3;
        
        if (depth >= maxDepth) return 0;
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = gameState.aiSymbol;
                    let score = minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = gameState.playerSymbol;
                    let score = minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        // Cell click events
        cells.forEach(cell => {
            cell.addEventListener('click', handleCellClick);
        });

        // Button events
        resetBtn.addEventListener('click', initGame);

        newGameBtn.addEventListener('click', () => {
            gameState.scores = { X: 0, O: 0 };
            initGame();
        });

        // Game mode events
        twoPlayerModeBtn.addEventListener('click', () => {
            gameState.gameMode = 'twoPlayer';
            twoPlayerModeBtn.classList.add('active');
            vsAIModeBtn.classList.remove('active');
            aiSettings.classList.remove('active');
            initGame();
        });

        vsAIModeBtn.addEventListener('click', () => {
            gameState.gameMode = 'vsAI';
            vsAIModeBtn.classList.add('active');
            twoPlayerModeBtn.classList.remove('active');
            aiSettings.classList.add('active');
            initGame();
        });

        // First move events
        playerFirstBtn.addEventListener('click', () => {
            gameState.aiFirst = false;
            playerFirstBtn.classList.add('active');
            aiFirstBtn.classList.remove('active');
            initGame();
        });

        aiFirstBtn.addEventListener('click', () => {
            gameState.aiFirst = true;
            aiFirstBtn.classList.add('active');
            playerFirstBtn.classList.remove('active');
            initGame();
        });

        // Difficulty events
        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                gameState.difficulty = btn.getAttribute('data-difficulty');
                console.log('Difficulty set to:', gameState.difficulty);
            });
        });
    }

    // Initialize the game
    setupEventListeners();
    initGame();
    
    console.log('Game initialized successfully!');
});
