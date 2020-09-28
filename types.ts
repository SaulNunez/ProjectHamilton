import { PuzzleType } from "./gameassets/puzzles";

export type PuzzleFunctionCheck = {
    name: string,
    parameters: any[],
    output: string
};

export type Puzzle = {
    id: string,
    type: PuzzleType,
    defaultWorkspace: string | null,
    instructions: string,
    documentation: string,
    expectedOutput: string,
    functionChecks?: PuzzleFunctionCheck[],
    functionsExpected?: string[]
}

export type PuzzleDb = {
    player_id: string,
    puzzle_register: Date,
    puzzle_done: Date,
    puzzle_id: string,
    id: string
}

export type PuzzleCheckResultMicroservice = {
    runOutput: string[],
    matchesOutput: boolean,
    passedCheck: boolean,
    hasFunctions: boolean,
    passedFunctionChecks: boolean
}

export type PuzzleCheckResult = {
    correct: boolean,
    output: string,
    errors?: string
}

export type PlayersDb =  {
    character_prototype_id: string
}

export type Character = {
    id: string,
    name: string,
    description: string,
    stats: Stats
}

export type LobbiesDb = {
    code: string
}


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
    id: string,
    x: number, 
    y: number,
    lobby_id: string,
    floor: number
}

export interface DbRoom {
    proto_id: string,
    lobby_id: string,
    x: number,
    y: number,
    floor: number,
    playerActionAvailable: boolean
}

export type PuzzleInfo =  {
    initialWorkspace: string | null,
    sidebarDocumentation: string
    type: string
}

export type Room = {
    id: string,
    name: string,
    adjacentRooms: AdjacentRooms,
    specialEvent?: string | null,
    statsEffects?: Stats | null,
    movesToFloor: number[]
}

export type AdjacentRooms = {
    left: boolean,
    right: boolean,
    bottom: boolean,
    top: boolean
}

export type Stats = {
    sanity: number,
    physical: number,
    intelligence: number,
    bravery: number
}