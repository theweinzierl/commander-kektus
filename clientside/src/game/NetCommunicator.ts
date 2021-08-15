

interface ServerResponse {
    type: string,
    opponentId?: number,
    data: any
}

interface ClientMessage {
    id: number,
    opponentId?: number,
    type: string,
    data?: any
}

enum ClientState{
    DISCONNECTED,
    WAITING,
    BUSY
}

class NetCommunicator{
    private host: string = "wss://18.192.24.53:8080";
    private ws: WebSocket | null = null;
    private otherPlayers: number[] | null = null;
    private id: number = -1;
    private opponentId: number = -1;
    private opponentName: string = "";    
    private state: ClientState = ClientState.DISCONNECTED;
    private playerName: string = "";

    public onGameDataReceived: (data: any) => void = () => {};
    public onOpponentConnected: () => void = () => {};
    public onChatDataReceived: (data: any) => void = () => {};
    public onPlayersDataReceived: (data: any) => void = () => {};
    public onGameRequestReceived: (opponentId: number | undefined, data: any) => void = () => {}
    public onGameRequestAckReceived: (opponentId: number | undefined, data: any) => void = () => {}
    public onGameRequestRejectReceived: (opponentId: number | undefined, data: any) => void = () => {}

    constructor(playerName: string, host: string){
        this.playerName = playerName;
        this.host = host;
        this.connect();
    }

    connect(): void {
        this.ws = new WebSocket(this.host);
        this.ws.onmessage = this.onMessage.bind(this);   
    }

    private onMessage(event: any): void{
        let sm: ServerResponse = JSON.parse(event.data);
        
        switch(sm.type){
            case "connect_confirmation":
                this.id = sm.data.id;
                this.state = ClientState.WAITING;

                let request: ClientMessage = {
                    type: "id_confirmation",
                    id: this.id,
                    data: {playerName: this.playerName}
                };
                this.send(JSON.stringify(request));

                break;
            case "game_initiation_ack":
                this.state = ClientState.BUSY;
                this.opponentId = sm.data.opponentId;
                this.opponentName = sm.data.opponentName;
                this.onOpponentConnected();
                break;
            case "exchange_game_data":
                this.onGameDataReceived(sm.data);
                break;
            case "exchange_chat_data":
                this.onChatDataReceived(sm.data);
                break;
            case "all_players":
                this.onPlayersDataReceived(sm.data);
                break;
            case "error":
                console.log("Server-Error: " + sm.data.description);
                break;
            case "game_request":
                this.onGameRequestReceived(sm.opponentId, sm.data);
                break;
            case "game_request_ack":
                this.onGameRequestAckReceived(sm.opponentId, sm.data);
                break;
            case "game_request_reject":
                this.onGameRequestRejectReceived(sm.opponentId, sm.data);
                break;
            default:
                console.log("Received unkown message.");
        }
    }

    private send(request: string): void{
        if(this.state !== ClientState.DISCONNECTED){
            this.ws?.send(request);
        }
    }

    setOnOpponentConnected(callback: void): void{
        this.onOpponentConnected = () => {callback};
    }

    getOpponentName(): string{
        return this.opponentName;
    }

    doGameInitiation(opponentId: number): void{
        if(this.state === ClientState.BUSY) return;
        let request: ClientMessage = {
            type: "game_initiation",
            id: this.id,
            opponentId: opponentId
        };
        this.send(JSON.stringify(request));
    }

    exchangeGameData(gameData?: any): void{
        if(this.state !== ClientState.BUSY) return;
        let request: ClientMessage = {
            type: "exchange_game_data",
            id: this.id,
            opponentId: this.opponentId,
            data: gameData
        };
        this.send(JSON.stringify(request));
    }

    exchangeChatData(chatData?: string): void{
        if(this.state === ClientState.BUSY) return;
        let request: ClientMessage = {
            type: "exchange_chat_data",
            id: this.id,
            data: chatData
        };
        this.send(JSON.stringify(request));
    }

    doGameRequest(playerName: string, opponentId: number): void{
        if(this.state === ClientState.BUSY) return;
        let request: ClientMessage = {
            type: "game_request",
            id: this.id,
            opponentId: opponentId,
            data: {opponentName: playerName}
        };
        this.send(JSON.stringify(request));
    }

    doGameRequestAck(playerName: string, opponentId: number): void{
        if(this.state === ClientState.BUSY) return;
        let request: ClientMessage = {
            type: "game_request_ack",
            id: this.id,
            opponentId: opponentId,
            data: {opponentName: playerName}
        };
        this.send(JSON.stringify(request));
    }

    doGameRequestReject(playerName: string, opponentId: number): void{
        if(this.state === ClientState.BUSY) return;
        let request: ClientMessage = {
            type: "game_request_reject",
            id: this.id,
            opponentId: opponentId,
            data: {opponentName: playerName}
        };
        this.send(JSON.stringify(request));
    }

}
export default NetCommunicator;