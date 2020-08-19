const characters = require('../../gameassets/characters');

export function getAvailableCharacters(lobbyCode) {
    try {
        const playerInfoQuery = await db('players').select('character', 'name').where({ lobby: lobbyCode });

        const availableCharacters = characters
            .filter(character => !playerInfoQuery.find(x => x.name === character.name));

        return {
            type: 'available_characters_update',
            payload: {
                currentPlayers: playerInfoQuery.length,
                charactersUsed: availableCharacters.map(x => x.name),
                playersInLobbyInfo: playerInfoQuery,
            }
        };
    } catch (error) {
        return {
            type: 'available_characters_update',
            error: error.message
        };
    }
}

export async function selectCharacter(token, displayName, character) {
    await db('players').where('token', '=', token).update({ name: displayName, character: character });

    const playerInfoQuery = await db('players').select('character', 'name', 'x', 'y', 'floor').where({ lobby: lobbyCode });

    return true;
}