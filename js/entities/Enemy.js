/**
 * Enemy.js - Classe de base pour les ennemis
 * Contient la logique commune à tous les types d'ennemis
 */
class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, config = {}) {
        super(scene, x, y, texture);
        
        // Ajouter le sprite à la scène et activer la physique
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Configurer la physique
        this.body.allowGravity = true;
        
        // Propriétés par défaut
        this.speed = config.speed || 50;
        this.direction = config.direction || -1; // -1 gauche, 1 droite
        this.isDead = false;
        this.isStomped = false;
        this.points = config.points || 100;
        this.enemyType = config.enemyType || 'generic';
        
        // Démarrer le mouvement
        this.startMoving();
    }
    
    startMoving() {
        this.setVelocityX(this.speed * this.direction);
        
        // Retourner le sprite selon la direction
        if (this.direction === 1) {
            this.flipX = true;
        } else {
            this.flipX = false;
        }
    }
    
    update() {
        if (this.isDead) return;
        
        // Si l'ennemi est bloqué par un mur, il change de direction
        if (this.body.blocked.left) {
            this.direction = 1;
            this.flipX = true;
            this.setVelocityX(this.speed);
        } else if (this.body.blocked.right) {
            this.direction = -1;
            this.flipX = false;
            this.setVelocityX(-this.speed);
        }
        
        // Si l'ennemi n'est pas en mouvement, le faire repartir
        if (this.body.velocity.x === 0) {
            this.setVelocityX(this.speed * this.direction);
        }
    }
    
    stomp() {
        if (this.isDead) return;
        
        this.isStomped = true;
        this.isDead = true;
        this.body.velocity.x = 0;
        this.body.allowGravity = false;
        this.body.enable = false;
        
        // Jouer l'animation de mort selon le type d'ennemi
        this.playDeathAnimation();
        
        // Jouer un son d'écrasement
        this.scene.sound.play('stomp');
        
        // Supprimer l'ennemi après un délai
        this.scene.time.delayedCall(500, () => {
            this.destroy();
        });
        
        return this.points;
    }
    
    playDeathAnimation() {
        // À surcharger dans les classes enfants
    }
    
    hit() {
        // Quand l'ennemi est frappé par un projectile ou un autre objet
        if (this.isDead) return;
        
        this.isDead = true;
        this.body.enable = false;
        
        // Effet de basculement lors de la mort
        this.setVelocity(0, -200);
        this.setAngularVelocity(300);
        this.body.allowGravity = true;
        
        // Jouer un son
        this.scene.sound.play('kick');
        
        // Supprimer l'ennemi après un délai
        this.scene.time.delayedCall(1000, () => {
            this.destroy();
        });
        
        return this.points;
    }
}

/**
 * Goomba - Ennemi basique qui marche et peut être écrasé
 */
class Goomba extends Enemy {
    constructor(scene, x, y, config = {}) {
        super(scene, x, y, 'goomba', {
            ...config,
            enemyType: 'goomba',
            speed: config.speed || 50,
            points: config.points || 100
        });
        
        // Configurer la hitbox
        this.setSize(28, 28);
        this.setOffset(2, 4);
        
        // Jouer l'animation de marche
        this.play('goomba-walk');
    }
    
    playDeathAnimation() {
        // Animation d'écrasement spécifique au Goomba
        this.play('goomba-die');
    }
}

/**
 * Koopa - Ennemi qui peut être écrasé et transformé en carapace
 */
class Koopa extends Enemy {
    constructor(scene, x, y, config = {}) {
        super(scene, x, y, 'koopa', {
            ...config,
            enemyType: 'koopa',
            speed: config.speed || 60,
            points: config.points || 200
        });
        
        // Configurer la hitbox
        this.setSize(28, 44);
        this.setOffset(2, 4);
        
        // État du Koopa
        this.isShell = false;
        this.shellMoving = false;
        this.shellTimer = null;
        
        // Jouer l'animation de marche
        this.play('koopa-walk');
    }
    
    stomp() {
        if (this.isDead) return;
        
        // Si le Koopa n'est pas encore en carapace, il le devient
        if (!this.isShell) {
            this.isShell = true;
            this.isStomped = true;
            this.body.velocity.x = 0;
            this.setSize(28, 28); // Réduire la hitbox pour la carapace
            
            // Jouer l'animation de carapace
            this.play('koopa-shell');
            
            // Jouer un son
            this.scene.sound.play('stomp');
            
            // Timer avant que la carapace ne recommence à bouger
            this.shellTimer = this.scene.time.delayedCall(5000, () => {
                if (!this.isDead && this.isShell && !this.shellMoving) {
                    this.wake();
                }
            });
            
            return this.points;
        } 
        // Si le Koopa est déjà en carapace et immobile
        else if (this.isShell && !this.shellMoving) {
            // Faire bouger la carapace
            this.shellMoving = true;
            if (this.shellTimer) this.shellTimer.remove();
            
            // Direction basée sur la position du joueur
            const player = this.scene.player;
            this.direction = (player.x < this.x) ? 1 : -1;
            this.setVelocityX(this.direction * 300);
            
            // Jouer un son
            this.scene.sound.play('kick');
            
            return 0; // Pas de points pour faire bouger la carapace
        }
        // Si le Koopa est déjà en carapace et en mouvement
        else if (this.isShell && this.shellMoving) {
            // Arrêter la carapace
            this.shellMoving = false;
            this.body.velocity.x = 0;
            
            // Redémarrer le timer
            this.shellTimer = this.scene.time.delayedCall(5000, () => {
                if (!this.isDead && this.isShell && !this.shellMoving) {
                    this.wake();
                }
            });
            
            return 0; // Pas de points pour arrêter la carapace
        }
    }
    
    update() {
        if (this.isDead) return;
        
        // Si le Koopa est en mode carapace et en mouvement
        if (this.isShell && this.shellMoving) {
            // Si la carapace est bloquée, elle rebondit
            if (this.body.blocked.left) {
                this.direction = 1;
                this.setVelocityX(300);
            } else if (this.body.blocked.right) {
                this.direction = -1;
                this.setVelocityX(-300);
            }
        }
        // Sinon, comportement normal d'ennemi
        else if (!this.isShell) {
            super.update();
        }
    }
    
    wake() {
        if (this.isDead) return;
        
        // Le Koopa sort de sa carapace
        this.isShell = false;
        this.isStomped = false;
        this.shellMoving = false;
        
        // Réinitialiser la hitbox
        this.setSize(28, 44);
        
        // Jouer l'animation de réveil
        this.play('koopa-walk');
        
        // Recommencer à marcher
        this.startMoving();
    }
    
    playDeathAnimation() {
        // Pour un Koopa, la "mort" est la transformation en carapace
        this.play('koopa-shell');
    }
}