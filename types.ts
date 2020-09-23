import { Analize, PuzzleType } from "./gameassets/puzzles";

export type Puzzle = {
    id: string,
    type: PuzzleType,
    defaultWorkspace: string | null,
    instructions: string,
    documentation: string,
    expectedOutput: string,
    analyzeSyntax: Analize
}

export type PuzzleDb = {
    player_id: string,
    puzzle_register: Date,
    puzzle_done: Date,
    puzzle_id: string,
    id: string
}
