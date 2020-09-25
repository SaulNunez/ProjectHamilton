import {getAvailableCharacters} from './index';

jest.mock('../../database/players', () => ({
    getCurrentPlayersInLobby: jest.fn().mockReturnValue([{
        prototypeId: 'gates'
    },
])
}));

describe('Probar personajes disponibles', () => {
    test('Informacion de personajes disponibles tiene las entradas necesarias',async () => {
        const result = await getAvailableCharacters('1234');
    
        expect(result).toHaveProperty('currentPlayers');
        expect(result).toHaveProperty('charactersAvailable');

        expect(result.charactersAvailable[0]).toHaveProperty('prototypeId');
        expect(result.charactersAvailable[0]).toHaveProperty('name');
        expect(result.charactersAvailable[0]).toHaveProperty('description');
        expect(result.charactersAvailable[0]).toHaveProperty('sanity');
        expect(result.charactersAvailable[0]).toHaveProperty('intelligence');
        expect(result.charactersAvailable[0]).toHaveProperty('physical');
        expect(result.charactersAvailable[0]).toHaveProperty('bravery');
    });

    test('Check currently only one player online', async () => {
        expect(await getAvailableCharacters('1234')).toHaveProperty('currentPlayers', 1);
    })
});