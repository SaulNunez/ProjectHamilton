import db from '../../database';
import { Character } from '../../gameassets/characters/character';

export async function getAvailableCharacters(lobbyCode: string) {
    const playerInfoQuery: {character_prototype_id: string}[] = await db('players').select('character_prototype_id').where({ lobby_id: lobbyCode });
    const characters: Character[] = require('../../gameassets/characters');

    const availableCharactersInfo = characters
        .filter(character => playerInfoQuery.findIndex(x => x.character_prototype_id === character.id) === -1)
        .map(characterData => ({
            prototypeId: characterData.id,
            name: characterData.name,
            description: characterData.description,
            sanity: characterData.stats.sanity,
            intelligence: characterData.stats.intelligence,
            physical: characterData.stats.physical,
            bravery: characterData.stats.bravery
        }));

    return {
        currentPlayers: playerInfoQuery.length,
        charactersAvailable: availableCharactersInfo
    };

}

export async function selectCharacter(lobbyCode: string, displayName: string, character: string) {
    const characterList: Character[] = require('../../gameassets/characters/index.json');
    const selectedCharacter: Character | undefined = characterList.find(x => x.id === character);

    if (selectedCharacter) {
        const [playerToken] = await db.insert({
            sanity: selectedCharacter.stats.sanity,
            physical: selectedCharacter.stats.physical,
            intelligence: selectedCharacter.stats.intelligence,
            bravery: selectedCharacter.stats.bravery,
            character_prototype_id: selectedCharacter.id,
            characterName: selectedCharacter.name,
            lobby_id: lobbyCode,
            display_name: displayName
        }, ['id']).into('players');

        return {
            playerSecretToken: playerToken
        }
    }

    return true;
}