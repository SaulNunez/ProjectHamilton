import { WebsocketHandling } from ".";
import { checkIfLobbyExists } from "../../database/lobbies";
import { getCurrentPlayerCountInLobby } from "../../database/players";

export enum SessionStartResult{
    Sucess = 'success',
    LobbyNotFound = 'lobby_not_found',
    NotEnoughPlayers = 'not_enough_players'
}

export async function startSession(lobbyCode: string) {
    const lobbyExists = await checkIfLobbyExists(lobbyCode);
    if(!lobbyExists){
        return SessionStartResult.LobbyNotFound;
    }

    const playersCountInLobby = await getCurrentPlayerCountInLobby(lobbyCode);
    if(!playersCountInLobby){
        return SessionStartResult.NotEnoughPlayers;
    }

    const message = JSON.stringify({
        type: 'session_started'
    });

    WebsocketHandling.getInstance().broadcastMessageToLobby(lobbyCode, message);

    return SessionStartResult.Sucess;
}