import db from "../../database";
import { Room } from "../../gameassets/rooms/rooms";
import { TOP_FLOOR, BASEMENT, MAIN_FLOOR } from './constants';

export function startSession(lobby: string) {

}

export function useItem(itemId: string, playerToken: string) {
    const itemDbEntry = db('items').where({ items: itemId });
    const playerEntry = db('players').where({id: playerToken});

    if (itemDbEntry.length > 0 
        && itemDbEntry[0].player_id === playerToken 
        && playerEntry[0].id === playerToken) {

    }
}

export function moveDirection(playerToken: string, moveDirection: string){
    const playerEntry = db('players').where({id: playerToken}).first();
    if(playerEntry.length){
        let x = playerEntry.x;
        let y = playerEntry.y;

        switch(moveDirection){
            case 'right':
                x++;
                break;
            case 'left':
                x--;
                break;
            case 'top':
                y++;
                break;
            case 'bottom':
                y--;
                break;
            default:
                throw "Movement is invalid";
        }

        const nextRoom = db('rooms').where({
            lobby_id: playerEntry[0].lobby_id, 
            x, y, 
            floor: playerEntry[0].floor
        }).first();

        const curentRoom = db('rooms').where({
            lobby_id: playerEntry[0].lobby_id, 
            x: playerEntry[0].x, 
            y: playerEntry[0].y, 
            floor: playerEntry[0].floor
        }).first();

        let currentRoomPrototype: Room;
        switch(playerEntry[0].floor){
            case TOP_FLOOR:
                const topFloorList: Room[] = require('../../gameassets/rooms/second_floor.json');
                currentRoomPrototype = topFloorList.find(x => x.id === curentRoom.proto_id)!!;
                break;
            case MAIN_FLOOR:
                const mainFloorList: Room[] = require('../../gameassets/rooms/main_floor.json');
                currentRoomPrototype = mainFloorList.find(x => x.id === curentRoom.proto_id)!!;
                break;
            default:
                const basementList: Room[] = require('../../gameassets/rooms/basement.json');
                currentRoomPrototype = basementList.find(x => x.id === curentRoom.proto_id)!!;
                break;
        }

        if(nextRoom){
            //We might be on the edge
            let nextRoomProtoype: Room;

            switch(nextRoom.floor){
                case TOP_FLOOR:
                    const topFloorList: Room[] = require('../../gameassets/rooms/second_floor.json');
                    nextRoomProtoype = topFloorList.find(x => x.id === nextRoom.proto_id)!!;
                    break;
                case MAIN_FLOOR:
                    const mainFloorList: Room[] = require('../../gameassets/rooms/main_floor.json');
                    nextRoomProtoype = mainFloorList.find(x => x.id === nextRoom.proto_id)!!;
                    break;
                default:
                    const basementList: Room[] = require('../../gameassets/rooms/basement.json');
                    nextRoomProtoype = basementList.find(x => x.id === nextRoom.proto_id)!!;
                    break;
            }

            let allowMove = false;
            switch(moveDirection){
                case 'right':
                    allowMove = currentRoomPrototype?.adjacentRooms.right && nextRoomProtoype?.adjacentRooms.left;
                    break;
                case 'left':
                    allowMove = currentRoomPrototype?.adjacentRooms.left && nextRoomProtoype?.adjacentRooms.right;
                    break;
                case 'top':
                    allowMove = currentRoomPrototype?.adjacentRooms.top && nextRoomProtoype?.adjacentRooms.bottom;
                    break;
                case 'bottom':
                    allowMove = currentRoomPrototype?.adjacentRooms.bottom && nextRoomProtoype?.adjacentRooms.top;
                    break;
                default:
                    throw "Movement is invalid";
            }

            if(allowMove){
                db('players').where({id: playerToken}).update({x, y});

                let item = null;
                let puzzle = null;
                let event = null;
                let isEndGame = false;

                if('specialEvent' in nextRoomProtoype!!){
                    switch(nextRoomProtoype.specialEvent){
                        case 'item':
                            //TODO: Obtener un item
                            const itemId = db('items').insert({player_id: playerToken, prototype: ''}, ['id']);
                            item = {
                                id: itemId
                            };
                            break;
                        case 'puzzle':
                            //TODO: Agregar logica de puzzles
                            break;
                        case 'event':
                            const queryPresagiosCount = db('lobbies').where({code: playerEntry[0].lobby_id}).first();

                            //Hacerlo pseudorandom para evitar la probabilidad de que acabe muy rapido la partida
                            isEndGame = Math.floor((Math.random() * 6) + 1) + Math.floor((Math.random() * 6) + 1) > queryPresagiosCount?.presagios && !(queryPresagiosCount?.presagios < 3) ;

                            event = {
                                startEndGame: isEndGame,

                            };
                            break;
                    }
                }

                return {
                    player: playerEntry.public_token,
                    newXPosition: x,
                    newYPosition: y,
                    item,
                    puzzle,
                    event
                }
            } else {
                throw "Movement not allowed";
            }
        } else {
            throw "Next room not found";
        }
    }

    throw "Player not found";
}