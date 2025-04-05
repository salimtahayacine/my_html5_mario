/**
 * Collectible.js - Classe pour les objets collectibles
 * Gère les objets que le joueur peut collecter (pièces, champignons, etc.)
 */
class Collectible extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, config = {}) {
        super(scene, x, y, texture);
        
        // Ajouter le sprite à la scène et activer la physique
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Propriétés par défaut
        this.collectibleType = config.type || 'generic';
        this.points = config.points || 0;
        this.effect = config.effect || null;
        this.collected = false;
        
        // Configuration physique de base
        this.setupPhysics(config);
        
        // Configuration selon le type
        this.setupByType();
    }
    
    setupPhysics(config) {
        // Configuration par défaut
        this.body.allowGravity = config.hasGravity !== undefined ? config.hasGravity : true;
        
        if (config.bounce) {
            this.setBounce(config.bounce);
        }
        
        if (config.immovable) {
            this.body.immovable = true;
        }
        
        // Si on veut une taille spécifique pour la hitbox
        if (config.bodySize) {
            this.body.setSize(config.bodySize.width, config.bodySize.height);
            
            if (config.bodyOffset) {
                this.body.setOffset(config.bodyOffset.x, config.bodyOffset.y);
            }
        }
    }
    
    setupByType() {
        // Configuration spécifique selon le type d'objet
        switch (this.collectibleType) {
            case 'coin':
                this.points = 50;
                this.body.allowGravity = false;
                if (this.texture.key === 'coin-spin') {
                    this.play('coin-spin');
                }
                break;
                
            case 'mushroom':
                this.points = 1000;
                this.effect = 'powerup';
                this.body.allowGravity = true;
                this.body.setVelocityX(50); // Les champignons se déplacent
                break;
                
            case 'star':
                this.points = 1000;
                this.effect = 'invincibility';
                this.body.allowGravity = true;
                this.body.setBounce(1, 0.5); // Les étoiles rebondissent
                this.body.setVelocityX(80);
                break;
                
            case 'oneup': // Champignon 1-UP
                this.points = 0;
                this.effect = 'extralife';
                this.body.allowGravity = true;
                this.body.setVelocityX(50);
                break;
        }
    }
    
    update() {
        if (this.collected) return;
        
        // Comportement spécifique à chaque type
        switch (this.collectibleType) {
            case 'mushroom':
            case 'oneup':
                // Les champignons changent de direction lorsqu'ils rencontrent un obstacle
                if (this.body.blocked.left) {
                    this.body.setVelocityX(50);
                } else if (this.body.blocked.right) {
                    this.body.setVelocityX(-50);
                }
                break;
                
            case 'star':
                // Les étoiles rebondissent et changent de direction
                if (this.body.blocked.left) {
                    this.body.setVelocityX(80);
                } else if (this.body.blocked.right) {
                    this.body.setVelocityX(-80);
                }
                break;
        }
    }
    
    collect() {
        if (this.collected) return { points: 0, effect: null };
        
        this.collected = true;
        
        // Effet visuel de collecte
        this.playCollectAnimation();
        
        // Renvoyer les points et l'effet pour que la scène principale puisse les gérer
        return { 
            points: this.points, 
            effect: this.effect,
            type: this.collectibleType
        };
    }
    
    playCollectAnimation() {
        switch (this.collectibleType) {
            case 'coin':
                // Animation de disparition avec montée
                this.body.enable = false;
                this.scene.tweens.add({
                    targets: this,
                    y: this.y - 40,
                    alpha: 0,
                    duration: 300,
                    ease: 'Power1',
                    onComplete: () => this.destroy()
                });
                break;
                
            default:
                // Animation simple de disparition
                this.body.enable = false;
                this.scene.tweens.add({
                    targets: this,
                    alpha: 0,
                    scale: 1.5,
                    duration: 200,
                    ease: 'Power1',
                    onComplete: () => this.destroy()
                });
                break;
        }
    }
}

/**
 * Coin - Pièce collectible
 */
class Coin extends Collectible {
    constructor(scene, x, y, config = {}) {
        super(scene, x, y, config.texture || 'coin-spin', {
            ...config,
            type: 'coin',
            points: config.points || 50,
            hasGravity: false,
            bodySize: { width: 16, height: 16 },
            bodyOffset: { x: 0, y: 0 }
        });
    }
}

/**
 * Mushroom - Champignon qui donne un power-up
 */
class Mushroom extends Collectible {
    constructor(scene, x, y, config = {}) {
        super(scene, x, y, 'mushroom', {
            ...config,
            type: 'mushroom',
            points: config.points || 1000,
            effect: 'powerup',
            hasGravity: true,
            bodySize: { width: 28, height: 28 },
            bodyOffset: { x: 2, y: 4 }
        });
        
        // Les champignons commencent à se déplacer
        this.body.setVelocityX(50);
    }
}

/**
 * OneUpMushroom - Champignon qui donne une vie supplémentaire
 */
class OneUpMushroom extends Collectible {
    constructor(scene, x, y, config = {}) {
        super(scene, x, y, 'oneup-mushroom', {
            ...config,
            type: 'oneup',
            points: 0,
            effect: 'extralife',
            hasGravity: true,
            bodySize: { width: 28, height: 28 },
            bodyOffset: { x: 2, y: 4 }
        });
        
        // Les champignons commencent à se déplacer
        this.body.setVelocityX(50);
    }
}

/**
 * Star - Étoile qui donne l'invincibilité
 */
class Star extends Collectible {
    constructor(scene, x, y, config = {}) {
        super(scene, x, y, 'star', {
            ...config,
            type: 'star',
            points: config.points || 1000,
            effect: 'invincibility',
            hasGravity: true,
            bounce: 1
        });
        
        // Les étoiles rebondissent et se déplacent
        this.body.setBounce(1, 0.5);
        this.body.setVelocityX(80);
        this.body.setVelocityY(-200); // Saut initial
    }
}