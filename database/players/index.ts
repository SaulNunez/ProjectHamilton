import db from "..";
import { PlayersDb } from "../../types";

export async function getCurrentPlayersInLobby(lobbyCode: string){
    return await db.select('character_prototype_id').where({ lobby_id: lobbyCode }).from<PlayersDb>('players');
}