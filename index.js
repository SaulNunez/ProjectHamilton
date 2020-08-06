const express = require('express');
const { request } = require('express');
const app = express();
const port = 3000;

import db from './database/index.js';

app.post("create_lobby", (request, response) => {
    let lobbyCode = Math.random().toString(36).substring(7);
    
    db("lobbies").insert({
        code: lobbyCode,
    });
    
    //Crear cuartos del lobby
});

app.use(express.static('public'));

app.listen(port, () => console.log(`Server running in port ${port}`));