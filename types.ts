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