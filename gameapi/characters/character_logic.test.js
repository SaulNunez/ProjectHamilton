import {getAvailableCharacters} from './index';

test('informacion de caracteres disponibles tiene las entradas necesarias',() => {
    const result = getAvailableCharacters('1234');

    expect(result).toHaveProperty('payload.prototypeId');
    expect(result).toHaveProperty('payload.name');
    expect(result).toHaveProperty('payload.description');
    expect(result).toHaveProperty('payload.sanity');
    expect(result).toHaveProperty('payload.intelligence');
    expect(result).toHaveProperty('payload.physical');
    expect(result).toHaveProperty('payload.bravery');
});