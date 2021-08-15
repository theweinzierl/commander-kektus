import {WebSocketClient, WebSocketServer } from "./deno-websocket/mod.ts";


interface ClientMessage {
    id: number,
    opponentId?: number,
    type: string,
    data?: any
}

interface ServerResponse {
    type: string,
    opponentId?: number
    data: any
}

interface Client {
    id: number,
    ws: WebSocketClient,
    playerName?: string;
    opponent?: Client,
    state: ClientState
}

enum ClientState{
    WAITING,
    BUSY
}

var curClients: Map<number, Client> = new Map();
var idCounter: number = 0;

const wss = new WebSocketServer(8080);
console.log("up running");

wss.on("error", function (e: string){
    console.log("An Error occured: " + e);
});

wss.on("connection", function (ws: WebSocketClient) {

    // on connect tell client how to identify
    let id: number = registerClient(ws);

    ws.send(JSON.stringify(
        {
            type: "connect_confirmation", 
            data: {id: id}
        }
    ));

    // register events
    ws.on("message", 
        function (message: string) {
            let cm: ClientMessage = JSON.parse(message);
            let opponentId: number = (cm.opponentId === undefined)? -1 : cm.opponentId;
            switch(cm.type){
                case "all_players":
                    ws.send(getAllPlayers());
                    break;
                case "id_confirmation":
                    setPlayerName(cm.id, cm.data.playerName);
                    // let opponentId: number = getWaitingOpponent();
                    // if(opponentId !== -1 && initiateGame(cm.id, opponentId)){
                      //  ws.send(JSON.stringify({type: "initiate_game_confirmation", data: true}));
                    //}else{
                    //ws.send(getErrorMessage("Game initiation was not successfull!"));
                    //}
                    broadcastAllPlayers();
                    break;
                case "game_initiation":                    
                    if(opponentId !== -1 && initiateGame(cm.id, opponentId)){
                        //ws.send(JSON.stringify({type: "game_initiate_ack", data: true}));
                    }else{
                        ws.send(getErrorMessage("Game initiation was not successfull!"));
                    }
                    break;
                case "close_game":
                    if(cm.opponentId !== undefined && closeGame(cm.id, cm.opponentId)){
                        ws.send(JSON.stringify({type: "close_game_confirmation", data: true}));
                    }else{
                        ws.send(getErrorMessage("Game closing was not successfull!"));
                    }
                    break;
                case "game_request":
                case "game_request_reject":
                case "game_request_ack":
                    forwardData(cm.type, cm.id, opponentId, cm.data);
                    break;
                case "exchange_game_data":
                    if(cm.opponentId !== undefined) forwardGameData(cm.id, cm.opponentId, cm.data);
                    break;
                case "exchange_chat_data":
                    console.log(cm.data);
                    forwardChatData(cm.id, cm.data);
                    break;
                default:
                    ws.send(getErrorMessage("Request-Type does not exist!"));
            }
        }
    );

    ws.on("close", function(){
        closeConnection(ws);
    });

    ws.on("error", function (e: string) {
        console.log(e);
    })
});

function setPlayerName(clientId: number, playerName: string | null): void{
    let client: Client | undefined = curClients.get(clientId);
    if(client === undefined) return;
    if(playerName === null || playerName === "Kektus"){
        playerName = ("Player_" + clientId);
    }
    client.playerName = playerName;
}

function getWaitingOpponent(): number{
    for(let [id, client] of curClients){
        if(client.state === ClientState.WAITING){
            return id;
        }
    }
    return -1;
}

function closeConnection(ws: WebSocketClient): void{
    for(let [id, client] of curClients){

        if(client.opponent !== undefined && client.opponent!.ws === ws){
            client.opponent = undefined;
            client.state = ClientState.WAITING;
        }
        if(ws === client.ws){
            curClients.delete(id);
        }
    }
}

function registerClient(ws: WebSocketClient): number{
    let id: number = getId();
    curClients.set(id, 
        {
            id: id,
            ws: ws,
            state: ClientState.WAITING
        }
    );
    console.log("registered @ " + id + " count: " + curClients.size);
    return id;
}

function getAllPlayers() : string{
    let otherPlayers: any[] = [];

    for(let [id, client] of curClients){
        if(client.state === ClientState.WAITING){           
            otherPlayers.push({name: client.playerName, state: client.state, id: client.id});
        }
    }

    let response: ServerResponse = {type: "all_players", data: otherPlayers};
    return JSON.stringify(response);
}

function broadcastAllPlayers() : void{
    let response: string = getAllPlayers();

    for(let [id, client] of curClients){
        //check if socket was closed before!!
        if(client.state === ClientState.WAITING && !client.ws.isClosed) client.ws.send(response);
    }
}

function getErrorMessage(msg: string): string{
    let response: ServerResponse = {type: "error", data : {description: msg}};
    return JSON.stringify(response);
}

function initiateGame(initiatorId: number, opponentId: number): boolean{
    if(initiatorId === opponentId) return false;

    let initiator: Client | undefined = curClients.get(initiatorId);
    let opponent: Client | undefined = curClients.get(opponentId);
    
    if(initiator === undefined || opponent === undefined) return false;
    if(opponent.state === ClientState.BUSY || initiator.state === ClientState.BUSY) return false;

    initiator.state = ClientState.BUSY;
    opponent.state = ClientState.BUSY;

    initiator.opponent = opponent;
    opponent.opponent = initiator;

    initiator.ws.send(JSON.stringify({type: "game_initiation_ack", data: {opponentId: opponent.id, opponentName: opponent.playerName}}));
    opponent.ws.send(JSON.stringify({type: "game_initiation_ack", data: {opponentId: initiator.id, opponentName: initiator.playerName}}));
    return true;
}

function closeGame(initiatorId: number, opponentId: number): boolean{
    if(initiatorId === opponentId) return false;

    let initiator: Client | undefined = curClients.get(initiatorId);
    let opponent: Client | undefined = curClients.get(opponentId);

    if(initiator === undefined || opponent === undefined) return false;
    if(opponent.opponent!.id !== initiatorId || initiator.opponent!.id !== opponentId) return false;  
    if(opponent.state === ClientState.WAITING || initiator.state === ClientState.WAITING) return false;

    initiator.state = ClientState.WAITING;
    opponent.state = ClientState.WAITING;

    initiator.opponent = opponent;
    opponent.opponent = initiator;

    opponent.ws.send(JSON.stringify({type: "close_game_confirmation", data: true}));
    return true;
}

function forwardGameData(initiatorId: number, opponentId: number, data: any): void{
    if(initiatorId === opponentId) return;

    let initiator: Client | undefined = curClients.get(initiatorId);
    let opponent: Client | undefined = curClients.get(opponentId);

    if(initiator === undefined || opponent === undefined) return;
    if(opponent.opponent!.id !== initiatorId || initiator.opponent!.id !== opponentId) return;  
    if(opponent.state !== ClientState.BUSY || initiator.state !== ClientState.BUSY) return;

    opponent.ws.send(JSON.stringify({type: "exchange_game_data", data: data}));
}

function forwardChatData(initiatorId: number, data: any){
    let initiator: Client | undefined = curClients.get(initiatorId);
    if(initiator === undefined || initiator.state !== ClientState.WAITING) return;


    for(let [id, client] of curClients){
        if(client.state === ClientState.WAITING && !client.ws.isClosed) client.ws.send(JSON.stringify({type: "exchange_chat_data", data: data}));
    }
}

function forwardData(type: string, initiatorId: number, opponentId: number, data: any): void{
    if(initiatorId === opponentId) return;

    let initiator: Client | undefined = curClients.get(initiatorId);
    let opponent: Client | undefined = curClients.get(opponentId);

    if(initiator === undefined || opponent === undefined) return;

    opponent.ws.send(JSON.stringify({type: type, opponentId: initiatorId, data: data}));
}

function getId(): number{
    return idCounter++;
}

wss.on("error", function (e: Error) {
    console.log(e.message);
});