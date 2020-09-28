import db from "..";
import { DbPlayer, PlayersDb } from "../../types";

export async function getCurrentPlayersInLobby(lobbyCode: string){
    return await db.select('character_prototype_id').where({ lobby_id: lobbyCode }).from<PlayersDb>('players');
}

export async function getCurrentPlayerCountInLobby(lobbyCode: string){
    return await db('players').where({lobby_id: lobbyCode}).count();
}

export async function getPlayerInfo(playerToken: string){
    return await db('players').where({id: playerToken}).first<DbPlayer>();
}

export async function getIfItsPlayersTurn(playerToken: string) {
    //TODO: Revisar en base de datos
    return true;
}