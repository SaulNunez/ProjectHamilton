import { moveDirection } from './index';


describe('Test player movement', () => {
  test('check move direction throws error if player does not exist', () => {
    const testToken = '1234';
    const testMovement = 'right';

    expect(moveDirection(testToken, testMovement)).toThrow('Player not found');
  });

  test('check move throws error if direction does not exist', () => {
    const testToken = '1234';
    const testMovement = 'laskdfj';

    expect(moveDirection(testToken, testMovement)).toThrow('Movement is invalid');
  });

  test('check that you can only move to connected door rooms', () => {
    const testToken = '1234';
    const testMovement = 'laskdfj';

    expect(moveDirection(testToken, testMovement)).toThrow('Movement is invalid');
  });

  test('check that you can only move until you run out of moves', () => {

  });
});