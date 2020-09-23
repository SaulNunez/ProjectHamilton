import fetch from 'node-fetch';
import puzzle, { PuzzleType } from '../../../gameassets/puzzles';
import { PuzzleCheckResult, PuzzleCheckResultMicroservice } from '../../../types';

const CODE_CHECK_URL = process.env.CODE_CHECK_URL || 'https://hamilton-microservice.herokuapp.com/';

export async function puzzleIsCorrect(code: string, puzzleId: string): Promise<PuzzleCheckResult>{
    const puzzleInfo = puzzle.find(p => p.id === puzzleId);

    if(puzzleInfo === null){
        throw new Error('Puzzle id was not found');
    }

    let type = null;
    switch(puzzleInfo?.type){
        case PuzzleType.Conditionals:
            type = 'check_for_branching';
            break;
        case PuzzleType.Cicles:
            type = 'check_for_loops';
            break;
        case PuzzleType.Functions:
            type =  'check_for_functions';
            break;
    }
    try {
        const puzzleCheckResponse = await fetch(CODE_CHECK_URL, {
            method: 'post',
            body: JSON.stringify({
               code,
               expectedOutput: puzzleInfo!!.expectedOutput,
               checkType: type,
               checkFunctionExists: puzzleInfo?.functionChecks,
               functionChecks: puzzleInfo?.functionsExpected
            }),
            headers: {'Content-Type': 'application/json'}
        });
    
        const {runOutput, matchesOutput, passedCheck, hasFunctions, passedFunctionChecks} : PuzzleCheckResultMicroservice = await puzzleCheckResponse.json();

        return {
            correct: matchesOutput && passedCheck && hasFunctions && passedFunctionChecks,
            output: runOutput.join('\n');
        }
    } catch(e){
        throw e;
    }
}