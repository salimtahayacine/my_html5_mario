/**
 * UIScene - Scène d'interface utilisateur superposée au jeu
 */
class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        // References to global data
        this.globals = this.game.globals;
        
        // Create UI elements
        this.createUIElements();
        
        // Listen to game events
        this.listenToGameEvents();
    }

    createUIElements() {
        // Create UI container
        this.uiContainer = document.createElement('div');
        this.uiContainer.className = 'ui-container';
        document.getElementById('game-container').appendChild(this.uiContainer);

        // Score
        const scoreContainer = document.createElement('div');
        scoreContainer.className = 'ui-item';
        this.scoreText = document.createElement('span');
        this.scoreText.textContent = 'SCORE: 0';
        scoreContainer.appendChild(this.scoreText);
        this.uiContainer.appendChild(scoreContainer);

        // Lives
        const livesContainer = document.createElement('div');
        livesContainer.className = 'ui-item';
        livesContainer.style.position = 'absolute';
        livesContainer.style.right = '20px';
        livesContainer.style.top = '20px';

        const livesIcon = document.createElement('div');
        livesIcon.className = 'player';
        livesIcon.style.position = 'relative';
        livesIcon.style.display = 'inline-block';
        livesIcon.style.width = '24px';
        livesIcon.style.height = '24px';
        livesIcon.style.marginRight = '10px';
        livesIcon.style.transform = 'scale(0.5)';

        this.livesText = document.createElement('span');
        this.livesText.textContent = `x ${this.globals.gameData.lives}`;
        
        livesContainer.appendChild(livesIcon);
        livesContainer.appendChild(this.livesText);
        this.uiContainer.appendChild(livesContainer);

        // Coins
        const coinsContainer = document.createElement('div');
        coinsContainer.className = 'ui-item';
        coinsContainer.style.position = 'absolute';
        coinsContainer.style.left = '50%';
        coinsContainer.style.transform = 'translateX(-50%)';
        coinsContainer.style.top = '20px';

        const coinIcon = document.createElement('div');
        coinIcon.className = 'coin';
        coinIcon.style.position = 'relative';
        coinIcon.style.display = 'inline-block';
        coinIcon.style.marginRight = '10px';
        coinIcon.style.transform = 'scale(0.8)';

        this.coinsText = document.createElement('span');
        this.coinsText.textContent = `x ${this.globals.gameData.collectedCoins}`;
        
        coinsContainer.appendChild(coinIcon);
        coinsContainer.appendChild(this.coinsText);
        this.uiContainer.appendChild(coinsContainer);

        // Time
        const timeContainer = document.createElement('div');
        timeContainer.className = 'ui-item';
        timeContainer.style.position = 'absolute';
        timeContainer.style.left = '50%';
        timeContainer.style.transform = 'translateX(-50%)';
        timeContainer.style.top = '50px';

        this.timeText = document.createElement('span');
        this.timeText.textContent = 'TEMPS: 300';
        timeContainer.appendChild(this.timeText);
        this.uiContainer.appendChild(timeContainer);

        // Level
        const levelContainer = document.createElement('div');
        levelContainer.className = 'ui-item';
        levelContainer.style.position = 'absolute';
        levelContainer.style.left = '20px';
        levelContainer.style.top = '50px';

        this.levelText = document.createElement('span');
        this.levelText.textContent = 'NIVEAU: 1';
        levelContainer.appendChild(this.levelText);
        this.uiContainer.appendChild(levelContainer);

        // Pause button (mobile only)
        if (this.sys.game.device.input.touch) {
            const pauseButton = document.createElement('div');
            pauseButton.className = 'control-btn';
            pauseButton.style.position = 'absolute';
            pauseButton.style.right = '20px';
            pauseButton.style.bottom = '20px';
            pauseButton.innerHTML = '⏸️';

            pauseButton.addEventListener('click', () => {
                const gameScene = this.scene.get('GameScene');
                if (gameScene) {
                    gameScene.togglePause();
                }
            });

            this.uiContainer.appendChild(pauseButton);
        }
    }

    listenToGameEvents() {
        // Get reference to game scene
        const gameScene = this.scene.get('GameScene');
        
        // Listen for score updates
        gameScene.events.on('scoreUpdate', (score) => {
            this.updateScore(score);
        }, this);
        
        // Listen for lives updates
        gameScene.events.on('livesUpdate', (lives) => {
            this.updateLives(lives);
        }, this);
        
        // Listen for coin collection
        gameScene.events.on('coinCollected', (coins) => {
            this.updateCoins(coins);
        }, this);
        
        // Listen for time updates
        gameScene.events.on('timeUpdate', (time) => {
            this.updateTime(time);
        }, this);
        
        // Listen for game start
        gameScene.events.on('gameStarted', (data) => {
            this.gameStarted(data);
        }, this);
        
        // Make sure CSS animations are added
        this.addCssAnimations();
    }

    updateScore(score) {
        this.scoreText.textContent = 'SCORE: ' + score;
    }

    updateLives(lives) {

    gameStarted(data) {
        this.updateScore(data.score);
        this.updateLives(data.lives);
        this.levelText.textContent = 'NIVEAU: ' + data.level;
        this.updateTime(data.timeLimit);
    }

    flashElement(element, continuous = false) {
        element.style.animation = `flash ${continuous ? 'infinite' : '4'} 0.5s`;
    }

    pulseElement(element) {
        element.style.animation = 'pulse 0.2s';
        element.addEventListener('animationend', () => {
            element.style.animation = '';
        }, { once: true });
    }

    // Add necessary CSS animations
    addCssAnimations() {
        if (!document.getElementById('ui-animations')) {
            const style = document.createElement('style');
            style.id = 'ui-animations';
            style.textContent = `
                @keyframes flash {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
    }
}