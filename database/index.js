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
        table.timestamp('creation_time').notNullable().defaultTo(knex.fn.now());
    })
    .createTable('items', table => {
        table.uuid("id").unique();
        table.uuid("player_id").references("players.id");
        table.integer("sanity_effect").notNullable().defaultTo(0);
        table.integer("physical_effect").notNullable().defaultTo(0);
        table.integer("intelligence_effect").notNullable().defaultTo(0);
        table.integer("bravery_effect").notNullable().defaultTo(0);
        table.string("name");
    })
    .createTable('players', table => {
        table.uuid("id");
        table.integer("x").notNullable().defaultTo(0);
        table.integer("y").notNullable().defaultTo(0);
        table.integer("floor").notNullable().defaultTo(0);
        table.integer("sanity").notNullable();
        table.integer("physical").notNullable();
        table.integer("intelligence").notNullable();
        table.integer("bravery").notNullable();
        table.integer("turn_throw");
        table.integer("current_movement_throw");
        table.string("name");
        table.string("character");
        table.string("lobby_id")
        .references("lobbies.code");
    })
    .createTable('rooms', table => {
        table.uuid("id");
        table.integer("x").notNullable();
        table.integer("y").notNullable();
        table.integer("floor").notNullable();
        table.string("lobby_id")
            .references("lobbies.code");
        table.enu("gameplay_effect", ["none", "puzzle", "item", "event"]);
        table.integer("stat_effects_physical").notNullable().defaultTo(0);
        table.integer("stat_effects_sanity").notNullable().defaultTo(0);
        table.integer("stat_effects_intelligence").notNullable().defaultTo(0);
        table.integer("stat_effects_bravery").notNullable().defaultTo(0);
    });

export default db;