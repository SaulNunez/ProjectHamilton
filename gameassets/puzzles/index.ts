import { Puzzle } from "../../types";

export enum PuzzleType {
    Variables = 'variables',
    Conditionals = 'conditionals',
    Cicles = 'cicles',
    Functions = 'functions'
}

const puzzle : Puzzle[] = [
    {
        id: '',
        type: PuzzleType.Variables,
        defaultWorkspace: null,
        documentation: '',
        instructions: "",
        expectedOutput: "",
    },
];

export default puzzle;