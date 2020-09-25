import db from "..";
import { LobbiesDb } from "../../types";

export async function createLobbyInDb(lobbyCode: string){
    return await db.insert({ code: lobbyCode }, ['code']).into<LobbiesDb>("lobbies");
}