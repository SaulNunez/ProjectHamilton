import db from "../../database";

export async function startSession(lobbyCode: string) {
    const res = await db('lobbies').where({code: lobbyCode}).update({play_is_active: true}, ['code']);

    return res.findIndex((updated) => updated.code === lobbyCode) !== -1;
}