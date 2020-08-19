const express = require('express');
const app = express();
const { Server } = require('ws');

import db from './database/index.js';
import { createLobby, joinLobby } from './gameapi/lobbies';
import { selectCharacter } from './gameapi/characters';
import { json } from 'express';

app.post("/create_lobby", (request, response) => {
    const lobbyCode = createLobby();
    if (lobbyCode) {
        response.send({ code: lobbyCode });
    } else {
        response.status(400).send({ message: "Algo salio mal, porfavor intenta de nuevo." });
    }
});

app.use(express.static('public'));

const port = process.env.PORT || 3000;

const server = app.listen(port, () => console.log(`Server running on port ${port}`));

const wss = new Server({ server });

wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
        const messageContents = JSON.parse(message);
        console.log(`Message received: ${message}`);

        switch (messageContents.type) {
            case 'enter_lobby':
                const { lobbyCode } = messageContents.payload;
                ws.send(JSON.stringify(await joinLobby(lobbyCode)));
                break;
            case "get_available_characters":
                const { lobbyCode } = messageContents.payload;
                ws.send(JSON.stringify({
                    type: 'player_selected_character',
                    payload: await getAvailableCharacters(lobbyCode)
                }));
                break;
            case "select_character":
                const {token, displayName, character, lobbyCode} = messageContents.payload;

                const selectCharacter = await selectCharacter(token, displayName, character);
                ws.send(JSON.stringify({
                    type: 'player_selection_sucess'}));

                const charactersUpdateInfo = JSON.stringify({
                    type: 'player_selected_character',
                    payload: await getAvailableCharacters(lobbyCode)
                });
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(charactersUpdateInfo);
                    }
                });
                break;
        }
    });
});