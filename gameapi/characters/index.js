import db from '../../database';

const characters = require('../../gameassets/characters');

export function getAvailableCharacters(lobbyCode) {
    try {
        const playerInfoQuery = await db('players').select('character', 'name').where({ lobby: lobbyCode });

        const availableCharactersInfo = characters
            .filter(character => !playerInfoQuery.find(x => x.name === character.name))
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
            type: 'available_characters_update',
            payload: {
                currentPlayers: playerInfoQuery.length,
                charactersAvailable: availableCharactersInfo
            }
        };
    } catch (error) {
        return {
            type: 'available_characters_update',
            error: error.message
        };
    }
}

export async function selectCharacter(lobbyCode, displayName, character) {
    const characterList = require('../../gameassets/characters/index.json');
    const selectedCharacter = characterList.find(x => x.id === character);

    if(selectedCharacter){
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