/* eslint-disable no-undef */
game.PlayScreen = me.Stage.extend({

    onResetEvent: function() {
        // load a level
        me.game.onLevelLoaded = () => {
            console.log("here i am!");
            if(game.mode === "multiplayer" && game.netCom !== null){                     
                game.retep = me.game.world.addChild(me.pool.pull("Retep", 32, 544, game.netCom.getOpponentName()));
                game.netCom.onGameDataReceived = game.onGameDataReceived.bind(game);
            }
        };
        me.levelDirector.loadLevel("desert");

    },

    onDestroyEvent: function() {
    }
});
