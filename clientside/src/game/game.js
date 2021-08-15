/* eslint-disable no-undef */
import NetCommunicator from "./NetCommunicator";

/* Game namespace */
export default game = {

    // an object where to store game information
    data : {
        // score
        score : 0
    },

    mode: null,

    // Run on page load.
    "onload" : function () {
        // Initialize the video.
        if (!me.video.init(320, 240, {parent : "screen", scale : "auto", scaleMethod : "flex-width"})) {
            alert("Your browser does not support HTML5 canvas.");
            return;
        }

        // Initialize the audio.
        me.audio.init("wav");

        // set and load all resources.
        // (game will also automatically switch to the loading screen)
        
        
        me.loader.preload(game.resources, game.loaded.bind(game));
    },

    // Run on game resources loaded.
    "loaded" : function () {
        
        me.state.set(me.state.PLAY, new game.PlayScreen());
        
        // add our player entity in the entity pool
        me.pool.register("Commander", game.PlayerEntity);
        me.pool.register("Water", game.Water); 
        me.pool.register("Thorn", game.Thorn); 
        me.pool.register("Torch", game.Torch); 
        me.pool.register("Platform", game.Platform);
        me.pool.register("LaserBlast", game.LaserBlast);
        me.pool.register("LaserBlastRetep", game.LaserBlastRetep);
        me.pool.register("KektusThorn", game.KektusThorn);        
        me.pool.register("Bloog", game.Bloog);
        me.pool.register("Slug", game.Slug);
        me.pool.register("Kektus", game.Kektus);
        me.pool.register("Mushroom", game.Mushroom);
        me.pool.register("LevelEntity", game.LevelEntity);
        me.pool.register("Retep", game.Retep);

        me.input.bindKey(me.input.KEY.LEFT, "left");
        me.input.bindKey(me.input.KEY.RIGHT, "right");
        me.input.bindKey(me.input.KEY.UP, "jump", true);
        me.input.bindKey(me.input.KEY.SPACE, "shoot", true);

        me.state.change(me.state.PLAY);

    },

    reinitiateRetep(){    
        if(game.retep !== null) game.retep = me.game.world.addChild(me.pool.pull("Retep", 32, 544, game.netCom.getOpponentName()));
    },

    netCom: null,

    commander:  null,

    retep: null,

    playerName: "",

    opponentName: "",

    onGameDataReceived(data){        
        if(data !== undefined && game.retep !== null){       
            if(data.entity === "retep"){
             game.retep.onNetworkUpdate(data);
            }else if(data.entity === "retepShot"){
                me.game.world.addChild(me.pool.pull("LaserBlastRetep", data.posX, data.posY, data.direction));
            }
        }
    },

    onOpponentConnected(opponentName){
        if(game.retep === null){
            game.retep = me.game.world.addChild(me.pool.pull("Retep", 32, 544, opponentName));
            game.opponentName = opponentName;
        }
    },

    sendGameData(data){
       if(game.netCom === null) return;
       game.netCom.exchangeGameData(data);
    },

    setPlayerName(name){
        game.playerName = name;
    },

    setMode (mode){
        game.mode = mode;
    },

    setNetCom(netCom){
        game.netCom = netCom;
    }
};
