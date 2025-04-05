/**
 * GameScene - Simplified main game scene using Mario icon
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
    }

    create() {
        // Create level
        this.createLevel();
        
        // Create player (simplified Mario icon)
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
            
            // Create map from tilemap
            this.map = this.make.tilemap({ key: mapKey });
            
            // Add tileset to map
            const tileset = this.map.addTilesetImage('tiles', 'tiles');
            
            // Create layers - with error handling in case layers don't exist
            try {
                this.backgroundLayer = this.map.createLayer('background', tileset, 0, 0);
            } catch (e) {
                console.warn("Could not create 'background' layer:", e.message);
                // Create a blank background if the layer doesn't exist
                this.backgroundLayer = this.add.rectangle(0, 0, 3000, 600, 0x6b8cff).setOrigin(0, 0);
            }
            
            try {
                this.groundLayer = this.map.createLayer('ground', tileset, 0, 0);
                // Setup collisions for ground layer
                this.groundLayer.setCollisionByProperty({ collides: true });
            } catch (e) {
                console.warn("Could not create 'ground' layer:", e.message);
                // Create some basic ground platforms if the layer doesn't exist
                this.createFallbackGround();
            }
            
            // Create special objects (flag, etc.)
            this.specialObjects = this.physics.add.group();
            
            // Find level finish point (flag)
            try {
                const finishPoint = this.map.findObject('objects', obj => obj.name === 'finish');
                if (finishPoint) {
                    this.finishFlag = this.specialObjects.create(finishPoint.x, finishPoint.y, 'flag');
                    this.finishFlag.body.allowGravity = false;
                    this.finishFlag.body.setImmovable(true);
                } else {
                    // Create a default finish point if none exists in the map
                    this.finishFlag = this.specialObjects.create(2800, 350, 'flag');
                    this.finishFlag.body.allowGravity = false;
                    this.finishFlag.body.setImmovable(true);
                }
            } catch (e) {
                console.warn("Could not create finish flag:", e.message);
                // Create a default finish point
                this.finishFlag = this.specialObjects.create(2800, 350, 'flag');
                this.finishFlag.body.allowGravity = false;
                this.finishFlag.body.setImmovable(true);
            }
        } catch (error) {
            console.error("Error creating level:", error);
            this.createFallbackLevel();
        }
    }
    
    // Create a fallback level if the tilemap fails to load
    createFallbackLevel() {
        console.log("Creating fallback level");
        // Set a background color
        this.cameras.main.setBackgroundColor(0x6b8cff);
        
        // Create a static ground
        this.groundGroup = this.physics.add.staticGroup();
        
        // Add ground platforms
        for (let i = 0; i < 60; i++) {
            // Skip some blocks to create gaps
            if (i === 10 || i === 11 || i === 20 || i === 21 || i === 35 || i === 36) continue;
            
            const ground = this.groundGroup.create(i * 50, 550, 'tiles');
            ground.setOrigin(0, 0);
            ground.refreshBody();
        }
        
        // Add some platforms
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
            const p = this.groundGroup.create(platform.x, platform.y, 'tiles');
            p.setOrigin(0, 0);
            p.refreshBody();
        });
        
        // Create special objects group
        this.specialObjects = this.physics.add.group();
        
        // Create a finish flag
        this.finishFlag = this.specialObjects.create(2800, 350, 'flag');
        this.finishFlag.body.allowGravity = false;
        this.finishFlag.body.setImmovable(true);
        
        // Set map dimensions for camera bounds
        this.map = {
            widthInPixels: 3000,
            heightInPixels: 600,
            // Add stub methods to prevent errors
            findObject: function() { return null; },
            filterObjects: function() { return []; },
            createLayer: function() { 
                console.log("Attempted to create layer on fallback map");
                return null; 
            }
        };
    }
    
    // Create fallback ground if the tilemap's ground layer fails to load
    createFallbackGround() {
        this.groundGroup = this.physics.add.staticGroup();
        
        // Create a basic ground platform
        for (let i = 0; i < 60; i++) {
            const ground = this.groundGroup.create(i * 50, 550, 'tiles');
            ground.setOrigin(0, 0);
            ground.refreshBody();
        }
        
        // We'll use this instead of the tilemap's ground layer
        this.groundLayer = this.groundGroup;
    }

    createPlayer() {
        try {
            // Find player spawn point
            const spawnPoint = this.map.findObject('objects', obj => obj.name === 'spawn');
            
            if (spawnPoint) {
                // Create player using our simplified Player class
                this.player = new Player(this, spawnPoint.x, spawnPoint.y);
            } else {
                // Default spawn point if none exists in the map
                console.log("No spawn point found, using default position");
                this.player = new Player(this, 100, 450);
            }
        } catch (error) {
            console.error("Error creating player:", error);
            // Create player at default position
            this.player = new Player(this, 100, 450);
        }
    }

    createCollectibles() {
        // Group for collectible objects
        this.collectibles = this.physics.add.group();
        
        try {
            // Add coins from objects layer
            const coins = this.map.filterObjects('objects', obj => obj.name === 'coin');
            
            if (coins && coins.length > 0) {
                coins.forEach(coin => {
                    const newCoin = this.collectibles.create(coin.x, coin.y, 'coin');
                    newCoin.setOrigin(0, 1);
                    newCoin.body.setSize(16, 16);
                    newCoin.body.allowGravity = false;
                    newCoin.collectibleType = 'coin';
                });
            } else {
                // Create some default coins if none exist in the map
                this.createDefaultCoins();
            }
        } catch (error) {
            console.error("Error creating collectibles:", error);
            // Create default coins as fallback
            this.createDefaultCoins();
        }
    }
    
    // Create some default coins
    createDefaultCoins() {
        console.log("Creating default coins");
        
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
            const coin = this.collectibles.create(pos.x, pos.y, 'coin');
            coin.body.setSize(16, 16);
            coin.body.allowGravity = false;
            coin.collectibleType = 'coin';
        });
    }

    setupCamera() {
        // Set camera bounds
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        
        // Follow player
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        
        // Add deadzone so camera doesn't follow player too closely
        this.cameras.main.setDeadzone(config.camera.deadzone.x, config.camera.deadzone.y);
    }

    setupCollisions() {
        // Collision between player and ground
        this.physics.add.collider(this.player, this.groundLayer);
        
        // Collision between player and collectibles
        this.physics.add.overlap(this.player, this.collectibles, this.handlePlayerCollectibleOverlap, null, this);
        
        // Collision between player and special objects (finish flag)
        this.physics.add.overlap(this.player, this.specialObjects, this.handlePlayerSpecialOverlap, null, this);
    }

    setupControls() {
        // Keyboard
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Touch controls (for mobile)
        if (this.sys.game.device.input.touch) {
            this.createMobileControls();
        }
        
        // Pause button
        this.input.keyboard.on('keydown-P', () => {
            this.togglePause();
        });
    }

    createMobileControls() {
        // Create touch zone on left side of screen to go left
        this.leftZone = this.add.zone(0, 0, config.display.width / 3, config.display.height)
            .setOrigin(0)
            .setInteractive();
            
        this.leftZone.on('pointerdown', () => {
            this.leftPressed = true;
        });
        
        this.leftZone.on('pointerup', () => {
            this.leftPressed = false;
        });
        
        // Create touch zone on right side of screen to go right
        this.rightZone = this.add.zone(config.display.width * 2 / 3, 0, config.display.width / 3, config.display.height)
            .setOrigin(0)
            .setInteractive();
            
        this.rightZone.on('pointerdown', () => {
            this.rightPressed = true;
        });
        
        this.rightZone.on('pointerup', () => {
            this.rightPressed = false;
        });
        
        // Create touch zone in middle of screen to jump
        this.jumpZone = this.add.zone(config.display.width / 3, 0, config.display.width / 3, config.display.height)
            .setOrigin(0)
            .setInteractive();
            
        this.jumpZone.on('pointerdown', () => {
            this.jumpPressed = true;
        });
        
        this.jumpZone.on('pointerup', () => {
            this.jumpPressed = false;
        });
    }

    startLevelTimer() {
        this.gameTimer = 0;
    }

    handlePlayerCollectibleOverlap(player, collectible) {
        if (player.isDead) return;
        
        if (collectible.collectibleType === 'coin') {
            // Collect a coin
            collectible.destroy();
            this.sound.play('coin');
            this.addScore(50);
            
            // Increment coin counter
            this.game.globals.gameData.collectedCoins++;
            
            // Emit event to update coin display
            this.events.emit('coinCollected', this.game.globals.gameData.collectedCoins);
        }
    }

    handlePlayerSpecialOverlap(player, specialObject) {
        if (player.isDead) return;
        
        if (specialObject === this.finishFlag) {
            // Player reached finish flag
            this.levelComplete();
        }
    }

    playerDie() {
        if (this.player.isDead) return;
        
        // Mark player as dead
        this.player.die();
        
        // Play a sound with error handling
        try {
            this.sound.play('death');
        } catch (error) {
            console.warn("Failed to play death sound:", error);
            // Create a silent fallback for the death sound if it doesn't exist
            if (!this.cache.audio.exists('death')) {
                this.createEmergencySound('death');
            }
        }
        
        // Lose a life
        this.game.globals.gameData.lives--;
        
        // Update lives display
        this.events.emit('livesUpdate', this.game.globals.gameData.lives);
        
        // Save game data
        this.saveGameData();
        
        // Check if game over
        if (this.game.globals.gameData.lives <= 0) {
            this.gameOver();
        } else {
            // Otherwise, restart level after delay
            this.time.delayedCall(1500, () => {
                this.scene.restart({ level: this.currentLevel });
            });
        }
    }
    
    // Create an emergency sound if somehow the sound wasn't properly loaded
    createEmergencySound(key) {
        console.log(`Creating emergency silent sound for "${key}"`);
        // Add a silent sound to the cache to prevent errors
        this.cache.audio.add(key, {
            duration: 0.1,
            // This creates a minimal, silent Web Audio sound
            play: function() { return { stop: function() {} }; }
        });
    }

    gameOver() {
        this.isGameOver = true;
        
        // Save high score before resetting
        GameStorage.saveScore(this.game.globals.gameData.score);
        
        // Reset game data
        this.game.globals.gameData.lives = config.startLives;
        this.game.globals.gameData.score = 0;
        this.game.globals.gameData.level = 1;
        
        // Save reset game data
        this.saveGameData();
        
        // Return to main menu
        this.time.delayedCall(1500, () => {
            this.scene.start('MainMenuScene');
            this.scene.stop('UIScene');
        });
    }

    levelComplete() {
        // Disable controls
        this.game.globals.controlsEnabled = false;
        
        // Stop player movement
        this.player.setVelocity(0, 0);
        
        // Play a victory sound
        this.sound.play('levelcomplete');
        
        // Add time bonus points
        const timeRemaining = Math.max(0, this.timeLimit - Math.floor(this.gameTimer / 1000));
        const timeBonus = timeRemaining * 10;
        
        this.addScore(timeBonus);
        
        // Increment level
        this.game.globals.gameData.level++;
        
        // Save game data
        this.saveGameData();
        
        // Check if it's the last level
        if (this.levelData.nextLevel) {
            // Go to next level after delay
            this.time.delayedCall(2000, () => {
                this.scene.restart({ level: this.game.globals.gameData.level });
            });
        } else {
            // Game completed, save final score to leaderboard
            GameStorage.saveScore(this.game.globals.gameData.score);
            
            // Return to main menu
            this.time.delayedCall(2000, () => {
                this.game.globals.gameData.gameCompleted = true;
                this.scene.start('MainMenuScene');
                this.scene.stop('UIScene');
            });
        }
    }

    addScore(points) {
        // Add points to score
        this.game.globals.gameData.score += points;
        
        // Emit event to update score display
        this.events.emit('scoreUpdate', this.game.globals.gameData.score);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            // Pause game
            this.physics.pause();
            
            // Show pause menu
            this.createPauseMenu();
        } else {
            // Resume game
            this.physics.resume();
            
            // Remove pause menu
            this.pauseMenu.destroy();
        }
    }

    createPauseMenu() {
        // Create a group for pause menu elements
        this.pauseMenu = this.add.group();
        
        // Semi-transparent background
        const background = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7);
        background.setScrollFactor(0);
        background.setOrigin(0);
        this.pauseMenu.add(background);
        
        // Pause text
        const pauseText = this.add.text(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 2 - 80,
            'PAUSE',
            {
                fontSize: '48px',
                fill: '#ffffff',
                fontStyle: 'bold'
            }
        );
        pauseText.setScrollFactor(0);
        pauseText.setOrigin(0.5);
        this.pauseMenu.add(pauseText);
        
        // Resume button
        const resumeButton = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            200, 50,
            0x6666ff
        );
        resumeButton.setScrollFactor(0);
        resumeButton.setInteractive();
        
        const resumeText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'RESUME',
            {
                fontSize: '24px',
                fill: '#ffffff',
                fontStyle: 'bold'
            }
        );
        resumeText.setScrollFactor(0);
        resumeText.setOrigin(0.5);
        
        resumeButton.on('pointerup', () => {
            this.togglePause();
        });
        
        this.pauseMenu.add(resumeButton);
        this.pauseMenu.add(resumeText);
        
        // Quit button
        const quitButton = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 70,
            200, 50,
            0xff6666
        );
        quitButton.setScrollFactor(0);
        quitButton.setInteractive();
        
        const quitText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 70,
            'QUIT',
            {
                fontSize: '24px',
                fill: '#ffffff',
                fontStyle: 'bold'
            }
        );
        quitText.setScrollFactor(0);
        quitText.setOrigin(0.5);
        
        quitButton.on('pointerup', () => {
            this.scene.start('MainMenuScene');
            this.scene.stop('UIScene');
        });
        
        this.pauseMenu.add(quitButton);
        this.pauseMenu.add(quitText);
    }

    // Save game data
    saveGameData() {
        GameStorage.saveGameData(this.game.globals.gameData);
    }

    update(time, delta) {
        // Update player movement
        if (!this.isGameOver && !this.isPaused) {
            // Update player
            const mobileControls = {
                left: this.leftPressed,
                right: this.rightPressed,
                jump: this.jumpPressed
            };
            
            this.player.update(this.cursors, this.spaceKey, mobileControls);
            
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