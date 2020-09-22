const express = require('express');
const app = express();
import { request, Request, Response } from 'express';
import { createLobby } from './gameapi/lobbies/handling';
import { lobbyHandling } from './gameapi/lobbies';
import { SessionStartResult, startSession } from './gameapi/lobbies/session_start';

app.post("/create_lobby", async (_request: Request, response: Response) => {
    const lobbyCode = await createLobby();
    if (lobbyCode) {
        response.send({ code: lobbyCode });
    } else {
        response.status(400).send({ message: "Algo salio mal, porfavor intenta de nuevo." });
    }
});

app.post('/start_game_session', async(request: Request, response: Response) => {
    if(request.body.lobbyCode){
        switch(await startSession(request.body.lobbyCode)){
            case SessionStartResult.Sucess:
                response.sendStatus(200);
                break;
            case SessionStartResult.LobbyNotFound:
                response.sendStatus(404);
                break;
            case SessionStartResult.NotEnoughPlayers:
                response.sendStatus(403);
                break;
        }

        return;
    }

    response.sendStatus(400);
});

app.use(express.static('public'));

const port = process.env.PORT || 3000;

const server = app.listen(port, () => console.log(`Server running on port ${port}`));

server.on('upgrade', lobbyHandling);