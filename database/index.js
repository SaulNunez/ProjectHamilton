const host = process.env.DB_HOST_URL;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;

if(host === null){
    console.error("DB host not set.");
}

if(user === null){
    console.error("DB user not set.");
}

if(password === null){
    console.error("DB password not set.");
}

const db = require('knex')({
    client: 'mysql',
    connection: {
        host: host,
        user: user,
        password: password,
        database: 'ProjectHamilton',
        port: 3306
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
        table.uuid("token");
        table.string("name");
        table.string("character");
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