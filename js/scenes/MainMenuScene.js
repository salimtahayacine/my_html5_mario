/**
 * MainMenuScene - Displays the main menu of the game
 */
class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        // Check and create missing assets
        this.createPlaceholderAssets();
        
        // Add background images
        this.createBackground();
        
        // Add logo and buttons
        this.createMenuElements();
        
        // Play menu music (if available)
        if (this.sound.get('menu-music') === null) {
            console.log("Menu music not available, using fallback");
        } else {
            this.music = this.sound.add('menu-music', {
                loop: true,
                volume: 0.7
            });
            if (this.game.globals && this.game.globals.soundEnabled !== false) {
                this.music.play();
            }
        }
    }

    createPlaceholderAssets() {
        // Create logo placeholder if missing
        if (!this.textures.exists('logo')) {
            const logoTexture = this.textures.createCanvas('logo', 300, 100);
            const logoContext = logoTexture.getContext();
            logoContext.fillStyle = '#ff0000';
            logoContext.fillRect(0, 0, 300, 100);
            logoContext.fillStyle = '#ffffff';
            logoContext.font = '32px Arial';
            logoContext.textAlign = 'center';
            logoContext.textBaseline = 'middle';
            logoContext.fillText('SUPER MARIO', 150, 50);
            logoTexture.refresh();
        }
        
        // Create button placeholder if missing
        if (!this.textures.exists('button')) {
            const buttonTexture = this.textures.createCanvas('button', 200, 40);
            const buttonContext = buttonTexture.getContext();
            buttonContext.fillStyle = '#4a6cd4';
            buttonContext.fillRect(0, 0, 200, 40);
            buttonContext.strokeStyle = '#ffffff';
            buttonContext.lineWidth = 2;
            buttonContext.strokeRect(2, 2, 196, 36);
            buttonTexture.refresh();
        }
        
        // Create pressed button placeholder if missing
        if (!this.textures.exists('button-pressed')) {
            const buttonPressedTexture = this.textures.createCanvas('button-pressed', 200, 40);
            const buttonPressedContext = buttonPressedTexture.getContext();
            buttonPressedContext.fillStyle = '#324e9a';
            buttonPressedContext.fillRect(0, 0, 200, 40);
            buttonPressedContext.strokeStyle = '#ffffff';
            buttonPressedContext.lineWidth = 2;
            buttonPressedContext.strokeRect(2, 2, 196, 36);
            buttonPressedTexture.refresh();
        }
    }

    createBackground() {
        // Add parallax background layers
        this.add.image(0, 0, 'background-sky').setOrigin(0, 0).setScale(2);
        this.add.image(0, 0, 'background-mountains').setOrigin(0, 0).setScale(2);
        this.add.image(0, 0, 'background-trees').setOrigin(0, 0).setScale(2);
    }

    createMenuElements() {
        const centerX = config.display.width / 2;
        
        // Game logo
        this.add.image(centerX, 120, 'logo').setScale(0.8);
        
        // Play button
        const playButton = this.add.image(centerX, 280, 'button')
            .setInteractive()
            .setScale(1.0);
        
        const playText = this.add.text(centerX, 280, 'PLAY', {
            fontSize: '22px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Hover and click animations
        playButton.on('pointerover', () => {
            playButton.setScale(1.05);
        });
        
        playButton.on('pointerout', () => {
            playButton.setScale(1.0);
        });
        
        playButton.on('pointerdown', () => {
            playButton.setTexture('button-pressed');
            playText.y = 282;
        });
        
        playButton.on('pointerup', () => {
            playButton.setTexture('button');
            playText.y = 280;
            this.startGame();
        });
        
        // Leaderboard button (available for all browsers using localStorage)
        const leaderboardButton = this.add.image(centerX, 340, 'button')
            .setInteractive()
            .setScale(1.0);
        
        const leaderboardText = this.add.text(centerX, 340, 'LEADERBOARD', {
            fontSize: '22px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        leaderboardButton.on('pointerover', () => {
            leaderboardButton.setScale(1.05);
        });
        
        leaderboardButton.on('pointerout', () => {
            leaderboardButton.setScale(1.0);
        });
        
        leaderboardButton.on('pointerdown', () => {
            leaderboardButton.setTexture('button-pressed');
            leaderboardText.y = 342;
        });
        
        leaderboardButton.on('pointerup', () => {
            leaderboardButton.setTexture('button');
            leaderboardText.y = 340;
            this.showLeaderboard();
        });
        
        // Options button (replaces the invite friends button)
        const optionsButton = this.add.image(centerX, 400, 'button')
            .setInteractive()
            .setScale(1.0);
        
        const optionsText = this.add.text(centerX, 400, 'OPTIONS', {
            fontSize: '22px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        optionsButton.on('pointerover', () => {
            optionsButton.setScale(1.05);
        });
        
        optionsButton.on('pointerout', () => {
            optionsButton.setScale(1.0);
        });
        
        optionsButton.on('pointerdown', () => {
            optionsButton.setTexture('button-pressed');
            optionsText.y = 402;
        });
        
        optionsButton.on('pointerup', () => {
            optionsButton.setTexture('button');
            optionsText.y = 400;
            this.showOptions();
        });
        
        // Sound button
        const soundButton = this.add.image(config.display.width - 50, 50, 'button')
            .setInteractive()
            .setScale(0.4);
        
        const soundText = this.add.text(config.display.width - 50, 50, '🔊', {
            fontSize: '24px',
            fill: '#fff'
        }).setOrigin(0.5);
        
        soundButton.on('pointerup', () => {
            if (this.game.globals.soundEnabled) {
                this.game.globals.soundEnabled = false;
                soundText.setText('🔇');
                this.sound.mute = true;
            } else {
                this.game.globals.soundEnabled = true;
                soundText.setText('🔊');
                this.sound.mute = false;
            }
        });
        
        // Store menu elements for enabling/disabling
        this.menuElements = {
            leaderboardButton,
            leaderboardText,
            optionsButton,
            optionsText
        };
        
        // Add version info at the bottom
        this.add.text(config.display.width / 2, config.display.height - 20, `v${config.version}`, {
            fontSize: '14px',
            fill: '#fff'
        }).setOrigin(0.5);
    }

    startGame() {
        // Stop menu music
        if (this.music) {
            this.music.stop();
        }
        
        // Start game
        this.scene.start('GameScene', { level: this.game.globals.gameData.level || 1 });
        this.scene.start('UIScene');
    }

    showLeaderboard() {
        // Get leaderboard data from localStorage
        GameStorage.getLeaderboard(10).then(entries => {
            // Create overlay for leaderboard
            const overlay = this.add.rectangle(0, 0, config.display.width, config.display.height, 0x000000, 0.8)
                .setOrigin(0, 0)
                .setInteractive();
            
            // Leaderboard title
            this.add.text(config.display.width / 2, 80, 'LEADERBOARD', {
                fontSize: '32px',
                fill: '#fff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            
            // Show leaderboard entries
            if (entries.length > 0) {
                for (let i = 0; i < entries.length; i++) {
                    const entry = entries[i];
                    const y = 150 + (i * 40);
                    
                    // Rank
                    this.add.text(100, y, `${entry.rank}.`, {
                        fontSize: '20px',
                        fill: '#fff'
                    });
                    
                    // Name
                    this.add.text(150, y, entry.name, {
                        fontSize: '20px',
                        fill: '#fff'
                    });
                    
                    // Score
                    this.add.text(config.display.width - 150, y, entry.score.toString(), {
                        fontSize: '20px',
                        fill: '#fff',
                        align: 'right'
                    }).setOrigin(1, 0);
                }
            } else {
                // No scores in leaderboard
                this.add.text(config.display.width / 2, 250, 'No scores available', {
                    fontSize: '20px',
                    fill: '#fff'
                }).setOrigin(0.5);
            }
            
            // Button to close leaderboard
            const closeButton = this.add.image(config.display.width / 2, config.display.height - 80, 'button')
                .setInteractive()
                .setScale(0.7);
            
            const closeText = this.add.text(config.display.width / 2, config.display.height - 80, 'CLOSE', {
                fontSize: '20px',
                fill: '#fff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            
            closeButton.on('pointerup', () => {
                overlay.destroy();
                closeButton.destroy();
                closeText.destroy();
            });
        });
    }

    showOptions() {
        // Create overlay for options
        const overlay = this.add.rectangle(0, 0, config.display.width, config.display.height, 0x000000, 0.8)
            .setOrigin(0, 0)
            .setInteractive();
        
        // Options title
        this.add.text(config.display.width / 2, 80, 'OPTIONS', {
            fontSize: '32px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Sound toggle
        this.add.text(config.display.width / 2 - 100, 180, 'Sound:', {
            fontSize: '20px',
            fill: '#fff'
        }).setOrigin(0, 0.5);
        
        const soundToggle = this.add.image(config.display.width / 2 + 100, 180, 'button')
            .setInteractive()
            .setScale(0.5);
        
        const soundToggleText = this.add.text(config.display.width / 2 + 100, 180, 
            this.game.globals.soundEnabled ? 'ON' : 'OFF', {
            fontSize: '18px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        soundToggle.on('pointerup', () => {
            this.game.globals.soundEnabled = !this.game.globals.soundEnabled;
            soundToggleText.setText(this.game.globals.soundEnabled ? 'ON' : 'OFF');
            this.sound.mute = !this.game.globals.soundEnabled;
        });
        
        // Clear saved data
        const clearDataButton = this.add.image(config.display.width / 2, 240, 'button')
            .setInteractive()
            .setScale(0.8);
        
        const clearDataText = this.add.text(config.display.width / 2, 240, 'CLEAR SAVED DATA', {
            fontSize: '18px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        clearDataButton.on('pointerdown', () => {
            clearDataButton.setTexture('button-pressed');
            clearDataText.y = 242;
        });
        
        clearDataButton.on('pointerup', () => {
            clearDataButton.setTexture('button');
            clearDataText.y = 240;
            
            // Clear game data
            GameStorage.clearGameData();
            
            // Reset game data in memory
            this.game.globals.gameData = {
                score: 0,
                lives: config.startLives,
                level: 1,
                collectedCoins: 0,
                defeatedEnemies: 0,
                gameCompleted: false
            };
            
            // Show confirmation
            const confirmText = this.add.text(config.display.width / 2, 300, 'Game data cleared!', {
                fontSize: '18px',
                fill: '#00ff00'
            }).setOrigin(0.5);
            
            // Make confirmation disappear after 2 seconds
            this.time.delayedCall(2000, () => {
                confirmText.destroy();
            });
        });
        
        // Close button
        const closeButton = this.add.image(config.display.width / 2, config.display.height - 80, 'button')
            .setInteractive()
            .setScale(0.7);
        
        const closeText = this.add.text(config.display.width / 2, config.display.height - 80, 'CLOSE', {
            fontSize: '20px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        closeButton.on('pointerup', () => {
            overlay.destroy();
            closeButton.destroy();
            closeText.destroy();
        });
    }
}