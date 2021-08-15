import me from 'melonjs';
import game from './game';
import resources from './resources';
import title from './screens/title';
import play from './screens/play';
import enemies from './entities/enemies';
import hero from './entities/hero';
import retep from './entities/retep';
import obstacles from './entities/obstacles';
import goodies from './entities/goodies';

// this script is the bridge between our tsx-frontend and good old fashioned js-game

export function startGame(startParams) {

    console.log(startParams)
    game.setPlayerName(startParams.playerName);   
    
    if(startParams.gameMode === 1){
        game.setMode("multiplayer");  
        game.setNetCom(startParams.netCommunicator)
    }else{
        game.setMode("singleplayer");
    }
        
    game.onload();
};