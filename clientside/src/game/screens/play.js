/* eslint-disable no-undef */
game.PlayScreen = me.Stage.extend({

    onResetEvent: function() {
        // load a level

        me.levelDirector.loadLevel("desert");

        if(game.mode === "multiplayer" && game.netCom !== null){                     
            game.retep = me.game.world.addChild(me.pool.pull("Retep", 32, 544, game.netCom.getOpponentName()));
            game.netCom.onGameDataReceived = game.onGameDataReceived.bind(game);
        }

    },

    onDestroyEvent: function() {
        // remove the HUD from the game world
        me.game.world.removeChild(this.HUD);
    }
});
