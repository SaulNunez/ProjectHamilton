import db from '../../database';
import { TOP_FLOOR, BASEMENT, MAIN_FLOOR } from '../gamesession/constants';

function populateFloor(lobbyCode, floorRooms, floorToPopulate) {
    //Mejorar algoritmo, tenemos que tener en consideracion las puertas que tiene el prototipo del cuarto.
    db.transaction((dbTransaction) => {
        floorRooms.forEach(room => {
            const pos = mainFloorOutline[Math.floor(Math.random() * mainFloorOutline.length)];
            house.topFloor.set(pos, room);

            const [x, y] = pos;

            const positions = [
                [x + 1, y - 1],
                [x + 1, y],
                [x + 1, y + 1],
                [x - 1, y - 1],
                [x - 1, y],
                [x - 1, y + 1],
                [x, y - 1],
                [x, y + 1]
            ];

            delete mainFloorOutline[mainFloorOutline.findIndex((val) => val === pos)];

            positions.forEach(([x, y]) => {
                if (db('rooms').where(x, y).count().first().count > 0) {
                    mainFloorOutline.push(roomPos);
                }
            });

            dbTransaction.insert({x, y, 
                floor: floorToPopulate, 
                lobby_id: lobbyCode, 
                room_proto: room.id
            }).into('rooms');
        });

        dbTransaction.commit();
    });
}

function createRooms(lobbyCode) {
    const mainFloorRooms = require('../../gameassets/rooms/main_floor.json');
    populateFloor(lobbyCode, mainFloorRooms, MAIN_FLOOR);

    const topFloorRooms = require('../../gameassets/rooms/second_floor.json');
    populateFloor(lobbyCode, topFloorRooms, TOP_FLOOR);

    const basementRooms = require('../../gameassets/rooms/basement.json');
    populateFloor(lobbyCode, basementRooms, BASEMENT);
}

export async function createLobby() {
    try {
        let lobbyCode = Math.random().toString(36).substring(7);

        await db.insert({ code: lobbyCode }, ['code']).into("lobbies");

        createRooms(lobbyCode);

        return lobbyCode;
    } catch (e) {
        console.error(e);
    }

    return null;
}

export async function joinLobby(lobbyCode) {
    try {
        const results = await db('lobbies').select('code').where({ code: lobbyCode });

        if (results.length > 0) {
            const playerInfoQuery = await db('players').select('character_name', 'display_name').where({ lobby: lobbyCode });

            const tokenInfo = await db.insert({ lobby: lobbyCode }, 'token').into('players');

            return {
                type: 'lobby_joined',
                payload: {
                    currentPlayers: playerInfoQuery.length,
                    charactersUsed: playerInfoQuery.map(playerInfo => playerInfo.character_name).filter(player => player),
                    playersInLobbyInfo: playerInfoQuery,
                    token: tokenInfo.token
                }
            };
        }
    } catch (error) {
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