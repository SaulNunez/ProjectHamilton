const express = require('express');
const WebSocket = require('ws');
const app = express();

import db from './database/index.js';

app.post("/create_lobby", (request, response) => {
    try{
        let lobbyCode = Math.random().toString(36).substring(7);
    
        db("lobbies").insert({
            code: lobbyCode,
        });

        //TODO: Crear cuartos del lobby

        response.send({code: lobbyCode});
    } catch(e){
        console.error(e);
        response.status(400).send({message: "Algo salio mal, porfavor intenta de nuevo."});
    }
});

app.use(express.static('public'));

const wss = new WebSocket.Server({ server: app });
 
wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    const messageContents = JSON.parse(message);

    switch(messageContents.type){
        case 'enter_lobby':
            const [lobbyCode] = messageContents.payload;
            
            const results = await db('lobbies').select('code').where({code: lobbyCode});
            try {
                if(results.length > 0){
                    const playerInfoQuery = await db('players').select('character', 'name').where({lobby: lobbyCode});

                    const tokenInfo = await db.insert({lobby: lobbyCode}, 'token').into('players');
    
                    ws.send({
                        type: 'lobby_joined',
                        payload: {
                            currentPlayers: playerInfoQuery.length,
                            charactersUsed: playerInfoQuery.map(playerInfo => playerInfo.character).filter(player => player),
                            playersInLobbyInfo: playerInfoQuery,
                            token: tokenInfo.token
                        }
                    });
                } else {
                    ws.send({
                        type: 'lobby_joined',
                        error: 'There\'s no lobby found with that code'
                    });
                }
            } catch(error){
                ws.send({
                    type: 'lobby_joined',
                    error: error.message
                });
            }

            break;
        case "get_available_characters":
            try{
                const [lobbyCode] = messageContents.payload;
                const playerInfoQuery = await db('players').select('character', 'name').where({lobby: lobbyCode});

                ws.send({
                    type: 'available_characters_update',
                    payload: {
                        currentPlayers: playerInfoQuery.length,
                        charactersUsed: playerInfoQuery.map(playerInfo => playerInfo.character).filter(player => player),
                        playersInLobbyInfo: playerInfoQuery,
                    }
                });
            } catch(error){
                ws.send({
                    type: 'available_characters_update',
                    error: error.message
                });
            }
            break;
        case "select_character":
            const [token, displayName, character] = messageContents.payload;

            db('players').where('token', '=', token).update({name: displayName, character: character});

            ws.send({
                type: 'player_selection_sucess'
            });

            const playerInfoQuery = await db('players').select('character', 'name', 'x', 'y', 'floor').where({lobby: lobbyCode});
            const data ={
                type: 'player_selected_character',
                payload: {
                    currentPlayers: playerInfoQuery.length,
                    playersInLobbyInfo: playerInfoQuery.map(({name, character})  => ({name, character})),
                    playersPosition: playerInfoQuery.map(({character, x, y, floor}) => ({character, x, y, floor}))
                }
            };

            wss.clients.forEach(function each(client) {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(data);
                }
              });
            break;
    }
  });

});

app.listen(process.env.PORT || 3000, () => console.log(`Server running in port ${port}`));