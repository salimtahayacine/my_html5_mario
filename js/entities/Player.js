/**
 * Player.js - CSS-based Mario player class
 */
class Player {
    constructor(scene, x, y) {
        // Create a physics body for collision detection
        this.sprite = scene.physics.add.sprite(x, y, null);
        
        // Set up physics body
        this.sprite.setSize(32, 48);
        this.sprite.setDisplaySize(32, 48);
        
        // Create the CSS visual element
        this.createCssElement(scene, x, y);
        
        // Player properties
        this.isDead = false;
        this.isJumping = false;
        this.canJump = true;
        this.facing = 'right';
        this.scene = scene;
        
        // Set physics properties
        this.sprite.body.setGravityY(config.gravity);
    }
    
    createCssElement(scene, x, y) {
        // Get the game world element
        const gameWorld = document.getElementById('game-world');
        
        // Create player element if it doesn't exist
        if (!document.getElementById('css-player')) {
            // Create CSS element for player
            this.element = document.createElement('div');
            this.element.id = 'css-player';
            this.element.className = 'player';
            
            // Position the element
            this.element.style.left = `${x - 16}px`; // Center the 32px element
            this.element.style.top = `${y - 24}px`;  // Center the 48px element
            
            // Add to game world
            gameWorld.appendChild(this.element);
        } else {
            // Use existing element
            this.element = document.getElementById('css-player');
        }
    }
    
    update(cursors, spaceKey, mobileControls) {
        if (this.isDead) return;
        
        // Only allow actions if controls are enabled
        if (!this.scene.game.globals.controlsEnabled) return;
        
        const onGround = this.sprite.body.blocked.down;
        
        // Reset jump ability when touching the ground
        if (onGround) {
            this.canJump = true;
            this.isJumping = false;
            this.element.classList.remove('jumping');
        }
        
        // Horizontal movement (left/right)
        if (cursors.left.isDown || mobileControls.left) {
            // Move left
            this.sprite.body.setVelocityX(-config.playerSpeed);
            this.facing = 'left';
            this.element.style.transform = 'scaleX(-1)';
            
            if (onGround) {
                this.element.classList.add('walking');
            }
        } else if (cursors.right.isDown || mobileControls.right) {
            // Move right
            this.sprite.body.setVelocityX(config.playerSpeed);
            this.facing = 'right';
            this.element.style.transform = 'scaleX(1)';
            
            if (onGround) {
                this.element.classList.add('walking');
            }
        } else {
            // No horizontal movement
            this.sprite.body.setVelocityX(0);
            this.element.classList.remove('walking');
        }
        
        // Jump logic
        if ((spaceKey.isDown || cursors.up.isDown || mobileControls.jump) && this.canJump && onGround) {
            // Apply jump force
            this.sprite.body.setVelocityY(-config.playerJumpForce);
            this.isJumping = true;
            this.canJump = false;
            this.element.classList.add('jumping');
            
            // Play jump sound with error handling
            try {
                this.scene.sound.play('jump');
            } catch (error) {
                console.warn("Failed to play jump sound:", error);
            }
        }
        
        // Update the CSS element position
        this.updateCssPosition();
    }
    
    updateCssPosition() {
        if (this.element) {
            this.element.style.left = `${this.sprite.x - 16}px`; // Center the 32px element
            this.element.style.top = `${this.sprite.y - 24}px`;  // Center the 48px element
        }
    }
    
    die() {
        if (this.isDead) return;
        
        this.isDead = true;
        
        // Add dead CSS class
        this.element.classList.add('dead');
        
        // Stop horizontal movement
        this.sprite.body.setVelocityX(0);
        
        // Apply "death jump"
        this.sprite.body.setVelocityY(-300);
    }
    
    // Getters for position (useful for camera following)
    get x() {
        return this.sprite.x;
    }
    
    get y() {
        return this.sprite.y;
    }
    
    // Setters for velocity (useful for direct control)
    setVelocity(x, y) {
        this.sprite.body.setVelocity(x, y);
    }
    
    // Add setData method to forward to sprite
    setData(key, value) {
        this.sprite.setData(key, value);
        return this;
    }
}