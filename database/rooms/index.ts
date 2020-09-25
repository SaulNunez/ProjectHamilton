import db from "..";
import { DbRoom } from "../../gameapi/types";

export async function getRoom(lobby: string, x: number, y: number, floor: number){
    return await db.where({lobby_id: lobby, x, y, floor}).from<DbRoom>('rooms').first();
}

export async function updatePosition(playerToken:string, x: number, y: number, floor: number) {
    await db('players').where({ id: playerToken }).update({ x, y, floor });
}