import * as WebSocket from 'ws';
import * as http from 'http';
import * as net from 'net';
import { getAvailableCharacters, selectCharacter } from '../characters';
import { moveDirection, useItem } from '../gamesession';
import { Request } from 'express';
import url from 'url';
import db from '../../database';
import { playerCanDoPuzzle, puzzleIsCorrect } from '../puzzles/check_puzzle';
import { isCharacterMovement, isLifeEffect } from '../../types';

class WebsocketLobby {
    private wss: WebSocket.Server;

    constructor(lobbyCode: string) {
        this.wss = new WebSocket.Server({ noServer: true });


        this.wss.on('connection', (ws: WebSocket) => {
            ws.on('message', async (message: MessageEvent) => {
                const messageContents = JSON.parse(message.toString());
                console.log(`Message received: ${message}`);

                switch (messageContents.type) {
                    case "get_available_characters":
                        try {
                            const availableCharacters = await getAvailableCharacters(lobbyCode);

                            console.debug(availableCharacters);
                            
                            ws.send(JSON.stringify({
                                type: 'available_characters_update',
                                payload: availableCharacters
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
                            this.wss.clients.forEach((client) => {
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
                                this.wss.clients.forEach((client) => {
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
                        try {
                            const {code, puzzleId, playerToken} = messageContents.payload;

                            if((await playerCanDoPuzzle(playerToken))){
                                let puzzleResult = await puzzleIsCorrect(code, puzzleId);

                                ws.send(JSON.stringify({
                                    type: 'puzzle_solved',
                                    payload: {
                                        errors: puzzleResult.errors || '',
                                        ...puzzleResult
                                    }
                                }));
                            }
                        } catch(e){
                            ws.send(JSON.stringify({
                                type: 'player_moved',
                                error: e.message
                            }));
                        }
                        break;
                }
            });
        });
    }

    requestUpgrade(request: http.IncomingMessage, socket: net.Socket,
        upgradeHead: Buffer) {
        this.wss.handleUpgrade(request, socket, upgradeHead, (ws) => {
            this.wss.emit('connection', ws, request);
        });
    }

    broascast(message: string){
        this.wss.clients.forEach(client => client.send(message));
    }
}

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