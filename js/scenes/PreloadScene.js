class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
        this.loadingComplete = false;
    }

    preload() {
        // Create loading bar
        this.createLoadingBar();
        
        // Load only sounds, no images needed
        this.loadSoundAssets();
        
        // Create CSS-based tilemaps
        this.createCssTilemap('level1');
        this.createCssTilemap('level2');
        this.createCssTilemap('level3');
        
        this.load.on('complete', () => {
            this.loadingComplete = true;
            console.log('All assets loaded!');
        });
    }

    create() {
        try {
            console.log("PreloadScene complete, moving to main menu");
            this.scene.start('MainMenuScene');
        } catch (error) {
            console.error("Error in PreloadScene.create:", error);
            this.scene.start('MainMenuScene');
        }
    }

    createLoadingBar() {
        // Create a CSS-based loading bar
        const loadingBar = document.createElement('div');
        loadingBar.style.position = 'absolute';
        loadingBar.style.left = '50%';
        loadingBar.style.top = '50%';
        loadingBar.style.transform = 'translate(-50%, -50%)';
        loadingBar.style.width = '400px';
        loadingBar.style.height = '40px';
        loadingBar.style.backgroundColor = '#333333';
        loadingBar.style.border = '2px solid white';
        
        const progress = document.createElement('div');
        progress.style.width = '0%';
        progress.style.height = '100%';
        progress.style.backgroundColor = '#42a5f5';
        progress.style.transition = 'width 0.2s';
        loadingBar.appendChild(progress);
        
        const loadingText = document.createElement('div');
        loadingText.style.position = 'absolute';
        loadingText.style.width = '100%';
        loadingText.style.top = '-30px';
        loadingText.style.textAlign = 'center';
        loadingText.style.color = 'white';
        loadingText.style.fontSize = '20px';
        loadingText.textContent = 'Loading... 0%';
        loadingBar.appendChild(loadingText);
        
        document.getElementById('game-container').appendChild(loadingBar);
        
        this.load.on('progress', (value) => {
            progress.style.width = `${value * 100}%`;
            loadingText.textContent = `Loading... ${Math.floor(value * 100)}%`;
        });
        
        this.load.on('complete', () => {
            loadingBar.remove();
        });
    }

    loadSoundAssets() {
        // Load sound effects
        this.loadSoundWithFallback('jump', 'assets/sounds/jump.wav');
        this.loadSoundWithFallback('coin', 'assets/sounds/coin.wav');
        this.loadSoundWithFallback('death', 'assets/sounds/death.wav');
        this.loadSoundWithFallback('levelcomplete', 'assets/sounds/levelcomplete.wav');
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
        // Create a short, silent sound as a fallback
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        gainNode.gain.value = 0;
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        const buffer = context.createBuffer(1, context.sampleRate * 0.1, context.sampleRate);
        const fallbackBase64 = 'data:audio/wav;base64,UklGRiSAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
        
        this.cache.audio.add(key, {
            type: 'wav',
            data: new Audio(fallbackBase64)
        });
        
        console.log(`Created fallback sound for ${key}`);
    }

    createCssTilemap(key) {
        if (!this.cache.tilemap.exists(key)) {
            console.log(`Creating CSS tilemap for ${key}`);
            
            const cssTilemap = {
                width: 30,
                height: 15,
                tilewidth: 32,
                tileheight: 32,
                cssFormatting: true,
                tilesets: [{
                    name: 'tiles',
                    firstgid: 1,
                    tilewidth: 32,
                    tileheight: 32,
                    tilecount: 1,
                    columns: 1,
                    cssClass: 'ground-tile'
                }],
                layers: [
                    {
                        name: 'background',
                        width: 30,
                        height: 15,
                        type: 'tilelayer',
                        data: Array(30 * 15).fill(0)
                    },
                    {
                        name: 'ground',
                        width: 30,
                        height: 15,
                        type: 'tilelayer',
                        properties: [{ name: 'collides', type: 'bool', value: true }],
                        data: Array(30 * 15).fill(0)
                    },
                    {
                        name: 'objects',
                        type: 'objectgroup',
                        objects: [
                            { id: 1, name: 'spawn', x: 96, y: 416, width: 32, height: 32 },
                            { id: 2, name: 'finish', x: 864, y: 416, width: 32, height: 64 },
                            { id: 3, name: 'coin', x: 350, y: 350, width: 16, height: 16 },
                            { id: 4, name: 'coin', x: 450, y: 300, width: 16, height: 16 },
                            { id: 5, name: 'coin', x: 550, y: 250, width: 16, height: 16 },
                            { id: 6, name: 'coin', x: 650, y: 300, width: 16, height: 16 },
                            { id: 7, name: 'coin', x: 750, y: 350, width: 16, height: 16 }
                        ]
                    }
                ]
            };
            
            // Set the ground tiles
            for (let i = 0; i < cssTilemap.width; i++) {
                cssTilemap.layers[1].data[14 * cssTilemap.width + i] = 1; // Bottom row
                
                // Add platforms
                if (i >= 4 && i <= 6) {
                    cssTilemap.layers[1].data[10 * cssTilemap.width + i] = 1;
                }
                if (i >= 10 && i <= 12) {
                    cssTilemap.layers[1].data[8 * cssTilemap.width + i] = 1;
                }
                if (i >= 16 && i <= 18) {
                    cssTilemap.layers[1].data[6 * cssTilemap.width + i] = 1;
                }
                if (i >= 22 && i <= 24) {
                    cssTilemap.layers[1].data[10 * cssTilemap.width + i] = 1;
                }
            }
            
            this.cache.tilemap.add(key, { data: cssTilemap });
            console.log(`Added CSS tilemap ${key} to cache`);
        }
    }
}