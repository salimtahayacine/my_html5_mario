/**
 * Player.js - Simplified Mario player class using CSS-based styling
 */
class Player {
    constructor(scene, x, y) {
        // Create the player sprite with CSS styling
        this.sprite = scene.physics.add.sprite(x, y, null);
        
        // Use a simple rectangle as the base for the player
        this.body = scene.add.rectangle(0, 0, 32, 48, 0xFF0000);
        this.head = scene.add.circle(0, -18, 16, 0xF4A460);
        this.overalls = scene.add.rectangle(0, 0, 28, 20, 0x0000FF);
        
        // Add player parts to a container
        this.container = scene.add.container(x, y, [this.body, this.head, this.overalls]);
        
        // Set up physics body
        this.sprite.setSize(32, 48);
        this.sprite.setDisplaySize(32, 48);
        
        // Player properties
        this.isDead = false;
        this.isJumping = false;
        this.canJump = true;
        this.scene = scene;
        
        // Set physics properties
        this.sprite.body.setGravityY(config.gravity);
        
        // Configure player animations
        this.configureAnimations();
        
        // Add CSS class for styling
        this.sprite.setData('cssClass', 'player');
    }
    
    configureAnimations() {
        // We're using CSS styling instead of sprite animations, but
        // we still need to track animation states for gameplay logic
        this.animationState = 'idle';
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
        }
        
        // Horizontal movement (left/right)
        if (cursors.left.isDown || mobileControls.left) {
            // Move left
            this.sprite.body.setVelocityX(-config.playerSpeed);
            this.container.setScale(-1, 1); // Flip sprite to face left
            
            if (onGround) {
                this.animationState = 'walk';
            }
        } else if (cursors.right.isDown || mobileControls.right) {
            // Move right
            this.sprite.body.setVelocityX(config.playerSpeed);
            this.container.setScale(1, 1); // Ensure sprite faces right
            
            if (onGround) {
                this.animationState = 'walk';
            }
        } else {
            // No horizontal movement
            this.sprite.body.setVelocityX(0);
            
            if (onGround) {
                this.animationState = 'idle';
            }
        }
        
        // Jump logic
        if ((spaceKey.isDown || cursors.up.isDown || mobileControls.jump) && this.canJump && onGround) {
            // Apply jump force
            this.sprite.body.setVelocityY(-config.playerJumpForce);
            this.isJumping = true;
            this.canJump = false;
            this.animationState = 'jump';
            
            // Play jump sound with error handling
            try {
                this.scene.sound.play('jump');
            } catch (error) {
                console.warn("Failed to play jump sound:", error);
            }
        }
        
        // Update the container position to match the physics sprite
        this.container.x = this.sprite.x;
        this.container.y = this.sprite.y;
        
        // Apply CSS animations based on player state
        this.updateCssAnimation();
    }
    
    updateCssAnimation() {
        // Apply different CSS animations based on the player's state
        if (this.animationState === 'walk') {
            this.body.fillColor = 0xFF0000; // Normal color
            // In a real CSS implementation, we would apply the walk animation class
        } else if (this.animationState === 'jump') {
            this.body.fillColor = 0xFF5555; // Lighter red while jumping
            // In a real CSS implementation, we would apply the jump animation class
        } else if (this.animationState === 'dead') {
            this.body.fillColor = 0x888888; // Gray when dead
            // In a real CSS implementation, we would apply the death animation class
        } else {
            // idle
            this.body.fillColor = 0xFF0000; // Normal color
        }
    }
    
    die() {
        if (this.isDead) return;
        
        this.isDead = true;
        this.animationState = 'dead';
        
        // Stop horizontal movement
        this.sprite.body.setVelocityX(0);
        
        // Apply "death jump"
        this.sprite.body.setVelocityY(-300);
        
        // Update the CSS styling for death state
        this.updateCssAnimation();
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