import db from "..";
import { DbPlayer, DbRoom, PlayersDb } from "../../types";

export async function getRoom(lobby: string, x: number, y: number, floor: number){
    return await db.where({lobby_id: lobby, x, y, floor}).from<DbRoom>('rooms').first();
}

export async function updatePosition(playerToken:string, x: number, y: number, floor: number) {
    await db('players').where({ id: playerToken }).update({ x, y, floor });
}

export async function getCurrentPlayerRoom(playerToken: string) {
    const playerInfo =  await db.where({ id: playerToken }).from<DbPlayer>('players').first();

    if(playerInfo){
        return await getRoom(playerInfo.lobby_id, playerInfo.x, playerInfo.y, playerInfo.floor);
    }

    return null;
}