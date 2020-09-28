import db from "../../../database";
import { PuzzleType } from "../../../gameassets/puzzles";
import puzzles from '../../../gameassets/puzzles';
import { PuzzleDb, PuzzleInfo } from "../../../types";

const ONE_MINUTE = 60 * 1000;

export async function getPuzzle(playerId: string): Promise<PuzzleInfo>{
    const { type } = await db('puzzles')
        .where({player_id: playerId})
        .orderBy([{column: 'puzzle_register', order: 'desc'}])
        .first<{type: string}>() || {type: PuzzleType.Variables};
    const puzzleTypeCount = await db('puzzles').where({player_id: playerId, type}).count('id');
    const dateDiffQuery = await db('puzzles')
        .where({player_id: playerId})
        .orderBy([{column: 'puzzle_register', order: 'desc'}])
        .select(["puzzle_register", "puzzle_done"])
        .first<PuzzleDb>();
    const diff = dateDiffQuery.puzzle_done.getTime() - dateDiffQuery.puzzle_done.getTime();

    if(puzzleTypeCount[0].id > 1 || (diff > ONE_MINUTE && puzzleTypeCount[0].id > 2)){
        let newType: PuzzleType;

        switch(type){
            case PuzzleType.Variables:
                newType = PuzzleType.Conditionals;
                break;
            case PuzzleType.Conditionals:
                newType = PuzzleType.Cicles;
                break;
            case PuzzleType.Cicles:
                newType = PuzzleType.Functions;
                break;
        }

        const puzzlesOfType = puzzles.filter(x => x.type == newType);
        const puzzleToUse = puzzlesOfType[Math.floor(Math.random() * puzzlesOfType.length)];
        return {
            type: newType!!.toString(),
            initialWorkspace: puzzleToUse.defaultWorkspace,
            sidebarDocumentation: puzzleToUse.documentation
        };
    } else {
        const usedPuzzles = await db.where({player_id: playerId}).select(['puzzle_id']).from<PuzzleDb>('puzzles');

        const puzzlesOfType = puzzles
            //No repetir tests
            .filter(x => usedPuzzles.findIndex(y => y.puzzle_id === x.id) === -1)
            .filter(x => x.type == type);
        const puzzleToUse = puzzlesOfType[Math.floor(Math.random() * puzzlesOfType.length)];
        return {
            type,
            initialWorkspace: puzzleToUse.defaultWorkspace,
            sidebarDocumentation: puzzleToUse.documentation
        };
    }
}