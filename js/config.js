/**
 * Configuration du jeu Super Mario pour tous les navigateurs
 */
const config = {
    // Configuration générale
    gameTitle: "Super Mario",
    version: "1.0.0",
    
    // Paramètres du jeu
    startLives: 3,
    gravity: 1500,
    playerSpeed: 300,
    playerJumpForce: 600,
    
    // Dimensions du monde
    tileSize: 32,
    
    // Configuration d'affichage
    display: {
        width: 800,
        height: 600,
        backgroundColor: "#6b8cff"
    },
    
    // Configuration de la caméra
    camera: {
        lerp: 0.1,
        deadzone: {
            x: 100,
            y: 100
        }
    },
    
    // Paramètres des niveaux
    levels: [
        {
            name: "Niveau 1",
            mapKey: "level1",
            bgm: "level1_music",
            nextLevel: "level2",
            timeLimit: 300 // en secondes
        },
        {
            name: "Niveau 2",
            mapKey: "level2",
            bgm: "level2_music",
            nextLevel: "level3",
            timeLimit: 240
        },
        {
            name: "Niveau 3",
            mapKey: "level3",
            bgm: "level3_music",
            nextLevel: null, // dernier niveau
            timeLimit: 180
        }
    ],
    
    // Configurations pour sauvegardes locales
    storage: {
        saveProgressInterval: 30000, // sauvegarde toutes les 30 secondes
    }
};