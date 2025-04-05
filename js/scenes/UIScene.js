/**
 * UIScene - Scène d'interface utilisateur superposée au jeu
 */
class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        // Références aux données globales
        this.globals = this.game.globals;
        
        // Éléments d'interface
        this.createUIElements();
        
        // Écouter les événements de la scène de jeu
        this.listenToGameEvents();
    }

    createUIElements() {
        // Score
        this.scoreText = this.add.text(20, 20, 'SCORE: 0', {
            fontSize: '20px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.scoreText.setScrollFactor(0);
        
        // Vies
        this.livesContainer = this.add.container(this.cameras.main.width - 20, 20);
        this.livesContainer.setScrollFactor(0);
        
        this.livesIcon = this.add.image(0, 0, 'icon-life').setScale(0.8);
        this.livesText = this.add.text(15, 0, 'x ' + this.globals.gameData.lives, {
            fontSize: '20px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0, 0.5);
        
        this.livesContainer.add([this.livesIcon, this.livesText]);
        this.livesContainer.setX(this.cameras.main.width - 20 - this.livesText.width);
        
        // Pièces collectées
        this.coinsContainer = this.add.container(this.cameras.main.width / 2, 20);
        this.coinsContainer.setScrollFactor(0);
        
        this.coinsIcon = this.add.image(-15, 0, 'icon-coin').setScale(0.8);
        this.coinsText = this.add.text(10, 0, 'x ' + this.globals.gameData.collectedCoins, {
            fontSize: '20px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0, 0.5);
        
        this.coinsContainer.add([this.coinsIcon, this.coinsText]);
        
        // Temps restant
        this.timeText = this.add.text(this.cameras.main.width / 2, 50, 'TEMPS: 300', {
            fontSize: '20px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.timeText.setScrollFactor(0);
        
        // Niveau actuel
        this.levelText = this.add.text(20, 50, 'NIVEAU: 1', {
            fontSize: '20px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.levelText.setScrollFactor(0);
        
        // Bouton de pause (visible uniquement sur mobile)
        if (this.sys.game.device.input.touch) {
            this.pauseButton = this.add.circle(this.cameras.main.width - 40, this.cameras.main.height - 40, 30, 0xffffff, 0.5)
                .setScrollFactor(0)
                .setInteractive();
                
            this.pauseIcon = this.add.text(this.cameras.main.width - 40, this.cameras.main.height - 40, '⏸️', {
                fontSize: '24px',
                fill: '#ffffff'
            }).setOrigin(0.5).setScrollFactor(0);
            
            this.pauseButton.on('pointerup', () => {
                // Émettre un événement pour mettre le jeu en pause
                const gameScene = this.scene.get('GameScene');
                if (gameScene) {
                    if (gameScene.isPaused) {
                        gameScene.togglePause();
                    } else {
                        gameScene.togglePause();
                    }
                }
            });
        }
    }

    listenToGameEvents() {
        // Récupérer la scène de jeu
        const gameScene = this.scene.get('GameScene');
        
        if (gameScene) {
            // Écouter les mises à jour du score
            gameScene.events.on('scoreUpdate', (score) => {
                this.updateScore(score);
            });
            
            // Écouter les mises à jour des vies
            gameScene.events.on('livesUpdate', (lives) => {
                this.updateLives(lives);
            });
            
            // Écouter les mises à jour des pièces collectées
            gameScene.events.on('coinCollected', (coins) => {
                this.updateCoins(coins);
            });
            
            // Écouter les mises à jour du temps
            gameScene.events.on('timeUpdate', (time) => {
                this.updateTime(time);
            });
            
            // Écouter le début du jeu
            gameScene.events.on('gameStarted', (data) => {
                this.gameStarted(data);
            });
        }
    }

    updateScore(score) {
        this.scoreText.setText('SCORE: ' + score);
    }

    updateLives(lives) {
        this.livesText.setText('x ' + lives);
        
        // Positionner le conteneur pour qu'il reste aligné à droite
        this.livesContainer.setX(this.cameras.main.width - 20 - this.livesText.width);
        
        // Animation de clignotement si le joueur perd une vie
        if (lives < this.globals.gameData.lives && lives > 0) {
            this.flashLivesText();
        }
        
        // Mettre à jour la valeur dans les données globales
        this.globals.gameData.lives = lives;
    }

    updateCoins(coins) {
        this.coinsText.setText('x ' + coins);
        
        // Animation pour rendre le texte plus grand pendant un moment
        this.tweens.add({
            targets: this.coinsContainer,
            scale: { from: 1, to: 1.2 },
            duration: 100,
            yoyo: true
        });
    }

    updateTime(time) {
        // Formater le temps en minutes:secondes
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        this.timeText.setText('TEMPS: ' + formattedTime);
        
        // Faire clignoter le temps en rouge si moins de 30 secondes
        if (time <= 30) {
            this.timeText.setFill('#ff0000');
            
            if (time <= 10) {
                // Ajouter un effet de clignotement pour les 10 dernières secondes
                if (!this.timeFlashing) {
                    this.timeFlashing = true;
                    this.flashTimeText();
                }
            }
        } else {
            this.timeText.setFill('#ffffff');
            this.timeFlashing = false;
        }
    }

    gameStarted(data) {
        // Initialiser les affichages avec les données du début de partie
        this.updateScore(data.score);
        this.updateLives(data.lives);
        this.levelText.setText('NIVEAU: ' + data.level);
        this.updateTime(data.timeLimit);
    }

    flashLivesText() {
        // Animation de clignotement pour les vies
        this.tweens.add({
            targets: this.livesText,
            alpha: { from: 1, to: 0 },
            duration: 200,
            yoyo: true,
            repeat: 3
        });
    }

    flashTimeText() {
        // Animation de clignotement pour le temps
        if (this.timeFlashing) {
            this.tweens.add({
                targets: this.timeText,
                alpha: { from: 1, to: 0 },
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        } else {
            this.timeText.alpha = 1;
            this.tweens.killTweensOf(this.timeText);
        }
    }
}