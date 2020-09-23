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


## Rutas
### `/create_lobby`
Crea un nuevo lobby.

#### Salida
```json
{ 
    "code": "sa7yu" 
}
```

### `/start_game`
Iniciar partida del lobby code dado.

#### Petición
```json
{
    "lobbyCode": "sa7yu"
}
```

#### Respuesta
* Retorna código `200` si pudo mandar el inicio de sesión.   
* Retorna código `400` si lobby no se especifica.
* Retorna código `404` si lobby no se encuentra entre la lista de lobbies.
* Retorna código `403` si no hay suficientes jugadores, o si ya ha iniciado la partida.

## Websockets
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
        "playerToken": "123e4567-e89b-12d3-a456-426614174000"
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
        "playerToken": "123e4567-e89b-12d3-a456-426614174000",
        "itemId": "battery",
        "characterAffectedId": "gates"
    }
}
```

#### Output
##### Mensaje a todos los clientes del lobby
###### Cambios de stats
```json
{
    "type": "stats_change",
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

###### Cambios de posición
```json
{
    "type": "player_position_update",
    "payload": {
        "characterAffectedId": "gates",
        "newPos": {
            "x": 3,
            "y": 2,
            "floor": 0
        }
    }
}
```

###### Cofre desbloqueado
```json
{
    "type": "chest_unlocked",
    "payload": {
        "unlocked_chest_room": "foyer"
    }
}
```

###### Usar pila
```json
{
    "type": "player_has_battery",
    "payload": {
        "payload": {
            "characterAffectedId": "gates"
        }
    }
}
```

### Movimientos
#### Input
```json
{
    "type":"move_direction",
    "payload": {
        "playerToken": "123e4567-e89b-12d3-a456-426614174000",
        "direction": "right"
    }
}
```

#### Output
```json
{
    "type": "player_position_update",
    "payload": {
        "characterAffectedId": "gates",
        "newPos": {
            "x": 3,
            "y": 2,
            "floor": 0
        }
    }
}
```

### Puzzles
#### Evento de puzzle mandado por el servidor
```json
{
    "type": "puzzle_event",
    "payload": {
        "puzzleId": "1",
        "instructions": "Imprimir del 1 al 10 en la pantalla",
        "documentation": "...",
        "initialWorkspace": "..."
    } 
}
```

* `puzzleId`: Código identificador del puzzle.
* `instructions`: Un pequeño texto explicando que tiene que hacer el jugador.
* `documentation`: Si tiene dudas, el jugador puede acudir a esto para ver como resolver sus dudas. Tiene HTML.
* `initialWorkspace`: XML de workspace de Blockly a mostrar cuando se abrá el workspace.

#### Respuesta del jugador a mandar al servidor
```json
{
    "type": "puzzle_response",
    "payload": {
        "code": "...",
        "puzzleId": "1"
    }
}
```
* `code`: Código Javascript generado.
* `puzzleId`: Código identificador del puzzle.
