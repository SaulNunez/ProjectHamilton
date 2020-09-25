import db from "../database";
import { createLobby } from "../gameapi/lobbies/handling";

jest.mock('../database/lobbies', () => ({
    createLobbyInDb: jest.fn(),
}));

test('Creates lobby', async () => {
    expect(await createLobby()).toStrictEqual(expect.any(String));
});