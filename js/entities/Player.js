/**
 * Player.js - Simplified Mario player class using just an icon
 */
class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Use 'mario' as a simple icon instead of a complex spritesheet
        super(scene, x, y, 'mario');
        
        // Add sprite to the scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Configure simplified player physics
        this.setSize(24, 24); // Square hitbox for the icon
        this.setBounce(0.2);
        this.setCollideWorldBounds(false);
        
        // Basic player state
        this.isDead = false;
        this.isJumping = false;
        
        // Player properties - simplified
        this.jumpForce = config.playerJumpForce;
        this.moveSpeed = config.playerSpeed;
    }
    
    update(cursors, jumpButton, mobile) {
        if (this.isDead) return;
        
        // Horizontal movement
        if (cursors.left.isDown || (mobile && mobile.left)) {
            this.setVelocityX(-this.moveSpeed);
            this.flipX = true;
        } 
        else if (cursors.right.isDown || (mobile && mobile.right)) {
            this.setVelocityX(this.moveSpeed);
            this.flipX = false;
        } 
        else {
            this.setVelocityX(0);
        }
        
        // Jump - simplified
        if ((cursors.up.isDown || jumpButton.isDown || (mobile && mobile.jump)) && this.body.onFloor()) {
            this.setVelocityY(-this.jumpForce);
            this.isJumping = true;
            this.scene.sound.play('jump');
        }
        
        // Reset jump state when landing
        if (this.body.onFloor()) {
            this.isJumping = false;
        }
    }
    
    die() {
        if (this.isDead) return;
        
        this.isDead = true;
        this.body.enable = false;
        
        // Simple death effect - just tint red and fade out
        this.setTint(0xff0000);
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            y: this.y - 100,
            duration: 800,
            ease: 'Power1'
        });
    }
}