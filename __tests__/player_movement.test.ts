import db from '../database';
import { moveDirection } from '../gameapi/gamesession/index';

let playerId: string;

beforeAll(async () => {
  db.migrate.latest();
  await db.insert({ code: '1234' }).into("lobbies");

  playerId = await db.insert({
    sanity: 3,
    physical: 3,
    intelligence: 3,
    bravery: 3,
    character_prototype_id: 'gates',
    characterName: 'Cyril Gates',
    lobby_id: '1234',
    display_name: 'María Lopez'
}, ['id']).into('players');
});

afterAll(async () => {
  await db('lobbies').where({ code: '1234' }).delete();
});

describe('Test player movement', () => {
  test('check move direction throws error if player does not exist', () => {
    const testMovement = 'right';

    expect(moveDirection('abcd', testMovement)).toThrow('Player not found');
  });

  test('check move throws error if direction does not exist', () => {
    const testMovement = 'laskdfj';

    expect(moveDirection(playerId, testMovement)).toThrow('Movement is invalid');
  });

  test('check that you can only move to connected door rooms', () => {
    const testMovement = 'laskdfj';

    expect(moveDirection(playerId, testMovement)).toThrow('Movement is invalid');
  });

  test('check that you can only move until you run out of moves', () => {

  });
});