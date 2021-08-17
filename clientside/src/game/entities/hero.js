/* eslint-disable no-undef */


game.PlayerEntity = me.Entity.extend({

    init: function (x, y, settings) {

        this._super(me.Entity, 'init', [x, y, settings]);

        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH, 0.4);

        this.alwaysUpdate = true;

        this.renderable.addAnimation("walk_left", [0, 3]);
        this.renderable.addAnimation("walk_right", [4, 7]);
        this.renderable.addAnimation("jump_left", [8]);
        this.renderable.addAnimation("jump_right", [11]);
        this.renderable.addAnimation("fall_left", [9, 10], 200);
        this.renderable.addAnimation("fall_right", [11, 12, 200]);
        this.renderable.addAnimation("stand_left", [27]);
        this.renderable.addAnimation("stand_right", [28]);
        this.renderable.addAnimation("shoot_walk_right", [19], 120);
        this.renderable.addAnimation("shoot_walk_left", [14], 120);
        this.renderable.addAnimation("shoot_jump_right", [20], 120);
        this.renderable.addAnimation("shoot_jump_left", [15], 120);
        this.renderable.addAnimation("surf", [29]);
        this.renderable.addAnimation("die", [25, 26], 200);
        this.renderable.addAnimation("freeze",[30], 500);


        this.renderable.setCurrentAnimation("stand_right");

        this.body.setMaxVelocity(3, 15);
        this.body.setFriction(0.4, 0.5);    
        this.body.removeShapeAt(0);
        this.body.addShape(new me.Rect(0, 16, 16, 48));
        this.body.collisionType = me.collision.types.PLAYER_OBJECT;

        // specific values
        this.walkRight = true;
        this.type = "commander";
        this.shooting = false;
        this.freezed = false;
        this.dead = false;
        this.landing = false;
        this.platforming = false;
        this.platformingForce = 0;
        this.curAnimation = "stand_right";
        this.lastAnimation = "";
        this.updateCounter = 0;

        this.font = new me.BitmapText(0, 0, {font: "Arial", size: 1});
        
        game.commander = this;
   
    },

    draw: function(renderer){
        this._super(me.Entity, 'draw', [renderer]);
        this.font.draw(renderer, game.playerName, -10, 0);
    },

    update: function (dt) {

        if(me.input.isKeyPressed('close') && game.mode === "multiplayer"){
            game.netCom.doGameCloseRequest();
            me.state.change(me.state.GAME_END);
        }

        if(game.mode === "multiplayer"){
            //put onNetUpdate, if you want to limit update rate
            if(this.updateCounter === 0){      
                if((this.lastAnimation.indexOf("stand") === -1) || (this.curAnimation !== this.lastAnimation)){ // only sync stand for the first time
                    this.updateRetep();
                    this.lastAnimation = this.curAnimation;  
                }    
            }
            this.updateCounter = (this.updateCounter + 1) % 1;
        }

        if (this.dead) {
            this.body.update(dt);
            return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
        }

        if (this.shooting || this.freezed) {
            return (this._super(me.Entity, 'update', [dt]));
        }

        // walking
        if (me.input.isKeyPressed('right')) {
            this.body.force.x = this.body.maxVel.x;
            this.walkRight = true;

            if (!this.isBlockedAnimation() && !this.renderable.isCurrentAnimation("walk_right")) {
                this.renderable.setCurrentAnimation("walk_right", () => me.audio.play("walk"));
                this.curAnimation = "walk_right";
            }
        } else if (me.input.isKeyPressed('left')) {
            this.body.force.x = -this.body.maxVel.x;
            this.walkRight = false;

            if (!this.isBlockedAnimation() && !this.renderable.isCurrentAnimation("walk_left")) {
                this.renderable.setCurrentAnimation("walk_left", () => me.audio.play("walk"));
                this.curAnimation = "walk_left";
            }
        } else {
            
            // standing or surfing

            if(this.platforming){
                this.body.force.x = 0;
                if(!this.renderable.isCurrentAnimation("surf")){
                    this.renderable.setCurrentAnimation("surf");
                    this.curAnimation = "surf";
                }                
            }else{
                this.body.force.x = 0;
                if (this.walkRight) {
                    if (!this.isBlockedAnimation() && !this.renderable.isCurrentAnimation("stand_right")) {
                        this.renderable.setCurrentAnimation("stand_right");
                        this.curAnimation = "stand_right";
                    }
                } else {
                    if (!this.isBlockedAnimation() && !this.renderable.isCurrentAnimation("stand_left")) {
                        this.renderable.setCurrentAnimation("stand_left");
                        this.curAnimation = "stand_left";
                    }
                }
            }   
        }

        // initiate jumping
        if (me.input.isKeyPressed('jump')) {
            if (!this.body.jumping && !this.body.falling) {
                this.body.force.y = -this.body.maxVel.y;
                me.audio.play("jump");
                this.landing = true;
            }
            this.body.jumping = true;
        } else {
            this.body.force.y = 0;
        }

        // handle jumping or falling animation
        if (this.body.falling) {
            if (this.walkRight) {
                if (!this.renderable.isCurrentAnimation("fall_right")) {
                    this.renderable.setCurrentAnimation("fall_right");
                    this.curAnimation = "fall_right";
                }
            } else {
                if (!this.renderable.isCurrentAnimation("fall_left")) {
                    this.renderable.setCurrentAnimation("fall_left");
                    this.curAnimation = "fall_left";
                }
            }
        } else if (this.body.jumping) {

            if (this.walkRight) {
                if (!this.renderable.isCurrentAnimation("jump_right")) {
                    this.renderable.setCurrentAnimation("jump_right");
                    this.curAnimation = "jump_right";
                }
            } else {
                if (!this.renderable.isCurrentAnimation("jump_left")) {
                    this.renderable.setCurrentAnimation("jump_left");
                    this.curAnimation = "jump_left";
                }
            }
        }

        // shooting
        if (me.input.isKeyPressed('shoot')) {

            this.shooting = 1;
            let direction, posX = 0;
            let curAni = "";

            if (this.body.jumping || this.body.falling) {
                curAni = "shoot_jump";
            } else {
                curAni = "shoot_walk";
            }

            if (this.walkRight) {

                this.renderable.setCurrentAnimation(curAni + "_right", function () { this.shooting = false; }.bind(this));
                this.curAnimation = curAni + "_right";
                direction = 1;
                posX = this.pos.x;

            } else {
                this.renderable.setCurrentAnimation(curAni + "_left", function () { this.shooting = false; }.bind(this));
                this.curAnimation = curAni + "_left";
                direction = -1;
                posX = this.pos.x + 16;
            }

            me.audio.play("shoot");
            this.shooting = true;
            me.game.world.addChild(me.pool.pull("LaserBlast", posX, this.pos.y + 35, direction));
            if(game.mode === "multiplayer"){
                this.initiateRetepShot(posX, this.pos.y + 35, direction);
            }
        }


        this.body.update(dt);
        me.collision.check(this);

        return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },

    isBlockedAnimation: function () {
        return (this.body.jumping || this.body.falling || this.shooting);
    },

    onCollision: function (response, other) {
        switch (other.body.collisionType) {
            case me.collision.types.WORLD_SHAPE:

                if (this.landing) {
                    this.landing = false;
                    me.audio.play("land");
                }

                if(other.type === "platform"){
                    this.platforming = true;
                    this.platformingForce = other;
                }else{
                    this.platforming = false;
                }

                return true;
            case me.collision.types.ENEMY_OBJECT:
                if (!(other.type === 'monster') || other.alive && !this.dead) {
                    this.die();
                }
                return false;
            case me.collision.types.PROJECTILE_OBJECT:
                if(other.type === "kektusthorn"){
                    this.die();
                }else if(other.type === "laserblastretep") {
                    this.freeze();
                }
                return false;
            default:
                return false;
        }
    },

    freeze(){
        if(this.freezed) return;
        this.freezed = true;
        this.curAnimation = "freeze";
        this.renderable.setCurrentAnimation("freeze", function () { this.freezed = false; }.bind(this));
    },

    die(){
        this.dead = true;
        this.renderable.setCurrentAnimation("die");
        this.curAnimation = "die";
        this.body.vel.y = -200;
        this.body.force.x = 0;
        me.audio.play("die");
        window.setTimeout(() => me.levelDirector.reloadLevel({onLoaded: game.reinitiateRetep.bind(game)}), 2000);
    },

    updateRetep(){
        const data = {
            entity: "retep", 
            posX: this.pos.x, 
            posY: this.pos.y, 
            currentAnimation: this.curAnimation
        };    

        game.sendGameData(data);
    },

    initiateRetepShot(posX, posY, direction){
        const data = {
            entity: "retepShot", 
            posX: posX,
            posY: posY,
            direction: direction
        };    

        game.sendGameData(data);
    }

});

game.LaserBlast = me.Entity.extend({

    init: function (x, y, direction) {

        let settings = {
            image: '16x16tiles',
            width: 16,
            height: 16,
            framewidth: 16
        };

        this._super(me.Entity, 'init', [x, y, settings]);       
        
        this.alwaysUpdate = true;

        this.renderable.addAnimation("shoot", [12, 13, 14, 15, 16]);
        this.renderable.addAnimation("explode", [17], 100);
        this.renderable.setCurrentAnimation("shoot");

        
        this.body.collisionType = me.collision.types.PROJECTILE_OBJECT;
        this.body.setMaxVelocity(7, 0);        
        this.body.update();
        
        this.type = "laserblast";
        this.direction = direction;
        this.collided = false;
    },


    update: function (dt) {
        let bounds = me.game.viewport.getBounds();
       
        game.sendGameData();

        if (!this.collided) {
            this.body.force.x = this.body.maxVel.x * this.direction;
            me.collision.check(this); // don't call collision.check once the blast collided because this will abort callback of explode-animation
        }

        // remove from world, if left viewport
        if ((this.pos.y <= bounds.pos.y)
            || (this.pos.y + this.height >= bounds.pos.y + bounds.height)
            || (this.pos.x + this.width <= bounds.pos.x)
            || (this.pos.x + this.width >= bounds.pos.x + bounds.width)) {

            me.game.world.removeChild(this);
        }

        this.body.update();

        return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },

    onCollision: function (response, other) {
        if (this.collided) return false;
        if (other.body.collisionType === me.collision.types.PLAYER_OBJECT && other.type === "commander") return false;

        this.body.setMaxVelocity(0, 0);
        me.audio.play("laserhit");

        this.renderable.setCurrentAnimation("explode", 
            function () {                
                me.game.world.removeChild(this);
                return false
            }.bind(this));

        this.collided = true;
        

        return false;
    }
});

game.LaserBlastRetep = me.Entity.extend({

    init: function (x, y, direction) {

        let settings = {
            image: '16x16tiles',
            width: 16,
            height: 16,
            framewidth: 16
        };

        this._super(me.Entity, 'init', [x, y, settings]);       
        
        this.alwaysUpdate = true;

        this.renderable.addAnimation("shoot", [12, 13, 14, 15, 16]);
        this.renderable.addAnimation("explode", [17], 100);
        this.renderable.setCurrentAnimation("shoot");

        
        this.body.collisionType = me.collision.types.PROJECTILE_OBJECT;
        this.body.setMaxVelocity(7, 0);        
        this.body.update();
        
        this.type = "laserblastretep";
        this.direction = direction;
        this.collided = false;
    },


    update: function (dt) {
        let bounds = me.game.viewport.getBounds();
       
        game.sendGameData();

        if (!this.collided) {
            this.body.force.x = this.body.maxVel.x * this.direction;
            me.collision.check(this); // don't call collision.check once the blast collided because this will abort callback of explode-animation
        }

        // remove from world, if left viewport
        if ((this.pos.y <= bounds.pos.y)
            || (this.pos.y + this.height >= bounds.pos.y + bounds.height)
            || (this.pos.x + this.width <= bounds.pos.x)
            || (this.pos.x + this.width >= bounds.pos.x + bounds.width)) {

            me.game.world.removeChild(this);
        }

        this.body.update();

        return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },

    onCollision: function (response, other) {
        if (this.collided) return false;
        if (other.body.collisionType === me.collision.types.PLAYER_OBJECT && other.type === "retep") return false;

        this.body.setMaxVelocity(0, 0);
        me.audio.play("laserhit");
        
        this.renderable.setCurrentAnimation("explode", 
            function () {                
                me.game.world.removeChild(this);
                return false
            }.bind(this));

        this.collided = true;

        return false;
    }
});