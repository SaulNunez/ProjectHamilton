import db from "..";
import { LobbiesDb } from "../../types";

export async function createLobbyInDb(lobbyCode: string){
    return await db.insert({ code: lobbyCode }, ['code']).into<LobbiesDb>("lobbies");
}

export async function checkIfLobbyExists(lobbyCode: string) {
    return (await db('lobbies').where({code: lobbyCode}).update({play_is_active: true}, ['code'])).length > 0;
}