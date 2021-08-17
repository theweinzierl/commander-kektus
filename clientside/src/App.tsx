import {useState} from 'react';
import { GameMode, SubmitMode } from './main';
import './App.css';
import UIName from './ui-components/UIName';
import UIGameMode from './ui-components/UIGameMode';
import UIChat from './ui-components/UIChat';
import { startGame } from './game/bridge';
import { StartParams } from './game/StartParams';
import NetCommunicator from './game/NetCommunicator';

var startParams = new StartParams();

function App() {

  const [step, setStep] = useState(SubmitMode.PlayerName);

  const submitPlayerName: Function = (playerName: string) => {
    startParams.playerName = playerName;
    setStep(SubmitMode.GameMode);  
  };

  const submitGameMode: Function = (mode: GameMode, host: string) => {    

    if(mode === GameMode.singleplayer){
      setStep(SubmitMode.StartGame);
      startParams.gameMode = GameMode.singleplayer;
      startGame(startParams);
    }else{
      startParams.gameMode = GameMode.multiplayer;
      startParams.host = host;
      startParams.netCommunicator = new NetCommunicator(startParams.playerName, startParams.host);
      startParams.netCommunicator.onOpponentConnected = onOpponentConnected;
      startParams.netCommunicator.onGameClosedFired = onGameClosedFired;
      setStep(SubmitMode.ChatMode);
    } 
    
  };

  const onOpponentConnected = () => {
      setStep(SubmitMode.StartGame);
      startGame(startParams);
  }

  const onGameClosedFired = () => {
    const canvas: HTMLCanvasElement = (document.querySelector('#screen canvas') as HTMLCanvasElement)
    canvas.parentNode?.removeChild(canvas)
    setStep(SubmitMode.ChatMode)
  }

  return (
      (step !== SubmitMode.StartGame) ?
      <div>
      <div className="w3-card w3-center">
        <span className="game-title">Commander Kektus</span>
      </div>
      <div className="w3-content w3-center w3-padding-top-24" >
        {(step === SubmitMode.PlayerName) && <UIName submit={submitPlayerName}/>}
        {(step === SubmitMode.GameMode) && <UIGameMode submit={submitGameMode}/>}  
        {(step === SubmitMode.ChatMode) && <UIChat netCom={startParams.netCommunicator} playerName={startParams.playerName}/>}         
      </div>
      </div>
      :
      null
      
  );
}

export default App;
