/**
 * MainMenuScene - Displays the main menu of the game
 */
class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        // Create background layers with CSS
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

    createBackground() {
        // Create CSS background layers
        const backgrounds = ['sky', 'mountains', 'trees'];
        backgrounds.forEach((layer, index) => {
            const bgElement = document.createElement('div');
            bgElement.className = `menu-background menu-${layer}`;
            bgElement.style.zIndex = index + 1;
            document.getElementById('game-container').appendChild(bgElement);
            this.cssElements = this.cssElements || [];
            this.cssElements.push(bgElement);
        });
    }

    createMenuElements() {
        const centerX = config.display.width / 2;
        
        // Create CSS-based logo
        const logo = document.createElement('div');
        logo.className = 'game-logo';
        logo.textContent = 'SUPER MARIO';
        document.getElementById('game-container').appendChild(logo);
        this.cssElements.push(logo);
        
        // Create menu buttons using CSS
        const menuItems = [
            { text: 'PLAY', y: 280, onClick: () => this.startGame() },
            { text: 'LEADERBOARD', y: 340, onClick: () => this.showLeaderboard() },
            { text: 'OPTIONS', y: 400, onClick: () => this.showOptions() }
        ];

        menuItems.forEach(item => {
            const button = document.createElement('div');
            button.className = 'menu-button';
            button.style.position = 'absolute';
            button.style.left = '50%';
            button.style.top = `${item.y}px`;
            button.style.transform = 'translateX(-50%)';

            const text = document.createElement('span');
            text.className = 'menu-button-text';
            text.textContent = item.text;
            button.appendChild(text);

            button.addEventListener('click', item.onClick);
            document.getElementById('game-container').appendChild(button);
            this.cssElements.push(button);
        });

        // Sound toggle button
        const soundButton = document.createElement('div');
        soundButton.className = 'menu-button';
        soundButton.style.position = 'absolute';
        soundButton.style.right = '20px';
        soundButton.style.top = '20px';
        soundButton.style.width = '50px';
        soundButton.style.height = '50px';
        soundButton.style.borderRadius = '50%';

        const soundIcon = document.createElement('span');
        soundIcon.className = 'menu-button-text';
        soundIcon.textContent = this.game.globals.soundEnabled ? '🔊' : '🔇';
        soundButton.appendChild(soundIcon);

        soundButton.addEventListener('click', () => {
            this.game.globals.soundEnabled = !this.game.globals.soundEnabled;
            soundIcon.textContent = this.game.globals.soundEnabled ? '🔊' : '🔇';
            this.sound.mute = !this.game.globals.soundEnabled;
        });

        document.getElementById('game-container').appendChild(soundButton);
        this.cssElements.push(soundButton);

        // Version text
        const version = document.createElement('div');
        version.style.position = 'absolute';
        version.style.bottom = '20px';
        version.style.left = '50%';
        version.style.transform = 'translateX(-50%)';
        version.style.color = 'white';
        version.style.fontSize = '14px';
        version.textContent = `v${config.version}`;
        document.getElementById('game-container').appendChild(version);
        this.cssElements.push(version);
    }

    showLeaderboard() {
        // Create overlay with CSS
        const overlay = document.createElement('div');
        overlay.className = 'menu-overlay';

        const title = document.createElement('h1');
        title.className = 'menu-overlay-title';
        title.textContent = 'LEADERBOARD';
        overlay.appendChild(title);

        GameStorage.getLeaderboard(10).then(entries => {
            if (entries.length > 0) {
                entries.forEach((entry, i) => {
                    const row = document.createElement('div');
                    row.style.color = 'white';
                    row.style.fontSize = '20px';
                    row.style.margin = '10px 0';
                    row.textContent = `${entry.rank}. ${entry.name} - ${entry.score}`;
                    overlay.appendChild(row);
                });
            } else {
                const noScores = document.createElement('div');
                noScores.style.color = 'white';
                noScores.style.fontSize = '20px';
                noScores.textContent = 'No scores available';
                overlay.appendChild(noScores);
            }

            const closeButton = document.createElement('div');
            closeButton.className = 'menu-button';
            closeButton.style.marginTop = '30px';
            const closeText = document.createElement('span');
            closeText.className = 'menu-button-text';
            closeText.textContent = 'CLOSE';
            closeButton.appendChild(closeText);

            closeButton.addEventListener('click', () => {
                overlay.remove();
            });

            overlay.appendChild(closeButton);
        });

        document.getElementById('game-container').appendChild(overlay);
        this.cssElements.push(overlay);
    }

    showOptions() {
        // Create overlay with CSS
        const overlay = document.createElement('div');
        overlay.className = 'menu-overlay';

        const title = document.createElement('h1');
        title.className = 'menu-overlay-title';
        title.textContent = 'OPTIONS';
        overlay.appendChild(title);

        // Sound option
        const soundOption = document.createElement('div');
        soundOption.style.marginBottom = '20px';
        soundOption.innerHTML = `
            <span style="color: white; font-size: 20px; margin-right: 20px;">Sound:</span>
            <div class="menu-button" style="display: inline-flex; width: 80px;">
                <span class="menu-button-text">${this.game.globals.soundEnabled ? 'ON' : 'OFF'}</span>
            </div>
        `;
        overlay.appendChild(soundOption);

        // Clear data button
        const clearButton = document.createElement('div');
        clearButton.className = 'menu-button';
        clearButton.style.marginBottom = '20px';
        const clearText = document.createElement('span');
        clearText.className = 'menu-button-text';
        clearText.textContent = 'CLEAR SAVED DATA';
        clearButton.appendChild(clearText);

        clearButton.addEventListener('click', () => {
            GameStorage.clearGameData();
            this.game.globals.gameData = {
                score: 0,
                lives: config.startLives,
                level: 1,
                collectedCoins: 0,
                defeatedEnemies: 0,
                gameCompleted: false
            };

            const confirm = document.createElement('div');
            confirm.style.color = '#00ff00';
            confirm.style.fontSize = '18px';
            confirm.style.marginTop = '10px';
            confirm.textContent = 'Game data cleared!';
            overlay.appendChild(confirm);

            setTimeout(() => confirm.remove(), 2000);
        });

        overlay.appendChild(clearButton);

        // Close button
        const closeButton = document.createElement('div');
        closeButton.className = 'menu-button';
        closeButton.style.marginTop = '20px';
        const closeText = document.createElement('span');
        closeText.className = 'menu-button-text';
        closeText.textContent = 'CLOSE';
        closeButton.appendChild(closeText);

        closeButton.addEventListener('click', () => {
            overlay.remove();
        });

        overlay.appendChild(closeButton);
        document.getElementById('game-container').appendChild(overlay);
        this.cssElements.push(overlay);
    }

    startGame() {
        // Clean up CSS elements before starting game
        if (this.cssElements) {
            this.cssElements.forEach(element => element.remove());
        }
        
        // Stop menu music
        if (this.music) {
            this.music.stop();
        }
        
        // Start game
        this.scene.start('GameScene', { level: this.game.globals.gameData.level || 1 });
        this.scene.start('UIScene');
    }
}