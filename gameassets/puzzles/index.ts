import { Puzzle } from "../../types";

export enum Analize {
    No = 'no_analyze',
    Conditional = 'conditionals',
    Cycles = 'cycles',
    Functions = 'functions'
}

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
        analyzeSyntax: Analize.No
    },
];

export default puzzle;