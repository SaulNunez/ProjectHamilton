import db from "..";
import { DbPlayer } from "../../gameapi/types";
import { PlayersDb } from "../../types";

export async function getCurrentPlayersInLobby(lobbyCode: string){
    return await db.select('character_prototype_id').where({ lobby_id: lobbyCode }).from<PlayersDb>('players');
}

export async function getPlayerInfo(playerToken: string){
    return await db('players').where({id: playerToken}).first<DbPlayer>();
}