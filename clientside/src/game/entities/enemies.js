/* eslint-disable no-undef */

game.Bloog = me.Sprite.extend({
    init: function (x, y, settings) {

        var width = settings.width;


        settings.image = "bloog";
        settings.framewidth = settings.width = 48;
        settings.frameheight = settings.height = 48;

        this._super(me.Sprite, 'init', [x, y, settings]);


        this.body = new me.Body(this);
        this.body.addShape(new me.Rect(0, 0, settings.framewidth, settings.frameheight));
        this.body.setMaxVelocity(4, 6);
        this.body.setFriction(0.4, 0);

        this.isKinematic = false;


        x = this.pos.x;
        this.startX = x;
        this.pos.x = this.endX = x + width - this.width;

        this.walkRight = true;
        this.alive = true;

        this.addAnimation("walk_left", [0, 1, 2, 3]);
        this.addAnimation("walk_right", [4, 5, 6, 7]);
        this.addAnimation("dead", [8]);
        this.setCurrentAnimation("walk_right");

        this.body.collisionType = me.collision.types.ENEMY_OBJECT;
        this.type = "monster";
    },

    update: function (dt) {
        if (this.alive) {
            if (!this.walkRight && this.pos.x <= this.startX) {
                this.walkRight = true;
                this.setCurrentAnimation("walk_right");
                this.body.force.x = this.body.maxVel.x;
            }
            else if (this.walkRight && this.pos.x >= this.endX) {
                this.walkRight = false;
                this.body.force.x = -this.body.maxVel.x;
                this.setCurrentAnimation("walk_left");
            }
        }
        else {
            this.body.force.x = 0;
        }

        this.body.update(dt);
        me.collision.check(this);

        return (this._super(me.Sprite, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },

    onCollision: function (response, other) {
        if (this.alive && (other.body.collisionType === me.collision.types.PROJECTILE_OBJECT)) {
            this.alive = false;
            this.setCurrentAnimation("dead");
        } else if (other.body.collisionType === me.collision.types.ENEMY_OBJECT) {
            return false;
        } else if (other.body.collisionType === me.collision.types.PLAYER_OBJECT) {
            return false;
        }

        return true;
    }
});

game.Slug = me.Sprite.extend({
    init: function (x, y, settings) {

        var width = settings.width;

        settings.image = "slug";
        settings.framewidth = settings.width = 32;
        settings.frameheight = settings.height = 32;

        this._super(me.Sprite, 'init', [x, y, settings]);

        this.body = new me.Body(this);
        this.body.addShape(new me.Rect(0, 0, settings.framewidth, settings.frameheight));
        this.body.setMaxVelocity(1, 0);
        this.body.setFriction(0.4, 0);

        this.isKinematic = false;

        x = this.pos.x;
        this.startX = x;
        this.pos.x = x;
        this.endX = x + width - this.width;

        this.walkRight = false;

        this.alive = true;

        this.addAnimation("walk_left", [0, 1, 2]);
        this.addAnimation("walk_right", [3, 4, 5]);
        this.addAnimation("dead", [6, 7], 200);
        this.setCurrentAnimation("walk_right");

        this.body.collisionType = me.collision.types.ENEMY_OBJECT;
        this.type = "monster";
    },

    update: function (dt) {
        if (this.alive) {
            if (!this.walkRight && this.pos.x <= this.startX) {
                this.walkRight = true;
                this.setCurrentAnimation("walk_right");
                this.body.force.x = this.body.maxVel.x;
            }
            else if (this.walkRight && this.pos.x >= this.endX) {
                this.walkRight = false;
                this.body.force.x = -this.body.maxVel.x;
                this.setCurrentAnimation("walk_left");
            }
        }
        else {
            this.body.force.x = 0;
        }

        this.body.update(dt);
        me.collision.check(this);

        return (this._super(me.Sprite, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },

    onCollision: function (response, other) {
        if (this.alive && (other.body.collisionType === me.collision.types.PROJECTILE_OBJECT)) {
            this.alive = false;
            this.setCurrentAnimation("dead", () => false);
        } else if (other.body.collisionType === me.collision.types.ENEMY_OBJECT) {
            return false;
        } else if (other.body.collisionType === me.collision.types.PLAYER_OBJECT) {
            return false;
        }

        return true;
    }
});

game.Kektus = me.Sprite.extend({

    init: function (x, y, settings) {

        var width = settings.width;

        settings.image = "kektus";
        settings.framewidth = settings.width = 80;
        settings.frameheight = settings.height = 80;

        this._super(me.Sprite, 'init', [x, y, settings]);

        this.body = new me.Body(this);
        this.body.addShape(new me.Rect(0, 0, settings.framewidth, settings.frameheight));
        this.body.setMaxVelocity(1, 0);
        this.body.setFriction(0.4, 0);

        this.isKinematic = false;
        this.walkRight = false;
        this.alwaysUpdate = true;
        this.alive = true;
        this.awaken = 0; // counts the time to awaken fully
        this.sleeping = true;
        this.shootRepition = 0; // counts the time to repeat shooting

        this.addAnimation("sleep", [0, 1], 300);
        this.addAnimation("dead", [7, 8], 300);
        this.addAnimation("attack", [3, 4, 5, 6], 300);
        this.setCurrentAnimation("sleep");

        this.body.collisionType = me.collision.types.ENEMY_OBJECT;
        this.type = "monster";
    },


    update: function (dt) {

        if (this.awaken > 0 && this.sleeping) {
            this.awaken++;
            if (this.awaken === 300) {
                this.sleeping = false;
                this.setCurrentAnimation("attack");
                this.shoot();
            }
        }

        if (!this.sleeping && this.alive) {
            this.shootRepition++;
            if (this.shootRepition === 150) {
                this.shootRepition = 0;
                this.shoot();
            }
        }

        this.body.update(dt);
        me.collision.check(this);

        return (this._super(me.Sprite, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },

    shoot: function () {

        let m = [2, 1.75, 1.5, 1.25, 1, 0.75, 0.5, 0.25, 0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 1.75, 1.5, 1.25, 1, 0.75, 0.5, 0.25, 0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
        let directionX, directionY = 0;

        let posX = this.pos.x + this.width / 2;
        let posY = this.pos.y + this.height / 2;

        for (let i = 0; i < 33; i++) {
            if (i <= 7) {
                directionX = 1;
                directionY = -1;
            } else if (i <= 15) {
                directionX = 1;
                directionY = 1;
            } else if (i <= 23) {
                directionX = -1;
                directionY = 1;
            } else if (i <= 32) {
                directionX = -1;
                directionY = -1;
            }

            me.audio.play("kektusshoot");
            me.game.world.addChild(me.pool.pull("KektusThorn", posX, posY, directionX, directionY, m[i]));
        }

    },

    onCollision: function (response, other) {
        if (this.alive && !this.sleeping && (other.body.collisionType === me.collision.types.PROJECTILE_OBJECT)) {
            if (other.type !== "kektusthorn") {
                this.alive = false;
                this.setCurrentAnimation("dead");
            }
            return false;
        } else if (other.body.collisionType === me.collision.types.ENEMY_OBJECT) {
            return false;
        } else if (other.body.collisionType === me.collision.types.PLAYER_OBJECT) {
            return false;
        }

        return true;
    },

    onVisibilityChange: function () {
        if (this.awaken === 0) this.awaken = 1;
    }
});


game.Mushroom = me.Sprite.extend({

    init: function (x, y, settings) {

        var areaHeight = settings.height;


        settings.image = "mushroom";
        settings.framewidth = settings.width = 32;
        settings.frameheight = settings.height = 32;


        this._super(me.Sprite, 'init', [x, y, settings]);


        this.body = new me.Body(this);
        this.body.addShape(new me.Rect(0, 0, settings.framewidth, settings.frameheight));
        this.body.setMaxVelocity(0, 2.5);
        this.body.setFriction(0.4, 0);

        this.isKinematic = false;

        this.startY = this.pos.y + areaHeight - this.height;
        this.endY = this.pos.y;
        this.pos.y = this.startY;
        this.jumpUp = false;
        this.alive = true;

        this.addAnimation("jump_left", [0, 1]);
        this.addAnimation("jump_right", [2, 3]); // not implemented yet
        this.setCurrentAnimation("jump_left");

        this.animationpause = true;

        this.body.collisionType = me.collision.types.ENEMY_OBJECT;
        this.type = "monster";
    },

    // manage the enemy movement
    update: function (dt) {

        if (this.alive) {
            if (this.jumpUp && this.pos.y <= this.endY) {
                this.body.force.y = this.body.maxVel.y;
                this.jumpUp = false;
                this.setAnimationFrame((this.getCurrentAnimationFrame() + 1) % 2);
            } else if (!this.jumpUp && this.pos.y >= this.startY) {
                this.body.force.y = -this.body.maxVel.y;
                this.jumpUp = true;
                this.setAnimationFrame((this.getCurrentAnimationFrame() + 1) % 2);
            }

        } else {
            this.body.force.y = 0;
        }

        me.collision.check(this);
        this.body.update(dt);

        return (this._super(me.Sprite, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },

    onCollision: function (response, other) {

        if (this.alive && other.body.collisionType === me.collision.types.PROJECTILE_OBJECT) {
            this.alive = false;
            this.setAnimationFrame();
        }

        if (other.body.collisionType === me.collision.types.WORLD_SHAPE) {
            return true;
        } else {
            return false;
        }
    }
});


game.KektusThorn = me.Entity.extend({
    init: function (x, y, directionX, directionY, m) {

        let settings = {
            image: '16x16tiles',
            width: 16,
            height: 16,
            framewidth: 16
        };

        this._super(me.Entity, 'init', [x, y, settings]);

        this.directionX = directionX;
        this.directionY = directionY;
        this.body.setMaxVelocity(3, 3 * m);
        this.alwaysUpdate = true;

        this.renderable.addAnimation("shoot", [18, 19, 20, 21, 22]);
        this.renderable.addAnimation("explode", [23], 100);
        this.renderable.setCurrentAnimation("shoot");

        this.type = "kektusthorn";
        this.body.collisionType = me.collision.types.PROJECTILE_OBJECT;
        this.body.update();
    },


    update: function (dt) {
        let bounds = me.game.world.getBounds();

        if (!this.collided) {
            this.body.force.x = this.body.maxVel.x * this.directionX;
            this.body.force.y = this.body.maxVel.y * this.directionY;
            me.collision.check(this);
        }

        if ((this.pos.y + this.height <= 0)
            || (this.pos.y >= bounds.height)
            || (this.pos.x + this.width <= 0)
            || (this.pos.x >= bounds.width)) {

            me.game.world.removeChild(this);
        }

        this.body.update();

        return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },

    onCollision: function (response, other) {
        if (this.collided) return false;

        if (other.body.collisionType === me.collision.types.PLAYER_OBJECT) {
            this.body.setMaxVelocity(0, 0);
            me.audio.stop();
            me.audio.play("laserhit");

            this.renderable.setCurrentAnimation("explode",
                function () {
                    console.log("wasted");
                    me.game.world.removeChild(this);
                    return false
                }.bind(this));
            this.collided = true;
        }

        return false;
    },

});