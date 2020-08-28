const express = require('express');
const app = express();
const { Server } = require('ws');

import db from './database/index.js';
import { createLobby, joinLobby } from './gameapi/lobbies';
import { selectCharacter } from './gameapi/characters';
import { moveDirection } from './gameapi/gamesession';

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

        const { lobbyCode } = messageContents.payload;

        switch (messageContents.type) {
            case 'enter_lobby':
                ws.send(JSON.stringify(await joinLobby(lobbyCode)));
                break;
            case "get_available_characters":
                ws.send(JSON.stringify({
                    type: 'player_selected_character',
                    payload: await getAvailableCharacters(lobbyCode)
                }));
                break;
            case "select_character":
                const {displayName, character, lobbyCode} = messageContents.payload;

                const characterSelected = await selectCharacter(lobbyCode, displayName, character);
                ws.send(JSON.stringify({
                    type: 'player_selection_sucess', payload: characterSelected }));

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
            case "select_item":
                const { itemId } = messageContents.payload;
                
                break;
            case "move_direction":
                const {direction, playerToken} = messageContents.payload;
                try{
                    const result = moveDirection(playerToken, direction);

                    const characterPositionUpdate = JSON.stringify({
                        player: result.player,
                        x: result.x, 
                        y: result.y
                    });
                    wss.clients.forEach((client) => {
                        if (client !== ws && client.readyState === WebSocket.OPEN) {
                            client.send(characterPositionUpdate);
                        }
                    });
                } catch(e){
                    ws.send(JSON.stringify({
                        message: e
                    }));
                }
                break;
            case "puzzle_solved":
                break;
        }
    });
});