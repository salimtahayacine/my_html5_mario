/**
 * BootScene - Première scène chargée lors du démarrage du jeu
 * Initialise les paramètres du jeu et charge les ressources minimales
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Charger les ressources nécessaires pour l'écran de chargement
        this.load.image('loading-background', 'assets/loading-background.jpg');
        this.load.image('loading-progress', 'assets/loading-progress.png');
        
        // Ajouter un gestionnaire d'erreur pour les ressources
        this.load.on('loaderror', (fileObj) => {
            console.warn(`Error loading file: ${fileObj.key}`);
            // Ne pas essayer de créer des ressources de remplacement immédiatement
            // Nous le ferons dans create() quand nous saurons que le système de rendu est prêt
        });
    }

    create() {
        // Vérifier si les ressources de chargement sont disponibles et créer des fallbacks si nécessaire
        if (!this.textures.exists('loading-background')) {
            this.createLoadingBackgroundFallback();
        }
        
        if (!this.textures.exists('loading-progress')) {
            this.createLoadingProgressFallback();
        }
        
        // Initialiser les propriétés globales du jeu
        this.initGameSettings();
        
        // Passer à la scène de préchargement
        this.scene.start('PreloadScene');
    }

    createLoadingBackgroundFallback() {
        try {
            console.log("Creating fallback loading background");
            
            // Créer un simple rectangle comme fond de la barre de progression
            const bgGraphics = this.add.graphics();
            bgGraphics.fillStyle(0x333333, 1);
            bgGraphics.fillRect(0, 0, 400, 40);
            bgGraphics.lineStyle(2, 0xffffff, 1);
            bgGraphics.strokeRect(0, 0, 400, 40);
            
            // Générer une texture à partir du graphique
            bgGraphics.generateTexture('loading-background', 400, 40);
            bgGraphics.destroy();
            
            console.log("Created fallback loading background");
        } catch (error) {
            console.error("Error creating loading background fallback:", error);
        }
    }
    
    createLoadingProgressFallback() {
        try {
            console.log("Creating fallback loading progress bar");
            
            // Créer un simple rectangle comme barre de progression
            const barGraphics = this.add.graphics();
            barGraphics.fillStyle(0x42a5f5, 1);
            barGraphics.fillRect(0, 0, 396, 36);
            
            // Générer une texture à partir du graphique
            barGraphics.generateTexture('loading-progress', 396, 36);
            barGraphics.destroy();
            
            console.log("Created fallback loading progress bar");
        } catch (error) {
            console.error("Error creating loading progress fallback:", error);
        }
    }

    initGameSettings() {
        // Initialiser les données de jeu globales
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

        // Essayer de charger les données sauvegardées depuis localStorage
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