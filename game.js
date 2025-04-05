// Game constants
const GRAVITY = 0.6;
const JUMP_FORCE = -15;
const PLAYER_SPEED = 5;
const GOOMBA_SPEED = 2;

// Game state
const gameState = {
    player: {
        x: 100,
        y: 0,
        width: 30,
        height: 50,
        velocityX: 0,
        velocityY: 0,
        isJumping: false,
        isAlive: true
    },
    keys: {
        left: false,
        right: false,
        up: false
    },
    gameObjects: {
        blocks: [],
        coins: [],
        goombas: [],
        flag: null
    },
    score: 0,
    lives: 3,
    levelWidth: 3000,
    gameOver: false,
    cameraOffset: 0
};

// DOM elements
document.addEventListener('DOMContentLoaded', function() {
    const gameWorld = document.getElementById('game-world');
    const player = document.getElementById('player');
    const scoreElement = document.getElementById('score');
    const livesElement = document.getElementById('lives');
    
    // Create game over screen
    const gameOverScreen = document.createElement('div');
    gameOverScreen.id = 'game-over';
    gameOverScreen.innerHTML = `
        <div>GAME OVER</div>
        <button id="restart-button">RESTART</button>
    `;
    document.getElementById('game-container').appendChild(gameOverScreen);
    
    // Initialize the game
    function init() {
        // Create level structure
        createLevel();
        
        // Set player initial position
        updatePlayerPosition();
        
        // Add keyboard event listeners
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        
        // Add restart button listener
        document.getElementById('restart-button').addEventListener('click', restartGame);
        
        // Start game loop
        requestAnimationFrame(gameLoop);
    }
    
    // Create level layout
    function createLevel() {
        // Create ground
        for (let i = 0; i < 60; i++) {
            // Skip some blocks to create gaps
            if (i === 10 || i === 11 || i === 20 || i === 21 || i === 35 || i === 36) continue;
            
            createBlock(i * 50, 550, 'block');
        }
        
        // Create platforms
        createBlock(300, 400, 'block');
        createBlock(350, 400, 'block');
        createBlock(400, 400, 'block');
        
        createBlock(600, 350, 'block');
        createBlock(650, 350, 'block');
        
        createBlock(800, 450, 'block');
        createBlock(850, 450, 'block');
        createBlock(900, 450, 'block');
        
        // Create question blocks
        createBlock(350, 300, 'question-block');
        createBlock(650, 250, 'question-block');
        createBlock(1200, 300, 'question-block');
        
        // Create brick blocks
        createBlock(500, 300, 'brick');
        createBlock(550, 300, 'brick');
        createBlock(1000, 350, 'brick');
        createBlock(1050, 350, 'brick');
        
        // Create coins
        createCoin(350, 250);
        createCoin(650, 200);
        createCoin(800, 400);
        createCoin(1200, 250);
        createCoin(1500, 450);
        
        // Create enemies
        createGoomba(500, 500);
        createGoomba(900, 400);
        createGoomba(1500, 500);
        
        // Create end flag
        createFlag(2800, 350);
    }
    
    // Create a block element
    function createBlock(x, y, type) {
        const block = document.createElement('div');
        block.className = type;
        block.style.left = `${x}px`;
        block.style.top = `${y}px`;
        gameWorld.appendChild(block);
        
        gameState.gameObjects.blocks.push({
            element: block,
            x,
            y,
            width: 50,
            height: 50,
            type
        });
    }
    
    // Create a coin element
    function createCoin(x, y) {
        const coin = document.createElement('div');
        coin.className = 'coin';
        coin.style.left = `${x}px`;
        coin.style.top = `${y}px`;
        gameWorld.appendChild(coin);
        
        gameState.gameObjects.coins.push({
            element: coin,
            x,
            y,
            width: 20,
            height: 30,
            collected: false
        });
    }
    
    // Create a goomba enemy
    function createGoomba(x, y) {
        const goomba = document.createElement('div');
        goomba.className = 'goomba';
        goomba.style.left = `${x}px`;
        goomba.style.top = `${y}px`;
        gameWorld.appendChild(goomba);
        
        gameState.gameObjects.goombas.push({
            element: goomba,
            x,
            y,
            width: 30,
            height: 30,
            velocityX: -GOOMBA_SPEED,
            isDead: false
        });
    }
    
    // Create end flag
    function createFlag(x, y) {
        const flag = document.createElement('div');
        flag.className = 'flag';
        flag.style.left = `${x}px`;
        flag.style.top = `${y}px`;
        gameWorld.appendChild(flag);
        
        gameState.gameObjects.flag = {
            element: flag,
            x,
            y,
            width: 50,
            height: 200
        };
    }
    
    // Handle keyboard input
    function handleKeyDown(e) {
        if (gameState.gameOver) return;
        
        switch (e.key) {
            case 'ArrowLeft':
                gameState.keys.left = true;
                player.classList.add('flip');
                break;
            case 'ArrowRight':
                gameState.keys.right = true;
                player.classList.remove('flip');
                break;
            case 'ArrowUp':
            case ' ':
                gameState.keys.up = true;
                if (!gameState.player.isJumping) {
                    jump();
                }
                break;
        }
    }
    
    function handleKeyUp(e) {
        switch (e.key) {
            case 'ArrowLeft':
                gameState.keys.left = false;
                break;
            case 'ArrowRight':
                gameState.keys.right = false;
                break;
            case 'ArrowUp':
            case ' ':
                gameState.keys.up = false;
                break;
        }
    }
    
    // Make the player jump
    function jump() {
        gameState.player.velocityY = JUMP_FORCE;
        gameState.player.isJumping = true;
        player.classList.add('jump');
        
        // Remove jump animation class after animation completes
        setTimeout(() => {
            player.classList.remove('jump');
        }, 500);
    }
    
    // Update player position based on input and physics
    function updatePlayer() {
        if (!gameState.player.isAlive) return;
        
        // Horizontal movement
        if (gameState.keys.left) {
            gameState.player.velocityX = -PLAYER_SPEED;
        } else if (gameState.keys.right) {
            gameState.player.velocityX = PLAYER_SPEED;
        } else {
            gameState.player.velocityX = 0;
        }
        
        // Apply gravity
        gameState.player.velocityY += GRAVITY;
        
        // Update position
        gameState.player.x += gameState.player.velocityX;
        gameState.player.y += gameState.player.velocityY;
        
        // Keep player inside level bounds
        if (gameState.player.x < 0) {
            gameState.player.x = 0;
        } else if (gameState.player.x > gameState.levelWidth - gameState.player.width) {
            gameState.player.x = gameState.levelWidth - gameState.player.width;
        }
        
        // Check if player fell off the level
        if (gameState.player.y > 600) {
            playerDie();
        }
        
        // Collision detection with blocks
        handleBlockCollisions();
        
        // Check for coin collection
        checkCoinCollisions();
        
        // Check for enemy collisions
        checkEnemyCollisions();
        
        // Check for flag (level complete)
        checkFlagCollision();
        
        // Update camera
        updateCamera();
        
        // Update player element position
        updatePlayerPosition();
    }
    
    // Handle collisions with blocks
    function handleBlockCollisions() {
        let onGround = false;
        
        gameState.gameObjects.blocks.forEach(block => {
            if (isColliding(gameState.player, block)) {
                // Bottom collision (player landing on block)
                if (gameState.player.velocityY > 0 && 
                    gameState.player.y + gameState.player.height - gameState.player.velocityY <= block.y) {
                    gameState.player.y = block.y - gameState.player.height;
                    gameState.player.velocityY = 0;
                    gameState.player.isJumping = false;
                    onGround = true;
                }
                // Top collision (player hitting block from below)
                else if (gameState.player.velocityY < 0 && 
                         gameState.player.y >= block.y + block.height - gameState.player.velocityY) {
                    gameState.player.y = block.y + block.height;
                    gameState.player.velocityY = 0;
                    
                    // Special effect for question blocks
                    if (block.type === 'question-block') {
                        // Spawn a coin above the block when hit
                        createCoin(block.x + 15, block.y - 40);
                        block.element.style.backgroundColor = '#A0A0A0'; // Turn gray after hit
                        block.type = 'hit-block'; // Change type to prevent multiple hits
                    }
                }
                // Left collision
                else if (gameState.player.velocityX > 0 && 
                         gameState.player.x + gameState.player.width - gameState.player.velocityX <= block.x) {
                    gameState.player.x = block.x - gameState.player.width;
                }
                // Right collision
                else if (gameState.player.velocityX < 0 && 
                         gameState.player.x >= block.x + block.width - gameState.player.velocityX) {
                    gameState.player.x = block.x + block.width;
                }
            }
        });
        
        // If not on any ground, player is jumping/falling
        if (!onGround) {
            gameState.player.isJumping = true;
        }
    }
    
    // Update goombas
    function updateGoombas() {
        gameState.gameObjects.goombas.forEach(goomba => {
            if (goomba.isDead) return;
            
            // Move goomba
            goomba.x += goomba.velocityX;
            
            // Check for collision with blocks
            gameState.gameObjects.blocks.forEach(block => {
                if (isColliding(goomba, block)) {
                    // Reverse direction when hitting a block
                    goomba.velocityX = -goomba.velocityX;
                }
            });
            
            // Update goomba element position
            goomba.element.style.left = `${goomba.x - gameState.cameraOffset}px`;
            goomba.element.style.top = `${goomba.y}px`;
        });
    }
    
    // Check for coin collisions
    function checkCoinCollisions() {
        gameState.gameObjects.coins.forEach(coin => {
            if (!coin.collected && isColliding(gameState.player, coin)) {
                coin.collected = true;
                coin.element.style.display = 'none';
                gameState.score += 100;
                updateScore();
            }
        });
    }
    
    // Check for enemy collisions
    function checkEnemyCollisions() {
        gameState.gameObjects.goombas.forEach(goomba => {
            if (!goomba.isDead && isColliding(gameState.player, goomba)) {
                // Player is falling onto enemy (stomping)
                if (gameState.player.velocityY > 0 && 
                    gameState.player.y + gameState.player.height - gameState.player.velocityY <= goomba.y) {
                    
                    // Kill the goomba
                    goomba.isDead = true;
                    goomba.element.style.height = '15px';
                    goomba.element.style.top = `${goomba.y + 15}px`;
                    goomba.element.style.backgroundColor = '#555';
                    
                    // Bounce player
                    gameState.player.velocityY = -10;
                    
                    // Add score
                    gameState.score += 200;
                    updateScore();
                    
                    // Remove goomba after delay
                    setTimeout(() => {
                        goomba.element.style.display = 'none';
                    }, 1000);
                } else {
                    // Player hit enemy from side or bottom
                    playerDie();
                }
            }
        });
    }
    
    // Check for flag collision (level complete)
    function checkFlagCollision() {
        if (gameState.gameObjects.flag && isColliding(gameState.player, gameState.gameObjects.flag)) {
            // Level complete!
            gameState.score += 1000;
            updateScore();
            
            // Display level complete message
            const levelComplete = document.createElement('div');
            levelComplete.textContent = 'LEVEL COMPLETE!';
            levelComplete.style.position = 'absolute';
            levelComplete.style.top = '50%';
            levelComplete.style.left = '50%';
            levelComplete.style.transform = 'translate(-50%, -50%)';
            levelComplete.style.color = 'white';
            levelComplete.style.fontSize = '48px';
            levelComplete.style.fontWeight = 'bold';
            levelComplete.style.textShadow = '2px 2px 0 #000';
            levelComplete.style.zIndex = '100';
            document.getElementById('game-container').appendChild(levelComplete);
            
            // Freeze the game
            gameState.gameOver = true;
            
            // Add restart option after delay
            setTimeout(() => {
                gameOverScreen.style.display = 'flex';
                gameOverScreen.firstElementChild.textContent = 'YOU WIN!';
            }, 3000);
        }
    }
    
    // Handle player death
    function playerDie() {
        if (!gameState.player.isAlive) return;
        
        gameState.player.isAlive = false;
        player.style.backgroundColor = '#888'; // Gray out mario
        
        // Animate death
        gameState.player.velocityY = -15;
        
        // Update lives
        gameState.lives--;
        updateLives();
        
        // Check for game over
        if (gameState.lives <= 0) {
            setTimeout(() => {
                gameState.gameOver = true;
                gameOverScreen.style.display = 'flex';
            }, 1500);
        } else {
            // Respawn player after delay
            setTimeout(respawnPlayer, 1500);
        }
    }
    
    // Respawn player
    function respawnPlayer() {
        gameState.player.x = 100;
        gameState.player.y = 0;
        gameState.player.velocityX = 0;
        gameState.player.velocityY = 0;
        gameState.player.isJumping = false;
        gameState.player.isAlive = true;
        gameState.cameraOffset = 0;
        
        // Reset player appearance
        player.style.backgroundColor = '#FF0000';
        
        updatePlayerPosition();
    }
    
    // Restart the game
    function restartGame() {
        // Reset game state
        gameState.player.x = 100;
        gameState.player.y = 0;
        gameState.player.velocityX = 0;
        gameState.player.velocityY = 0;
        gameState.player.isJumping = false;
        gameState.player.isAlive = true;
        gameState.keys.left = false;
        gameState.keys.right = false;
        gameState.keys.up = false;
        gameState.score = 0;
        gameState.lives = 3;
        gameState.gameOver = false;
        gameState.cameraOffset = 0;
        
        // Reset player appearance
        player.style.backgroundColor = '#FF0000';
        
        // Clear game elements
        gameState.gameObjects.blocks = [];
        gameState.gameObjects.coins = [];
        gameState.gameObjects.goombas = [];
        gameState.gameObjects.flag = null;
        
        // Clear game world
        while (gameWorld.firstChild) {
            if (gameWorld.firstChild !== player) {
                gameWorld.removeChild(gameWorld.firstChild);
            }
        }
        
        // Update UI
        updateScore();
        updateLives();
        
        // Hide game over screen
        gameOverScreen.style.display = 'none';
        
        // Remove level complete message if it exists
        const levelComplete = document.querySelector('#game-container div:not(#game-world):not(#ui):not(#game-over)');
        if (levelComplete) {
            levelComplete.remove();
        }
        
        // Create new level
        createLevel();
        
        // Update player position
        updatePlayerPosition();
    }
    
    // Update camera position
    function updateCamera() {
        const minCameraX = 400; // Camera follows player when they go past this point
        
        if (gameState.player.x > minCameraX) {
            gameState.cameraOffset = gameState.player.x - minCameraX;
            
            // Don't let camera go past the end of the level
            if (gameState.cameraOffset > gameState.levelWidth - 800) {
                gameState.cameraOffset = gameState.levelWidth - 800;
            }
            
            gameWorld.style.transform = `translateX(-${gameState.cameraOffset}px)`;
        }
    }
    
    // Update player element position
    function updatePlayerPosition() {
        player.style.left = `${gameState.player.x - gameState.cameraOffset}px`;
        player.style.top = `${gameState.player.y}px`;
    }
    
    // Update score display
    function updateScore() {
        scoreElement.textContent = `Score: ${gameState.score}`;
    }
    
    // Update lives display
    function updateLives() {
        livesElement.textContent = `Lives: ${gameState.lives}`;
    }
    
    // Check collision between two objects
    function isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    // Game loop
    function gameLoop() {
        updatePlayer();
        updateGoombas();
        
        // Continue the loop
        requestAnimationFrame(gameLoop);
    }
    
    // Start the game
    init();
});