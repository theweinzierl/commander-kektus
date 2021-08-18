/* eslint-disable no-undef */

game.Retep = me.Entity.extend({

    init: function (x, y, opponentName) {

        const settings = {
            image: "retep",
            framewidth: 48,
            frameheight: 48,
            width: 48,
            height: 48
        }

        this._super(me.Entity, 'init', [x, y, settings]);
        this.body.removeShapeAt(0);
        this.body.addShape(new me.Rect(0, 16, 16, 48));

        this.isKinematic = false;

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
        this.currentAnimation = "stand_right";
        this.alwaysUpdate = true;

        this.opponentName = opponentName;
        this.font = new me.BitmapText(0, 0, {font: "Arial", size: 1});

        this.body.collisionType = me.collision.types.PLAYER_OBJECT;
        this.type = "retep";
    },

    draw: function(renderer){
        this._super(me.Entity, 'draw', [renderer]);
        this.font.draw(renderer, this.opponentName, -40, -23);
    },

    onNetworkUpdate: function (data){
        this.pos.x = data.posX + 16;
        this.pos.y = data.posY;
        this.setMyCurrentAnimation(data.currentAnimation);
    },

    setMyCurrentAnimation: function(animation){
        if(animation !== this.currentAnimation){
            this.currentAnimation = animation;
            this.renderable.setCurrentAnimation(this.currentAnimation);
        }
    },

    update: function (dt) {
        this._super(me.Entity, "update", [dt]);
        me.collision.check(this);
        return true;
    },

    onCollision: function (response, other) {
        /*
        if(other.body.collisionType === me.collision.types.PLAYER_OBJECT){
            return false;
        }else if(other.body.collisionType === me.collision.types.PROJECTILE_OBJECT){
            return false;
        }
       // return true;
       */
      return false;
    }

});
