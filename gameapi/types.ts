import { Stats } from "../gameassets/rooms/rooms";

export type LifeEffect = {
    characterId: string,
    newStats: Stats
};

export type LanternEffect = {
    characterId: string
}

export type MovementInfo ={
    x: number,
    y: number,
    floor: number
}

export type CharacterMovement = {
    characterAffectedId: string,
    newPos: MovementInfo
}

export function isCharacterMovement(gameplayInfo: CharacterMovement | MovementInfo | LanternEffect): gameplayInfo is CharacterMovement{
    return (gameplayInfo as CharacterMovement).newPos !== undefined;
}

export function isLifeEffect(gameplayInfo: CharacterMovement | LifeEffect | LanternEffect): gameplayInfo is LifeEffect{
    return (gameplayInfo as LifeEffect).newStats !== undefined;
}

export interface DbPlayer {
    x: number, 
    y: number,
    lobby_id: string,
    floor: number
}

export interface DbRoom {
    proto_id: string
}