import NetCommunicator from "./NetCommunicator";

export class StartParams{
    playerName: string = "";
    host: string = "";
    gameMode: number = 0;
    netCommunicator: NetCommunicator | null = null;
}