/**
 * GameScene - CSS-based game scene without images
 */
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        // Level to load
        this.currentLevel = data.level || 1;
        
        // Game state
        this.isGameOver = false;
        this.isPaused = false;
        
        // Timer
        this.gameTimer = 0;
        this.levelData = config.levels[this.currentLevel - 1];
        this.timeLimit = this.levelData.timeLimit;
        
        // Save interval
        this.lastSaveTime = 0;
        
        // CSS DOM elements container
        this.cssElements = [];
    }

    create() {
        // Create level
        this.createLevel();
        
        // Create player (CSS-styled)
        this.createPlayer();
        
        // Create collectibles
        this.createCollectibles();
        
        // Setup camera
        this.setupCamera();
        
        // Setup collisions
        this.setupCollisions();
        
        // Setup controls
        this.setupControls();
        
        // Start level timer
        this.startLevelTimer();
        
        // Notify UI scene that game has started
        this.events.emit('gameStarted', {
            level: this.currentLevel,
            lives: this.game.globals.gameData.lives,
            score: this.game.globals.gameData.score,
            timeLimit: this.timeLimit
        });
    }

    createLevel() {
        try {
            // Get the correct key for the current level
            const mapKey = `level${this.currentLevel}`;
            console.log(`Loading tilemap with key: ${mapKey}`);
            
            // Before trying to load the tilemap, check if it exists in the cache
            if (!this.cache.tilemap.exists(mapKey)) {
                console.error(`Tilemap with key '${mapKey}' not found in cache. Creating fallback level.`);
                this.createCssFallbackLevel();
                return;
            }
            
            // Create a fallback level first as a backup
            this.createCssFallbackLevel();
            const originalMap = this.map;
            
            try {
                // Try to create map from tilemap with CSS support
                this.map = this.make.tilemap({ key: mapKey });
                
                // Check if the map has our cssFormatting flag
                if (!this.map.cssFormatting) {
                    this.map.cssFormatting = true; // Mark it for CSS formatting
                }
                
                // If we get here, then the tilemap was created, but we still need to check if it has valid data
                if (!this.map || !this.map.layers || this.map.layers.length === 0) {
                    console.error("Tilemap doesn't have valid layers. Using fallback level.");
                    this.map = originalMap;
                    return;
                }
                
                // Set up CSS-based tileset
                this.createCssTileset();
                const tileset = this.cssTileset;
                
                // Successfully created tilemap and tileset, so we can clear the fallback
                this.cameras.main.setBackgroundColor(0x6b8cff);
                
                // Clear any existing DOM elements
                this.clearCssElements();
                
                // Create the game world with CSS styling
                this.createCssBackground();
                this.createCssGround();
                
                // Create special objects (flag, etc.) with CSS styling
                this.specialObjects = this.physics.add.group();
                
                // Find level finish point (flag)
                try {
                    let finishPoint = null;
                    if (this.map.objects && this.map.objects.length > 0) {
                        const objectsLayer = this.map.objects.find(layer => layer.name === 'objects');
                        if (objectsLayer && objectsLayer.objects) {
                            finishPoint = objectsLayer.objects.find(obj => obj.name === 'finish');
                        }
                    }
                    
                    if (finishPoint) {
                        // Create CSS-styled flag
                        this.finishFlag = this.createCssFlag(finishPoint.x, finishPoint.y);
                    } else {
                        // Create a default finish point if none exists in the map
                        this.finishFlag = this.createCssFlag(this.map.widthInPixels - 200 || 2800, 350);
                    }
                } catch (e) {
                    console.warn("Could not create finish flag:", e.message);
                    // Create a default CSS-styled flag
                    this.finishFlag = this.createCssFlag(this.map.widthInPixels - 200 || 2800, 350);
                }
                
                // Create spawn points for player
                this.findValidSpawnPositions();
                
            } catch (innerError) {
                console.error("Error loading tilemap:", innerError);
                // Keep using the fallback level we already created
                this.map = originalMap;
            }
            
        } catch (error) {
            console.error("Critical error creating level:", error);
            this.createCssFallbackLevel();
        }
    }
    
    // Create a CSS-styled flag game object
    createCssFlag(x, y) {
        // Create a DOM element for the flag
        const flagElement = document.createElement('div');
        flagElement.className = 'flag';
        
        // Create pole and cloth
        const pole = document.createElement('div');
        pole.className = 'flag-pole';
        
        const cloth = document.createElement('div');
        cloth.className = 'flag-cloth';
        
        // Add to DOM
        flagElement.appendChild(pole);
        flagElement.appendChild(cloth);
        
        // Position the flag
        flagElement.style.left = `${x}px`;
        flagElement.style.top = `${y}px`;
        
        // Add to game world
        document.getElementById('game-world').appendChild(flagElement);
        
        // Add to CSS elements array for cleanup
        this.cssElements.push(flagElement);
        
        // Create a physics body for the flag
        const flag = this.specialObjects.create(x, y, 'flag');
        flag.setVisible(false); // Hide the sprite, we're using CSS
        flag.body.setSize(32, 64);
        flag.body.allowGravity = false;
        flag.body.setImmovable(true);
        
        return flag;
    }
    
    // Create a custom tileset for CSS-styled tiles
    createCssTileset() {
        // This is a placeholder for the physics engine
        this.cssTileset = {
            getTileProperties: (index) => {
                return { collides: index > 0 };
            },
            getTileData: (index) => {
                if (index === 0) return { cssClass: '' };
                if (index === 1) return { cssClass: 'ground-tile' };
                if (index === 2) return { cssClass: 'brick-block' };
                if (index === 3) return { cssClass: 'question-block' };
                return { cssClass: 'ground-tile' }; // Default
            }
        };
    }
    
    // Create CSS-based background
    createCssBackground() {
        // Make sure game-world exists
        let gameWorld = document.getElementById('game-world');
        if (!gameWorld) {
            console.log("Creating missing game-world element");
            gameWorld = document.createElement('div');
            gameWorld.id = 'game-world';
            gameWorld.style.position = 'absolute';
            gameWorld.style.width = '100%';
            gameWorld.style.height = '100%';
            document.getElementById('game-container').appendChild(gameWorld);
        }
        
        // Create a sky background
        const sky = document.createElement('div');
        sky.className = 'css-sky';
        sky.style.position = 'absolute';
        sky.style.width = `${this.map.widthInPixels}px`;
        sky.style.height = `${this.map.heightInPixels}px`;
        sky.style.background = 'linear-gradient(180deg, #87CEEB 0%, #E0F7FA 100%)';
        sky.style.zIndex = '1';
        
        gameWorld.appendChild(sky);
        this.cssElements.push(sky);
        
        // Add some clouds for decoration
        for (let i = 0; i < 10; i++) {
            const cloud = document.createElement('div');
            cloud.className = 'cloud';
            cloud.style.left = `${Math.random() * this.map.widthInPixels}px`;
            cloud.style.top = `${Math.random() * (this.map.heightInPixels / 3)}px`;
            
            gameWorld.appendChild(cloud);
            this.cssElements.push(cloud);
        }
    }
    
    // Create CSS-based ground tiles
    createCssGround() {
        if (!this.map || !this.map.layers) return;
        
        // Create a physics group for ground collision
        this.groundLayer = this.physics.add.staticGroup();
        
        // Find the ground layer in the tilemap
        const groundLayerData = this.map.layers.find(layer => layer.name === 'ground');
        
        if (groundLayerData && groundLayerData.data) {
            // Iterate through tiles and create CSS elements for each non-empty tile
            for (let y = 0; y < this.map.height; y++) {
                for (let x = 0; x < this.map.width; x++) {
                    const index = y * this.map.width + x;
                    const tileIndex = groundLayerData.data[index];
                    
                    if (tileIndex > 0) {
                        // Create a DOM element for the tile
                        const tileElement = document.createElement('div');
                        tileElement.className = 'ground-tile';
                        tileElement.style.left = `${x * this.map.tileWidth}px`;
                        tileElement.style.top = `${y * this.map.tileHeight}px`;
                        
                        // Add to game world
                        document.getElementById('game-world').appendChild(tileElement);
                        
                        // Add to CSS elements array for cleanup
                        this.cssElements.push(tileElement);
                        
                        // Create a physics body for collision
                        const tile = this.groundLayer.create(
                            x * this.map.tileWidth + this.map.tileWidth / 2,
                            y * this.map.tileHeight + this.map.tileHeight / 2,
                            'tiles'
                        );
                        tile.setVisible(false); // Hide the sprite, we're using CSS
                        tile.body.setSize(this.map.tileWidth, this.map.tileHeight);
                        tile.refreshBody();
                    }
                }
            }
        } else {
            // Create fallback ground if no ground layer found
            this.createCssFallbackGround();
        }
    }
    
    // Clear all CSS elements
    clearCssElements() {
        this.cssElements.forEach(element => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        
        this.cssElements = [];
    }

    // Find valid positions for player spawn
    findValidSpawnPositions() {
        // First try to find the designated spawn point from the object layer
        try {
            const spawnPoint = this.findObjectByName('spawn');
            if (spawnPoint) {
                this.spawnPoint = { x: spawnPoint.x, y: spawnPoint.y };
                console.log("Found designated spawn point:", this.spawnPoint);
                return;
            }
        } catch (e) {
            console.warn("Could not find spawn point from objects layer:", e.message);
        }
        
        // Default position if all else fails
        this.spawnPoint = { x: 100, y: 450 };
        console.log("Using default spawn position:", this.spawnPoint);
    }
    
    // Helper to find objects by name
    findObjectByName(name) {
        if (!this.map || !this.map.objects) return null;
        
        for (const layer of this.map.objects) {
            if (layer.objects) {
                const obj = layer.objects.find(o => o.name === name);
                if (obj) return obj;
            }
        }
        
        return null;
    }

    // Create a CSS-based fallback level
    createCssFallbackLevel() {
        console.log("Creating CSS fallback level");
        
        // Clear any existing elements
        this.clearCssElements();
        
        // Set map dimensions for camera bounds first
        this.map = {
            widthInPixels: 3000,
            heightInPixels: 600,
            width: 94,       // In tiles (3000/32)
            height: 19,      // In tiles (600/32)
            tileWidth: 32,
            tileHeight: 32,
            // Add stub methods to prevent errors
            findObject: function() { return null; },
            filterObjects: function() { return []; },
            objects: []
        };
        
        // Create a sky background
        this.createCssBackground();
        
        // Create a static ground
        this.groundLayer = this.physics.add.staticGroup();
        
        // Add CSS ground tiles
        for (let i = 0; i < 60; i++) {
            // Skip some blocks to create gaps
            if (i === 10 || i === 11 || i === 20 || i === 21 || i === 35 || i === 36) continue;
            
            // Create CSS element
            const groundElement = document.createElement('div');
            groundElement.className = 'ground-tile';
            groundElement.style.left = `${i * 50}px`;
            groundElement.style.top = '550px';
            
            document.getElementById('game-world').appendChild(groundElement);
            this.cssElements.push(groundElement);
            
            // Create physics body
            const ground = this.groundLayer.create(i * 50 + 25, 550 + 16, 'tiles');
            ground.setVisible(false);
            ground.body.setSize(50, 32);
            ground.refreshBody();
        }
        
        // Add some platforms with CSS
        const platforms = [
            { x: 300, y: 400 },
            { x: 350, y: 400 },
            { x: 400, y: 400 },
            { x: 600, y: 350 },
            { x: 650, y: 350 },
            { x: 800, y: 450 },
            { x: 850, y: 450 },
            { x: 900, y: 450 }
        ];
        
        platforms.forEach(platform => {
            // Create CSS element
            const platformElement = document.createElement('div');
            platformElement.className = 'ground-tile';
            platformElement.style.left = `${platform.x}px`;
            platformElement.style.top = `${platform.y}px`;
            
            document.getElementById('game-world').appendChild(platformElement);
            this.cssElements.push(platformElement);
            
            // Create physics body
            const p = this.groundLayer.create(platform.x + 16, platform.y + 16, 'tiles');
            p.setVisible(false);
            p.body.setSize(32, 32);
            p.refreshBody();
        });
        
        // Create special objects group
        this.specialObjects = this.physics.add.group();
        
        // Create a finish flag
        this.finishFlag = this.createCssFlag(2800, 350);
    }
    
    // Create fallback ground if the tilemap's ground layer fails to load
    createCssFallbackGround() {
        // Create a basic ground platform with CSS
        for (let i = 0; i < 60; i++) {
            // Create CSS element
            const groundElement = document.createElement('div');
            groundElement.className = 'ground-tile';
            groundElement.style.left = `${i * 50}px`;
            groundElement.style.top = '550px';
            
            document.getElementById('game-world').appendChild(groundElement);
            this.cssElements.push(groundElement);
            
            // Create physics body in the group
            const ground = this.groundLayer.create(i * 50 + 25, 550 + 16, 'tiles');
            ground.setVisible(false);
            ground.body.setSize(50, 32);
            ground.refreshBody();
        }
    }

    createPlayer() {
        try {
            // Use the spawn point determined previously
            if (this.spawnPoint) {
                // Create CSS player element
                const playerElement = document.createElement('div');
                playerElement.id = 'player';
                playerElement.className = 'player';
                playerElement.style.left = `${this.spawnPoint.x}px`;
                playerElement.style.top = `${this.spawnPoint.y}px`;
                
                document.getElementById('game-world').appendChild(playerElement);
                this.cssElements.push(playerElement);
                
                // Create a physics sprite for the player (invisible)
                this.player = this.physics.add.sprite(this.spawnPoint.x, this.spawnPoint.y, 'mario');
                this.player.setVisible(false); // Hide the sprite, using CSS instead
                this.player.body.setSize(32, 48);
                this.player.setBounce(0.1);
                this.player.element = playerElement; // Reference to CSS element
                
                // Player state
                this.player.isJumping = false;
                this.player.isDead = false;
                this.player.facing = 'right';
                
                console.log("Created CSS player at spawn point:", this.spawnPoint.x, this.spawnPoint.y);
            } else {
                console.log("No spawn point found, using safe default position");
                // Default position fallback code
                // Similar to above but with default coordinates (100, 450)
                this.spawnPoint = { x: 100, y: 450 };
                this.createPlayer(); // Recursive call with default spawn point
            }
        } catch (error) {
            console.error("Error creating player:", error);
            // Create player at default position as last resort
            this.spawnPoint = { x: 100, y: 450 };
            this.createPlayer(); // Recursive call with default spawn point
        }
    }

    createCollectibles() {
        // Group for collectible objects
        this.collectibles = this.physics.add.group();
        
        try {
            // Add coins from objects layer
            const coins = this.findCoinObjects();
            
            if (coins && coins.length > 0) {
                coins.forEach(coin => {
                    // Create CSS element for coin
                    const coinElement = document.createElement('div');
                    coinElement.className = 'coin';
                    coinElement.style.left = `${coin.x}px`;
                    coinElement.style.top = `${coin.y}px`;
                    
                    document.getElementById('game-world').appendChild(coinElement);
                    this.cssElements.push(coinElement);
                    
                    // Create physics body for coin (invisible)
                    const newCoin = this.collectibles.create(coin.x + 8, coin.y + 8, 'coin');
                    newCoin.setVisible(false); // Hide the sprite, using CSS instead
                    newCoin.body.setSize(16, 16);
                    newCoin.body.allowGravity = false;
                    newCoin.collectibleType = 'coin';
                    newCoin.element = coinElement; // Reference to CSS element
                });
            } else {
                // Create default coins if none exist in the map
                this.createDefaultCoins();
            }
        } catch (error) {
            console.error("Error creating collectibles:", error);
            // Create default coins as fallback
            this.createDefaultCoins();
        }
    }
    
    // Find coin objects from tilemap
    findCoinObjects() {
        if (!this.map.objects) return [];
        
        let coins = [];
        
        for (const layer of this.map.objects) {
            if (layer.name === 'objects' && layer.objects) {
                coins = layer.objects.filter(obj => obj.name === 'coin');
                if (coins.length > 0) break;
            }
        }
        
        return coins;
    }
    
    // Create default coins with CSS
    createDefaultCoins() {
        console.log("Creating default CSS coins");
        
        // Default coin positions
        const defaultCoinPositions = [
            { x: 350, y: 250 },
            { x: 650, y: 200 },
            { x: 800, y: 400 },
            { x: 1200, y: 250 },
            { x: 1500, y: 450 },
            { x: 1800, y: 300 },
            { x: 2200, y: 400 }
        ];
        
        defaultCoinPositions.forEach(pos => {
            // Create CSS element for coin
            const coinElement = document.createElement('div');
            coinElement.className = 'coin';
            coinElement.style.left = `${pos.x}px`;
            coinElement.style.top = `${pos.y}px`;
            
            document.getElementById('game-world').appendChild(coinElement);
            this.cssElements.push(coinElement);
            
            // Create physics body (invisible)
            const coin = this.collectibles.create(pos.x + 8, pos.y + 8, 'coin');
            coin.setVisible(false); // Hide the sprite, using CSS instead
            coin.body.setSize(16, 16);
            coin.body.allowGravity = false;
            coin.collectibleType = 'coin';
            coin.element = coinElement; // Reference to CSS element
        });
    }

    // Method to update player CSS element position based on physics
    updatePlayerCss() {
        if (this.player && this.player.element) {
            this.player.element.style.left = `${this.player.x - 16}px`; // Center the 32px element
            this.player.element.style.top = `${this.player.y - 24}px`;  // Center the 48px element
            
            // Update facing direction with CSS transform
            if (this.player.facing === 'left') {
                this.player.element.style.transform = 'scaleX(-1)';
            } else {
                this.player.element.style.transform = 'scaleX(1)';
            }
            
            // Add jumping animation class if player is jumping
            if (this.player.isJumping) {
                this.player.element.classList.add('jumping');
            } else {
                this.player.element.classList.remove('jumping');
            }
            
            // Add dead class if player is dead
            if (this.player.isDead) {
                this.player.element.classList.add('dead');
            }
        }
    }

    // Handle player movement
    handlePlayerMovement() {
        if (this.player.isDead) return;
        
        const onGround = this.player.body.blocked.down;
        
        // Reset jump state when on ground
        if (onGround) {
            this.player.isJumping = false;
        }
        
        // Left/Right movement
        if (this.cursors.left.isDown || this.leftPressed) {
            this.player.setVelocityX(-160);
            this.player.facing = 'left';
            
            if (onGround) {
                this.player.element.classList.add('walking');
            }
        } else if (this.cursors.right.isDown || this.rightPressed) {
            this.player.setVelocityX(160);
            this.player.facing = 'right';
            
            if (onGround) {
                this.player.element.classList.add('walking');
            }
        } else {
            this.player.setVelocityX(0);
            this.player.element.classList.remove('walking');
        }
        
        // Jump when on ground and up arrow is pressed
        if ((this.cursors.up.isDown || this.jumpPressed) && onGround) {
            this.player.setVelocityY(-400);
            this.player.isJumping = true;
            
            // Play jump sound
            this.sound.play('jump');
        }
        
        // Update the CSS position and animation states
        this.updatePlayerCss();
    }

    // The rest of your methods remain similar but with CSS adaptations
    // ...

    update(time, delta) {
        // Update player movement
        if (!this.isGameOver && !this.isPaused) {
            // Handle player input and update CSS
            this.handlePlayerMovement();
            
            // Check if player fell off the map
            if (this.player.y > this.map.heightInPixels) {
                this.playerDie();
            }
            
            // Update timer
            this.gameTimer += delta;
            const timeRemaining = Math.max(0, this.timeLimit - Math.floor(this.gameTimer / 1000));
            this.events.emit('timeUpdate', timeRemaining);
            
            // When time runs out
            if (timeRemaining <= 0 && !this.isGameOver) {
                this.playerDie();
            }
            
            // Auto-save at interval
            if (time - this.lastSaveTime > config.storage.saveProgressInterval) {
                this.saveGameData();
                this.lastSaveTime = time;
            }
        }
    }
}