import db from '../../database';

const rooms = require('../../gameassets/rooms');

export async function createLobby() {
    try {
        let lobbyCode = Math.random().toString(36).substring(7);

        const ret = await db("lobbies").insert({code: lobbyCode}).returning('code');

        if(ret){
            rooms.foreach(room => {

            });

            return lobbyCode;
        }
    } catch (e) {
        console.error(e);
    }

    return null;
}

export async function joinLobby(lobbyCode){
    try {
        const results = await db('lobbies').select('code').where({code: lobbyCode});

        if(results.length > 0){
            const playerInfoQuery = await db('players').select('character', 'name').where({lobby: lobbyCode});

            const tokenInfo = await db.insert({lobby: lobbyCode}, 'token').into('players');

            return {
                type: 'lobby_joined',
                payload: {
                    currentPlayers: playerInfoQuery.length,
                    charactersUsed: playerInfoQuery.map(playerInfo => playerInfo.character).filter(player => player),
                    playersInLobbyInfo: playerInfoQuery,
                    token: tokenInfo.token
                }
            };
        }
    } catch(error){
        return {
            type: 'lobby_joined',
            error: error.message
        };
    }

    return {
        type: 'lobby_joined',
        error: 'There\'s no lobby found with that code'
    };
}