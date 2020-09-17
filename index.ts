const express = require('express');
const app = express();
const { Server } = require('ws');

import { createLobby, joinLobby } from './gameapi/lobbies';
import { selectCharacter, getAvailableCharacters } from './gameapi/characters';
import { moveDirection } from './gameapi/gamesession';
import { Request, Response } from 'express';
import WebSocket, { MessageEvent } from 'ws';

app.post("/create_lobby", async (_request: Request, response: Response) => {
    const lobbyCode = await createLobby();
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

wss.on('connection', (ws: WebSocket) => {
    ws.on('message', async (message: MessageEvent) => {
        const messageContents = (typeof message.data === "string")? JSON.parse(message.data): '';
        console.log(`Message received: ${message}`);

        const { lobbyCode } = messageContents.payload;

        switch (messageContents.type) {
            case 'enter_lobby':
                try{
                    ws.send(JSON.stringify(await joinLobby(lobbyCode)));
                } catch(e){
                    ws.send(JSON.stringify({
                        type: 'lobby_joined',
                        error: e.message
                    }));
                }
                break;
            case "get_available_characters":
                try {
                    ws.send(JSON.stringify({
                        type: 'available_characters_update',
                        payload: await getAvailableCharacters(lobbyCode)
                    }));
                } catch (error) {
                    ws.send(JSON.stringify({
                        type: 'available_characters_update',
                        error: error.message
                    }));
                }
                break;
            case "select_character":
                try {
                    const {displayName, character, lobbyCode} = messageContents.payload;

                    const characterSelected = await selectCharacter(lobbyCode, displayName, character);
                    ws.send(JSON.stringify({
                        type: 'player_selection_sucess', payload: characterSelected }));
    
                    const charactersUpdateInfo = JSON.stringify({
                        type: 'player_selected_character',
                        payload: await getAvailableCharacters(lobbyCode)
                    });
                    wss.clients.forEach((client: WebSocket) => {
                        if (client !== ws && client.readyState === WebSocket.OPEN) {
                            client.send(charactersUpdateInfo);
                        }
                    });
                } catch (error) {
                    ws.send(JSON.stringify({
                        type: 'player_selection_sucess', error: error.message }));
                }
                break;
            case "select_item":
                const { itemId } = messageContents.payload;
                
                break;
            case "move_direction":
                try{
                    const {direction, playerToken} = messageContents.payload;
                    const result = moveDirection(playerToken, direction);

                    const characterPositionUpdate = JSON.stringify({
                        type: 'player_moved',
                        payload: {
                            player: result.player,
                            x: result.newXPosition, 
                            y: result.newYPosition
                        }
                    });
                    wss.clients.forEach((client: WebSocket) => {
                        if (client !== ws && client.readyState === WebSocket.OPEN) {
                            client.send(characterPositionUpdate);
                        }
                    });
                } catch(e){
                    ws.send(JSON.stringify({
                        type: 'player_moved',
                        error: e.message
                    }));
                }
                break;
            case "puzzle_solved":
                break;
        }
    });
});