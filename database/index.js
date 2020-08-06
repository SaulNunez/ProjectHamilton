const db = require('knex')({
    client: 'mysql',
    connection: {
        host: 'PersistDb',
        user: 'Temp',
        password: 'password',
        database: 'ProjectHamilton'
    }
});

db.schema
    .createTable('lobbies', table => {
        table.string("code").unique();
        table.dateTime("creation_time");
    })
    .createTable('items', table => {
        table.uuid("item_token").unique();
        table.integer("sanity");
        table.integer("physical");
        table.integer("intelligence");
        table.integer("bravery");
        table.string("name");
    })
    .createTable('players', table => {
        table.integer("x");
        table.integer("y");
        table.integer("floor");
        table.integer("sanity");
        table.integer("physical");
        table.integer("intelligence");
        table.integer("bravery");
        table.integer("turn_throw");
        table.integer("current_movement_throw");
        table.uuid("server_token");
        table.string("name");
        table.string("lobby")
        .references("lobbies.code");
    })
    .createTable('rooms', table => {
        table.integer("x");
        table.integer("y");
        table.integer("floor");
        table.string("lobby")
            .references("lobbies.code");
        table.enu("gameplay_effect", ["none", "puzzle", "item"]);
        table.integer("stat_effects_physical");
        table.integer("stat_effects_sanity");
        table.integer("stat_effects_intelligence");
        table.integer("stat_effects_bravery");
    });

export default db;