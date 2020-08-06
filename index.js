const express = require('express');
const { request } = require('express');
const app = express();
const port = 3000;

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

app.listen(port, () => console.log(`Server running in port ${port}`));