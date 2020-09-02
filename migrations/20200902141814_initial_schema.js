
exports.up = function(knex) {
  return knex.schema
  .createTable('lobbies', table => {
      table.string("code").unique();
      table.timestamp('creation_time').notNullable().defaultTo(knex.fn.now());
  })
  .createTable('items', table => {
      table.uuid("id").unique();
      table.uuid("player_id").references("players.id");
      table.integer("prototype");
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
      table.string("display_name");
      table.string("character_prototype_id");
      table.string("character_name");
      table.string("lobby_id")
      .references("lobbies.code");

      table.unique(['lobby_id', 'character_prototype_id']);
  })
  .createTable('rooms', table => {
      table.uuid("id");
      table.integer("x").notNullable();
      table.integer("y").notNullable();
      table.integer("floor").notNullable();
      table.string("lobby_id")
          .references("lobbies.code");
      table.string("room_proto");
  });
};

exports.down = function(knex) {
  
};
