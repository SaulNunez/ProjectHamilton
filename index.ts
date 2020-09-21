const express = require('express');
const app = express();
import { Request, Response } from 'express';
import { createLobby } from './gameapi/lobbies/handling';
import { lobbyHandling } from './gameapi/lobbies';

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

server.on('upgrade', lobbyHandling);