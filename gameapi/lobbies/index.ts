import * as WebSocket from 'ws';
import * as http from 'http';
import * as net from 'net';
import { joinLobby } from './handling';
import { getAvailableCharacters, selectCharacter } from '../characters';
import { moveDirection, useItem } from '../gamesession';
import { isCharacterMovement, isLifeEffect } from '../types';

const url = require('url');

class WebsocketLobby {
    private ws: WebSocket.Server;
    constructor() {
        this.ws = new WebSocket.Server({ noServer: true });

        this.ws.on('connection', (ws: WebSocket) => {
            ws.on('message', async (message: MessageEvent) => {
                const messageContents = JSON.parse(message.toString());
                console.log(`Message received: ${message}`);

                const { lobbyCode } = messageContents.payload;

                switch (messageContents.type) {
                    case 'enter_lobby':
                        try {
                            ws.send(JSON.stringify({
                                type: 'lobby_joined',
                                payload: await joinLobby(lobbyCode)
                            }));
                        } catch (e) {
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
                            const { displayName, character, lobbyCode } = messageContents.payload;

                            const characterSelected = await selectCharacter(lobbyCode, displayName, character);
                            ws.send(JSON.stringify({
                                type: 'player_selection_sucess', payload: characterSelected
                            }));

                            const charactersUpdateInfo = JSON.stringify({
                                type: 'player_selected_character',
                                payload: await getAvailableCharacters(lobbyCode)
                            });
                            this.ws.clients.forEach((client) => {
                                if (client !== ws && client.readyState === WebSocket.OPEN) {
                                    client.send(charactersUpdateInfo);
                                }
                            });
                        } catch (error) {
                            ws.send(JSON.stringify({
                                type: 'player_selection_sucess', error: error.message
                            }));
                        }
                        break;
                    case "select_item":
                        const { itemId, playerToken } = messageContents.payload;

                        try {
                            const result = await useItem(itemId, playerToken, lobbyCode, messageContents.payload);
                            ws.send(JSON.stringify({
                                type: 'select_item',
                                payload: result
                            }));
                        } catch (e) {
                            ws.send(JSON.stringify({
                                type: 'select_item',
                                error: e.message
                            }));
                        }

                        break;
                    case "move_direction":
                        try {
                            const { direction, playerToken } = messageContents.payload;
                            const result = await moveDirection(playerToken, direction);

                            let eventType = "";
                            if (isCharacterMovement(result)) {
                                eventType = "player_position_update";
                            } else if (isLifeEffect(result)) {
                                eventType = "stats_change";
                            } else {
                                eventType = "player_has_battery";
                            }

                            if (eventType) {
                                const characterPositionUpdate = JSON.stringify({
                                    type: 'player_moved',
                                });
                                this.ws.clients.forEach((client) => {
                                    if (client.readyState === WebSocket.OPEN) {
                                        client.send(characterPositionUpdate);
                                    }
                                });
                            }
                        } catch (e) {
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
    }

    requestUpgrade(request: http.IncomingMessage, socket: net.Socket,
        upgradeHead: Buffer) {
        this.ws.handleUpgrade(request, socket, upgradeHead, (ws) => {
            this.ws.emit('connection', ws, request);
        });
    }
}

const FIVE_MINUTES = 5 * 60 * 1000;
class WebsocketHandling {
    private lobbies: { [key: string]: WebsocketLobby } = {};

    private static _instance: WebsocketHandling = new WebsocketHandling();

    constructor() {
        if (WebsocketHandling._instance) {
            throw new Error("WebsocketHandling is a singleton not a instance");
        }

        WebsocketHandling._instance = this;
    }


    public static getInstance() {
        return WebsocketHandling._instance;
    }

    createLobby(lobbyCode: string) {
        this.lobbies[lobbyCode] = new WebsocketLobby();
    }

    connectToLobby(lobbyCode: string, request: http.IncomingMessage, socket: net.Socket,
        upgradeHead: Buffer) {
        if (this.lobbies.hasOwnProperty(lobbyCode)) {
            this.lobbies[lobbyCode].requestUpgrade(request, socket, upgradeHead);

            return true;
        }

        return false;
    }

    broadcastMessageToLobby(lobbyCode: string, message: string) {

    }
}

export function lobbyHandling(request: http.IncomingMessage, socket: net.Socket, upgradeHead: Buffer) {
    const pathname: string = url.parse(request.url).pathname;
    const lobbyCode = pathname.substring(1);
    try {
        if (!WebsocketHandling.getInstance().connectToLobby(lobbyCode, request, socket, upgradeHead)) {
            socket.destroy();
        }
    } catch (e) {
        socket.destroy();
    }
}