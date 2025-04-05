/**
 * PreloadScene - Simplified asset loading for Mario icon version
 */
class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
        this.loadingComplete = false;
    }

    preload() {
        // Create loading bar
        this.createLoadingBar();
        
        // Add error handler for resources
        this.load.on('loaderror', (fileObj) => {
            console.warn(`Error loading file: ${fileObj.key}`);
        });
        
        // Load the bare minimum assets needed
        this.loadEssentialAssets();
        
        // Add event when everything is loaded
        this.load.on('complete', () => {
            this.loadingComplete = true;
            console.log('All assets loaded!');
        });
    }

    create() {
        try {
            // Only create simple animations if needed
            this.createBasicAnimations();
            
            // Display diagnostic message
            console.log("PreloadScene complete, moving to main menu");
            
            // Move to main menu
            this.scene.start('MainMenuScene');
        } catch (error) {
            console.error("Error in PreloadScene.create:", error);
            // Despite the error, try to move to the main menu
            this.scene.start('MainMenuScene');
        }
    }

    createLoadingBar() {
        // Create a simple loading bar using graphics
        this.loadingText = this.add.text(
            config.display.width / 2, 
            config.display.height / 2 - 50,
            'Loading...',
            { 
                font: '20px Arial',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        
        // Create graphics for progress bar
        this.bgBar = this.add.graphics();
        this.bgBar.fillStyle(0x333333, 1);
        this.bgBar.fillRect((config.display.width - 400) / 2, config.display.height / 2 - 20, 400, 40);
        
        this.progressBar = this.add.graphics();
        
        // Update graphics during loading
        this.load.on('progress', (value) => {
            this.progressBar.clear();
            this.progressBar.fillStyle(0x42a5f5, 1);
            this.progressBar.fillRect(
                (config.display.width - 400) / 2 + 2, 
                config.display.height / 2 - 18, 
                396 * value, 
                36
            );
            this.loadingText.setText(`Loading... ${Math.floor(value * 100)}%`);
        });
    }

    loadEssentialAssets() {
        // Load only essential images
        
        // Main background
        this.load.image('background-sky', 'assets/images/background-sky.jpg');
        this.load.image('background-mountains', 'assets/images/background-mountains.jpg');
        this.load.image('background-trees', 'assets/images/background-trees.jpg');
        
        // UI and logo
        this.load.image('logo', 'assets/images/logo.png');
        
        // Game objects (simplified)
        this.load.image('coin', 'assets/images/coin.png');
        this.load.image('flag', 'assets/images/flag.png');
        
        // Use icon instead of sprite sheet for Mario
        this.load.image('mario', 'assets/images/mario.png');
        this.load.image('tiles', 'assets/images/mario.png'); // Fallback for tiles.png
        
        // Icons
        this.load.image('icon-life', 'assets/images/mario.png'); // Fallback if icon-life.png is missing
        this.load.image('icon-coin', 'assets/images/coin.png');
        
        // Load sound effects with proper error handling
        this.loadSoundWithFallback('jump', 'assets/sounds/jump.wav');
        this.loadSoundWithFallback('coin', 'assets/sounds/coin.wav');
        this.loadSoundWithFallback('death', 'assets/sounds/death.wav');
        this.loadSoundWithFallback('levelcomplete', 'assets/sounds/levelcomplete.wav');
        
        // Tilemaps - corrected paths to match file structure
        this.load.tilemapTiledJSON('level1', 'assets/tilemaps/level1.json');
        this.load.tilemapTiledJSON('level2', 'assets/tilemaps/level2.json');
        this.load.tilemapTiledJSON('level3', 'assets/tilemaps/level3.json');
        
        // Adding a fallback for sounds that might be missing
        this.load.on('filecomplete', (key, type) => {
            console.log(`Loaded: ${key} (${type})`);
        });
    }
    
    // Helper function to load sounds with fallbacks
    loadSoundWithFallback(key, path) {
        this.load.audio(key, path);
        
        this.load.once('filecomplete-audio-' + key, () => {
            console.log(`Sound '${key}' loaded successfully`);
        });
        
        this.load.once('loaderror', (fileObj) => {
            if (fileObj.key === key) {
                console.warn(`Error loading sound: ${key}, creating fallback`);
                this.createFallbackSound(key);
            }
        });
    }
    
    // Create a fallback sound if the original fails to load
    createFallbackSound(key) {
        // Create a short, silent sound as a fallback to prevent errors
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        // Set gain to 0 (silent)
        gainNode.gain.value = 0;
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        // Create a 0.1 second buffer
        const buffer = context.createBuffer(1, context.sampleRate * 0.1, context.sampleRate);
        
        // Convert the buffer to base64
        const source = context.createBufferSource();
        source.buffer = buffer;
        
        // Create the fallback audio file
        const fallbackBase64 = 'data:audio/wav;base64,UklGRiSAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
        this.textures.addBase64(key + '-fallback', fallbackBase64);
        
        // Add the fallback sound to the cache
        this.cache.audio.add(key, {
            type: 'wav',
            data: new Audio(fallbackBase64)
        });
        
        console.log(`Created fallback sound for ${key}`);
    }

    createBasicAnimations() {
        // Since we're using a static icon, we don't need complex animations
        // We'll create empty animations just to avoid errors if code tries to play them
        const dummyConfig = { frameRate: 10, repeat: -1 };
        
        this.anims.create({
            key: 'mario-idle',
            frames: [ { key: 'mario', frame: 0 } ],
            ...dummyConfig
        });
        
        this.anims.create({
            key: 'mario-run',
            frames: [ { key: 'mario', frame: 0 } ],
            ...dummyConfig
        });
        
        this.anims.create({
            key: 'mario-jump',
            frames: [ { key: 'mario', frame: 0 } ],
            ...dummyConfig
        });
        
        this.anims.create({
            key: 'mario-die',
            frames: [ { key: 'mario', frame: 0 } ],
            ...dummyConfig
        });
    }
}