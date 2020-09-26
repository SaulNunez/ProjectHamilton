import { SessionStartResult, startSession } from "../gameapi/lobbies/session_start";

jest.mock('../database/players', () => ({
    getCurrentPlayerCountInLobby: jest.fn().mockReturnValueOnce(0).mockReturnValue(3)
}));

jest.mock('../database/lobbies', () => ({
    checkIfLobbyExists: jest.fn().mockReturnValueOnce(false).mockReturnValue(true)
}));

describe('checar API sigue documentación', () => {
    test('error si codigo no existe lobby en la base de datos', async () => {
        expect(startSession('abcde')).resolves.toBe(SessionStartResult.LobbyNotFound);
    });

    test('checar que retorna con valor no suficientes jugadores si no hay suficientes jugadores', async () => {
        expect(startSession('abcde')).resolves.toBe(SessionStartResult.NotEnoughPlayers);
    });

    test('checar que mensajes fueron enviados correctamente', async () => {
        expect(startSession('abcde')).resolves.toBe(SessionStartResult.Sucess);
    });
});