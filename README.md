# Servidor para Project Hamilton

Como correrlo en producción:
1. Clona repositorio
2. Instalar Node
3. `npm install`
4. Configurar base de datos, de ser necesario se puede editar knexfile.js. Si usa Postgres con puertos por default, se puede configurar por variables de ambiente.
    * `DB_HOST_URL`: Ubicación de la base de datos `localhost` por default o se puede pasar una URL, por ejemplo para usar AWS RDS.
    * `DB_USER`: Usuario de la base de datos. Predeterminado: *postgres*
    * `DB_PASSWORD`: Contraseña de la base de datos, unico campo obligatorio.
5. `npx knex migrate:latest`
6. `npm start`

## API
### Entrar a lobby
#### Input
```json
{
    "type":"enter_lobby",
    "payload": {
        "lobbyCode": "abcd"
    }
}
```

#### Output
```json
{
    "type": "lobby_joined",
    "payload": {
        "currentPlayers": 1,
        "playersInLobbyInfo": [
            {
                "characterName": "gates",
                "displayName": "Cyril Gates"
            }
        ],
        "token": ""
    }
}
```

* `currentPlayers`: Cuantos jugadores están en el lobby.
* `playersInLobbyInfo`: Información de los jugadores actualmente en el lobby.

### Jugadores disponibles
#### Input
```json
{
    "type":"get_available_characters",
    "payload": {
        "lobbyCode": "abcd"
    }
}
```

#### Output
```json
{
    "type": "available_characters_update",
    "payload": {
        "currentPlayers": 5,
        "charactersAvailable": [
            {
                "prototypeId": "gates",
                "name": "Cyril Gates",
                "description": "Lorem Ipsum",
                "sanity": 3,
                "intelligence": 3,
                "physical": 3,
                "bravery": 3
            }
        ]
    }
}
```
* `currentPlayers`: Jugadores en la partida actual.
* `charactersAvailable`: Información de los personajes que puede elegir el jugador
    * `prototypeId`: El id del personaje.
    * `description`: Una pequeña línea de texto que describe la historia del personaje.
    * `sanity`: Stat de salud mental.
    * `intelligence`: Stat de inteligencia.
    * `physical`: Stat de aptitudes físicas.
    * `bravery`: Stat de valentía.

### Seleccionar jugador
#### Input
```json
{
    "type":"select_character",
    "payload": {
        "lobbyCode": "abcd",
        "character": "gates",
        "displayName": "Maria López 😊"
    }
}
```
* `character`: Id del personaje.
* `displayName`: Nombre del jugador.

#### Output
```json
{
    "type": "player_selection_sucess",
    "payload": {
        "playerSecretToken": "",
    }
}
```
##### Mensaje a todos los clientes del lobby
```json
{
    "type": "player_selected_character",
    "payload": {
        "currentPlayers": 5,
        "charactersAvailable": [
            {
                "prototypeId": "gates",
                "name": "Cyril Gates",
                "description": "Lorem Ipsum",
                "sanity": 3,
                "intelligence": 3,
                "physical": 3,
                "bravery": 3
            }
        ]
    }
}
```

Ver información de output de jugadores disponibles por detalles de API.

### Usar item
#### Input
```json
{
    "type":"select_item",
    "payload": {
        "lobbyCode": "abcd",
        "playerToken": "",
        "itemId": "battery"
    }
}
```

#### Output
```json
{
    "type": "available_characters_update",
    "payload": {
        "characterAffectedId": "gates",
        "stats": {
            "sanity": 3,
            "intelligence": 3,
            "physical": 3,
            "bravery": 3
        }
    }
}
```
##### Mensaje a todos los clientes del lobby
```json
{
    "type": "available_characters_update",
    "payload": {
        
    }
}
```


### Movimientos
#### Input
```json
{
    "type":"move_direction",
    "payload": {
        "lobbyCode": "abcd"
    }
}
```

#### Output
```json
{
    "type": "player_moved",
    "payload": {
       
    }
}
```

##### Mensaje a todos los clientes del lobby
```json
{
    "type": "player_moved",
    "payload": {
        
    }
}
```