/* eslint-disable no-undef */
game.PlayScreen = me.Stage.extend({

    onResetEvent: function() {

        me.levelDirector.loadLevel("desert");
        
        if(game.mode === "multiplayer" && game.netCom !== null){                     
            game.retep = me.game.world.addChild(me.pool.pull("Retep", 32, 544, game.netCom.getOpponentName()));
            game.netCom.onGameDataReceived = game.onGameDataReceived.bind(game);
        }

    },

    onDestroyEvent: function() {
    }
});
