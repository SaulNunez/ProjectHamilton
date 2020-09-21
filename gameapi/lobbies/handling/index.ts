import { Room } from "../../../gameassets/rooms/rooms";
import { v4 as uuidv4 } from 'uuid';
import { TOP_FLOOR, BASEMENT, MAIN_FLOOR } from '../../gamesession/constants';
import db from "../../../database";

function populateFloor(lobbyCode: string, floorRooms: Room[], floorToPopulate: number) {
    const mainFloorOutline = [[0, 0]];
    let rooms: { x: number, y: number, floor: number, lobby_id: string, room_proto: string, id: string }[] = [];

    floorRooms.forEach(room => {
        const pos = mainFloorOutline[Math.floor(Math.random() * mainFloorOutline.length)];

        const x = pos[0];
        const y = pos[1];


        rooms.push({
            x, y,
            floor: floorToPopulate,
            lobby_id: lobbyCode,
            room_proto: room.id,
            id: uuidv4()
        });

        let positions = [];

        if (room.adjacentRooms.right) {
            positions.push([x + 1, y]);
        }

        if (room.adjacentRooms.left) {
            positions.push([x - 1, y]);
        }

        if (room.adjacentRooms.bottom) {
            positions.push([x, y - 1]);
        }

        if (room.adjacentRooms.top) {
            positions.push([x, y + 1]);
        }

        mainFloorOutline.splice(mainFloorOutline.findIndex((val) => val === pos), 1);

        positions.forEach((pos) => {
            if (mainFloorOutline.indexOf(pos) === -1
                && rooms.findIndex((room) => room.x === pos[0] && room.y === pos[1]) === -1) {

                mainFloorOutline.push(pos);
            }
        });
    });

    db.insert(rooms).into('rooms');
}

function createRooms(lobbyCode: string) {
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

export async function joinLobby(lobbyCode: string) {
    const results = await db('lobbies').select('code').where({ code: lobbyCode });

    if (results.length > 0) {
        const playerInfoQuery = await db('players').select('character_name', 'display_name').where({ lobby_id: lobbyCode });

        const tokenInfo = await db('players').insert({
            lobby_id: lobbyCode,
            id: uuidv4(),
            sanity: 0,
            physical: 0,
            intelligence: 0,
            bravery: 0
        }, 'id');

        return {
            currentPlayers: playerInfoQuery.length,
            playersInLobbyInfo: playerInfoQuery,
            token: tokenInfo[0].id,
            lobbyCode
        };
    }
    
    throw 'There\'s no lobby found with that code';
}