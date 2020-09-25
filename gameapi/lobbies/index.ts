import * as WebSocket from 'ws';
import * as http from 'http';
import * as net from 'net';
import { joinLobby } from './handling';
import { getAvailableCharacters, selectCharacter } from '../characters';
import { moveDirection, useItem } from '../gamesession';
import { isCharacterMovement, isLifeEffect } from '../types';
import { request, Request, Response } from 'express';
import url from 'url';
import db from '../../database';

class WebsocketLobby {
    private ws: WebSocket.Server;
    private lobbyCode: string;

    constructor(lobbyCode: string) {
        this.ws = new WebSocket.Server({ noServer: true });

        this.lobbyCode = lobbyCode;

        this.ws.on('connection', (ws: WebSocket) => {
            ws.on('message', async (message: MessageEvent) => {
                const messageContents = JSON.parse(message.toString());
                console.log(`Message received: ${message}`);

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
                            const { displayName, character } = messageContents.payload;

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

    broascast(message: string){
        this.ws.clients.forEach(client => client.send(message));
    }
}

const FIVE_MINUTES = 5 * 60 * 1000;
export class WebsocketHandling {
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
        this.lobbies[lobbyCode] = new WebsocketLobby(lobbyCode);
    }

    async connectToLobby(lobbyCode: string, request: http.IncomingMessage, socket: net.Socket,
        upgradeHead: Buffer) {
        if ((await db('lobbies').where({code: lobbyCode})).length > 0) {
            if(!this.lobbies.hasOwnProperty(lobbyCode)){
                this.createLobby(lobbyCode);
            }
            this.lobbies[lobbyCode].requestUpgrade(request, socket, upgradeHead);
            return true;
        } else {
            return false;
        }
    }

    broadcastMessageToLobby(lobbyCode: string, message: string) {
        if(this.lobbies.hasOwnProperty(lobbyCode)){
            this.lobbies[lobbyCode].broascast(message);
        }
    }
}

export async function lobbyHandling(request: Request, socket: net.Socket, upgradeHead: Buffer) {
    const urlParse = url.parse(request.url);
    const path = urlParse.pathname?.substring(1).split("/");
    const pathName = path!![0] || "";
    const lobbyCode = path!![1] || "";

    console.debug(`Client looking to connect, lobby code: ${lobbyCode}`);

    // Código de lobby va en la sig. parte del path `/gameapi/abcd` 
    if(pathName === 'gameapi'){
        console
        try {
            if (!(await WebsocketHandling.getInstance().connectToLobby(lobbyCode, request, socket, upgradeHead))) {
                socket.destroy();
            }
        } catch (e) {
            socket.destroy();
        }
    } else {
        socket.destroy();
    }
}