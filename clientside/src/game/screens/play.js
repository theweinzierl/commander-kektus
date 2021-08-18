/* eslint-disable no-undef */
game.PlayScreen = me.Stage.extend({

    onResetEvent: function() {
        // load a level

        me.levelDirector.loadLevel("desert");

    },

    onDestroyEvent: function() {
    }
});
