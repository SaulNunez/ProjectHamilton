import {getAvailableCharacters} from './index';
import db from '../../database';

beforeAll(async () => {
    db.migrate.latest();
    await db.insert({ code: '1234' }).into("lobbies");
  });

afterAll(async () => {
    await db('lobbies').where({ code: '1234' }).delete();
});

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
});