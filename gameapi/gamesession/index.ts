import { type } from "os";
import db from "../../database";
import { Items } from "../../gameassets/items/items";
import { Room } from "../../gameassets/rooms/rooms";
import { CharacterMovement, LanternEffect, LifeEffect, MovementInfo } from "../types";
import { TOP_FLOOR, BASEMENT, MAIN_FLOOR } from './constants';

export function startSession(lobby: string) {

}

export enum Direction {
    Top = "top",
    Down = "down",
    Left = "left",
    Right = "right"
}

export type ItemUseOptions = {
    characterAffectedId?: string,
    moveTo?: Direction
}

export async function useItem(itemId: string, playerToken: string, lobbyCode: string, options: ItemUseOptions): Promise<LifeEffect | LanternEffect | CharacterMovement | undefined> {
    if(db('players').where({id: playerToken}).count() == 0){
        //On postgres count returns a string if value grater than the max for number
        throw 'Unauthorized action, playerToken not valid';
    }

    const itemDbEntry = await db('items').join('players', 'items.player_id', '=', 'players.id').where({ items: itemId, id: playerToken, lobby_id: lobbyCode }).first();

    if (itemDbEntry.length > 0) {
        const items: Items[] = require('../../gameassets/items');
        const item = items.find(item => item.id === itemDbEntry.items.prototype);

        if(item?.id === 'lantern'){
            //TODO: Make sure player doesn't have a battery yet
            return {
                characterId: options.characterAffectedId || db('players').where({id: playerToken}).select('character_prototype_id').first()!!.character_prototype_id
            }
        }

        if(item?.moves && options?.moveTo){
            return moveDirection(playerToken, options.moveTo);
        }

        if(item?.statsChange){
            if(item?.affectOtherPlayer && options.characterAffectedId){
                const other = await db('players').where({character_prototype_id: options.characterAffectedId}).first();
                
                const intelligence =  other.intelligence + item.statsChange.intelligence;
                const bravery = other.bravery + item.statsChange.bravery;
                const physical = other.physical + item.statsChange.physical;
                const sanity = other.sanity + item.statsChange.sanity;

                db('players').update({
                    sanity,
                    physical,
                    intelligence,
                    bravery,
                    lobby_id: lobbyCode,
                    character_prototype_id: options.characterAffectedId
                });

                return {
                    characterId: options.characterAffectedId,
                    newStats: {
                        bravery,
                        physical,
                        intelligence,
                        sanity
                    }
                };
            }

            const me = await db('players').where({id: playerToken}).first();

            const intelligence = me.intelligence + item.statsChange.intelligence;
            const bravery = me.bravery + item.statsChange.bravery;
            const physical = me.physical + item.statsChange.physical;
            const sanity = me.sanity + item.statsChange.sanity;

            db('players').update({
                sanity,
                physical,
                intelligence,
                bravery,
                lobby_id: lobbyCode,
                id: playerToken
            });

            return {
                characterId: playerToken,
                newStats: {
                    bravery,
                    physical,
                    intelligence,
                    sanity
                }
            };
        }

        db('items').where({id: playerToken}).delete();
    }
}

export function moveDirection(playerToken: string, moveDirection: string): CharacterMovement{
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
                /*
                let item = false;
                let puzzle = false;
                let event = false;

                if('specialEvent' in nextRoomProtoype!!){
                    switch(nextRoomProtoype.specialEvent){
                        case 'item':
                            item = true;
                            break;
                        case 'puzzle':
                            puzzle = true;
                            break;
                        case 'event':
                            event = true;
                            break;
                    }
                }
                */

                return {
                    characterAffectedId: playerToken,
                    newPos: {
                        x, y, floor: 0
                    }
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