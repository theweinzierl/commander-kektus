/* eslint-disable no-undef */

game.Water = me.Entity.extend({

    init: function (x, y, settings) {
        
        settings = {
            image: '16x16tiles',
            width: 16,
            height: 16,
            framewidth: 16
        };

        this._super(me.Entity, 'init', [x, y, settings]);       

        this.renderable.addAnimation("wave", [6, 7, 8, 9]);
        this.renderable.setCurrentAnimation("wave");

        this.body.collisionType = me.collision.types.ENEMY_OBJECT;
        this.type = "obstacle";
    },

    onCollision: function (response, other) {
        return false
    }
});


game.Thorn = me.Entity.extend({
    init: function (x, y, settings) {
        // image is implemented as tile in tiled
        this._super(me.Entity, 'init', [x, y, settings]);
        this.body.collisionType = me.collision.types.ENEMY_OBJECT;
        this.type = "obstacle";
    },

    onCollision: function (response, other) {
        return false
    }
});



game.Torch = me.Entity.extend({

    init: function (x, y, settings) {

        settings = {
            image: '16x16tiles',
            width: 16,
            height: 16,
            framewidth: 16
        };

        this._super(me.Entity, 'init', [x, y, settings]);
        this.body.collisionType = me.collision.types.NO_OBJECT;

        this.renderable.addAnimation("burn", [0, 1, 2, 3]);
        this.renderable.setCurrentAnimation("burn");
    },

    onCollision: function (response, other) {
        return false
    }
});

game.Platform = me.Sprite.extend(
    {
        init: function (x, y, settings) {

            let areaWidth = settings.width;

            settings.image = "platform";
            settings.framewidth = settings.width = 48;
            settings.frameheight = settings.height = 16;

            this._super(me.Sprite, 'init', [x, y, settings]);

            this.body = new me.Body(this);
            this.body.addShape(new me.Rect(0, 8, settings.framewidth, settings.frameheight));
            this.body.setMaxVelocity(1, 0);
            this.body.setFriction(0, 0);

            this.isKinematic = false;
            this.alwaysUpdate = true;

            this.startX = this.pos.x;
            this.endX = this.startX + areaWidth - this.width;

            this.walkRight = false;

            this.body.collisionType = me.collision.types.WORLD_SHAPE;
            this.type = "platform";

        },

        update: function (dt) {
                if (!this.walkRight && this.pos.x <= this.startX) {
                    this.walkRight = true;
                    this.body.force.x = this.body.maxVel.x;
                }
                else if (this.walkRight && this.pos.x >= this.endX) {
                    this.walkRight = false;
                    this.body.force.x = -this.body.maxVel.x;
                }

            this.body.update(dt);

            return (this._super(me.Sprite, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
        },


    onCollision: function (response, other) {
        return false;
    }
    });

game.LevelEntity = me.LevelEntity.extend({
    init: function (x, y, settings) {

        this._super(me.LevelEntity, 'init', [x, y, settings]);

        this.win = false;
    },

    onCollision: function (response, other) {
        if (other.body.collisionType === me.collision.types.PLAYER_OBJECT) {
            if(!this.win) me.audio.play("win");
            this.win = true;
            window.setTimeout(
                function () {
                    this.goTo("desert");                   
                }.bind(this), 3000
            );
        }
        return false;
    }

});