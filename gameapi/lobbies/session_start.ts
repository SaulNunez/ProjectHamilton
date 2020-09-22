import { WebsocketHandling } from ".";
import db from "../../database";

export enum SessionStartResult{
    Sucess = 'success',
    LobbyNotFound = 'lobby_not_found',
    NotEnoughPlayers = 'not_enough_players'
}

export async function startSession(lobbyCode: string) {
    const lobbyExists = await db('lobbies').where({code: lobbyCode}).update({play_is_active: true}, ['code']);
    if(lobbyExists.length === 0){
        return SessionStartResult.LobbyNotFound;
    }

    const playersCountInLobby = await db('players').where({lobby_id: lobbyCode}).count();
    if(!playersCountInLobby){
        return SessionStartResult.NotEnoughPlayers;
    }

    const message = JSON.stringify({
        type: 'session_started'
    });

    WebsocketHandling.getInstance().broadcastMessageToLobby(lobbyCode, message);

    return SessionStartResult.Sucess;
}