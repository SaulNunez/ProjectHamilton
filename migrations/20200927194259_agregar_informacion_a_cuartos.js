
exports.up = function(knex) {
    knex.schema.table('rooms', table => {
        table.boolean('playerActionAvailable');
    });
};

exports.down = function(knex) {
};
