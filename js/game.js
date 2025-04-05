/**
 * Fichier principal du jeu Super Mario - Version pour navigateurs standards
 */

// Configuration principale de Phaser
const gameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: config.display.width,
    height: config.display.height,
    backgroundColor: config.display.backgroundColor,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: config.gravity },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    // Optimisation pour éviter l'avertissement Canvas2D sur willReadFrequently
    render: {
        antialias: false,
        pixelArt: true,
        roundPixels: true,
        transparent: false,
        clearBeforeRender: true,
        premultipliedAlpha: false,
        powerPreference: 'high-performance',
        batchSize: 4096,
        maxLights: 10,
        maxTextures: 8,
        mipmapFilter: 'LINEAR_MIPMAP_LINEAR',
        desynchronized: true, // Réduit la latence
        willReadFrequently: true // Résout l'avertissement sur getImageData
    },
    scene: [
        BootScene,
        PreloadScene,
        MainMenuScene,
        GameScene,
        UIScene
    ]
};

// Fonction d'initialisation du jeu pour tous les navigateurs
window.onload = function() {
    // Création de l'instance du jeu Phaser
    startGame();
};

// Fonction pour démarrer le jeu Phaser
function startGame() {
    window.game = new Phaser.Game(gameConfig);
    
    // Ajouter des gestionnaires d'événements pour les changements de taille
    window.addEventListener('resize', function() {
        if (window.game.isBooted) {
            window.game.scale.refresh();
        }
    });
}

// Fonctions utilitaires globales pour la sauvegarde et le chargement
const GameStorage = {
    // Sauvegarder les données du jeu
    saveGameData: function(data) {
        try {
            localStorage.setItem('marioGameData', JSON.stringify(data));
            console.log('Game data saved successfully');
            return Promise.resolve();
        } catch (error) {
            console.error('Error saving game data:', error);
            return Promise.reject(error);
        }
    },
    
    // Charger les données du jeu
    loadGameData: function() {
        try {
            const savedData = localStorage.getItem('marioGameData');
            if (savedData) {
                return Promise.resolve(JSON.parse(savedData));
            }
            return Promise.resolve(null);
        } catch (error) {
            console.error('Error loading game data:', error);
            return Promise.resolve(null);
        }
    },
    
    // Sauvegarder un score
    saveScore: function(score) {
        try {
            // Récupérer les scores existants
            let scores = [];
            const savedScores = localStorage.getItem('marioGameScores');
            if (savedScores) {
                scores = JSON.parse(savedScores);
            }
            
            // Ajouter le nouveau score
            scores.push({
                score: score,
                date: new Date().toISOString()
            });
            
            // Trier les scores (du plus élevé au plus bas)
            scores.sort((a, b) => b.score - a.score);
            
            // Ne garder que les 10 meilleurs scores
            if (scores.length > 10) {
                scores = scores.slice(0, 10);
            }
            
            // Sauvegarder les scores
            localStorage.setItem('marioGameScores', JSON.stringify(scores));
            console.log(`Score ${score} saved to leaderboard`);
            return Promise.resolve();
        } catch (error) {
            console.error('Error saving score:', error);
            return Promise.reject(error);
        }
    },
    
    // Récupérer le classement
    getLeaderboard: function(count = 10) {
        try {
            const savedScores = localStorage.getItem('marioGameScores');
            if (savedScores) {
                const scores = JSON.parse(savedScores);
                return Promise.resolve(scores.slice(0, count).map((entry, index) => ({
                    rank: index + 1,
                    name: 'Player',
                    score: entry.score,
                    date: entry.date
                })));
            }
            return Promise.resolve([]);
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            return Promise.resolve([]);
        }
    },
    
    // Effacer les données de jeu
    clearGameData: function() {
        try {
            localStorage.removeItem('marioGameData');
            console.log('Game data cleared');
            return Promise.resolve();
        } catch (error) {
            console.error('Error clearing game data:', error);
            return Promise.reject(error);
        }
    }
};