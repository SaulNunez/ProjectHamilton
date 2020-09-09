import db from '../../database';

export async function getAvailableCharacters(lobbyCode) {
    const playerInfoQuery = await db('players').select('character_prototype_id', 'name').where({ lobby: lobbyCode });
    const characters = require('../../gameassets/characters');

    const availableCharactersInfo = characters
        .filter(character => playerInfoQuery.indexOf(x => x.character_prototype_id === character.id) === -1)
        .map(characterData => ({
            prototypeId: "a",
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

export async function selectCharacter(lobbyCode, displayName, character) {
    const characterList = require('../../gameassets/characters/index.json');
    const selectedCharacter = characterList.find(x => x.id === character);

    if (selectedCharacter) {
        const [playerToken] = await db.insert({
            sanity: selectedCharacter.stats.sanity,
            physical: selectedCharacter.stats.physical,
            intelligence: selectedCharacter.stats.intelligence,
            bravery: selectedCharacter.stats.bravery,
            character_prototype_id: selectedCharacter.id,
            characterName: selectedCharacter.character_name,
            lobby_id: lobbyCode,
            display_name: displayName
        }, ['id']).into('players');

        return {
            playerSecretToken: playerToken
        }
    }

    return true;
}