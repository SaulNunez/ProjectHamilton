import db from '../database';
import { moveDirection } from '../gameapi/gamesession/index';


jest.mock('../database/players', () => ({
  getPlayerInfo: jest.fn()
  .mockReturnValueOnce(null)
  .mockReturnValue({
    id: 'test',
    x: 0, 
    y: 0,
    lobby_id: 'abcde',
    floor: 0
  }),
}));

jest.mock('../database/rooms', () => ({
  getRoom: jest.fn()
  //Tercer test
  .mockReturnValueOnce({
    floor: 0,
    proto_id: 'entrance'
  })
  .mockReturnValueOnce({
    proto_id: 'jardin'
  })
  //Ultimo test
  .mockReturnValueOnce({
    floor: 0,
    proto_id: 'entrance'
  })
  .mockReturnValueOnce({

  }),
  updatePosition: jest.fn()
}));

describe('Test player movement', () => {
  test('check move direction throws error if player does not exist', () => {
    const testMovement = 'right';

    expect(moveDirection('no_player', testMovement)).rejects.toThrowError('Player not found');
  });

  test('check move throws error if direction does not exist', () => {
    const testMovement = 'laskdfj';

    expect(moveDirection('test', testMovement)).rejects.toThrowError('Movement is invalid');
  });

  test('check that you can only move to connected door rooms', () => {
    const testMovement = 'right';

    expect(moveDirection('test', testMovement)).rejects.toThrowError('Movement not allowed');
  });

  test('check that you can only move until you run out of moves', () => {

  });
});