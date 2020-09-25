import db from '../../database';
import { getCurrentPlayersInLobby } from '../../database/players';
import { Character } from '../../gameassets/characters/character';

export async function getAvailableCharacters(lobbyCode: string) {
    const playersActive = await getCurrentPlayersInLobby(lobbyCode);
    const characters: Character[] = require('../../gameassets/characters');

    const availableCharactersInfo = characters
        .filter(character => !playersActive.find(pa => pa.character_prototype_id === character.id))
        .map(charData => ({
            prototypeId: charData.id,
            name: charData.name,
            description: charData.description,
            sanity: charData.stats.sanity,
            intelligence: charData.stats.intelligence,
            physical: charData.stats.physical,
            bravery: charData.stats.bravery
        }));

    return {
        currentPlayers: playersActive.length,
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