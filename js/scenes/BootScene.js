/**
 * BootScene - Première scène chargée lors du démarrage du jeu
 * Initialise les paramètres du jeu et charge les ressources minimales
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Create CSS-based loading screen
        this.createLoadingScreen();
    }

    create() {
        // Initialize game settings
        this.initGameSettings();
        
        // Move to preload scene
        this.scene.start('PreloadScene');
    }

    createLoadingScreen() {
        // Create loading screen container
        const loadingScreen = document.createElement('div');
        loadingScreen.style.position = 'absolute';
        loadingScreen.style.left = '0';
        loadingScreen.style.top = '0';
        loadingScreen.style.width = '100%';
        loadingScreen.style.height = '100%';
        loadingScreen.style.backgroundColor = '#000000';
        loadingScreen.style.display = 'flex';
        loadingScreen.style.flexDirection = 'column';
        loadingScreen.style.justifyContent = 'center';
        loadingScreen.style.alignItems = 'center';
        loadingScreen.style.zIndex = '1000';
        
        // Add loading text
        const loadingText = document.createElement('div');
        loadingText.textContent = 'Loading...';
        loadingText.style.color = '#ffffff';
        loadingText.style.fontSize = '24px';
        loadingText.style.marginBottom = '20px';
        loadingScreen.appendChild(loadingText);
        
        // Add simple CSS animation for visual feedback
        const loadingDots = document.createElement('div');
        loadingDots.style.display = 'flex';
        loadingDots.style.gap = '8px';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.style.width = '8px';
            dot.style.height = '8px';
            dot.style.backgroundColor = '#ffffff';
            dot.style.borderRadius = '50%';
            dot.style.animation = `loading-dot ${0.6 + i * 0.2}s infinite alternate`;
            loadingDots.appendChild(dot);
        }
        
        loadingScreen.appendChild(loadingDots);
        
        // Add animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes loading-dot {
                0% { transform: translateY(0); }
                100% { transform: translateY(-10px); }
            }
        `;
        document.head.appendChild(style);
        
        // Add to game container
        document.getElementById('game-container').appendChild(loadingScreen);
        
        // Store reference to remove later
        this.loadingScreen = loadingScreen;
        
        // Remove loading screen when moving to next scene
        this.events.once('shutdown', () => {
            loadingScreen.remove();
            style.remove();
        });
    }

    initGameSettings() {
        // Initialize global game data
        this.game.globals = {
            gameData: {
                score: 0,
                lives: config.startLives,
                level: 1,
                collectedCoins: 0,
                defeatedEnemies: 0,
                gameCompleted: false
            },
            bgmPlaying: false,
            soundEnabled: true,
            controlsEnabled: true
        };

        // Load saved game data
        this.loadSavedGameData();
    }
    
    async loadSavedGameData() {
        try {
            const savedData = await GameStorage.loadGameData();
            if (savedData) {
                console.log('Saved game data loaded', savedData);
                this.game.globals.gameData = savedData;
            } else {
                console.log('No saved game data found, using default values');
            }
        } catch (error) {
            console.error('Error loading saved game data:', error);
        }
    }
}