var knex = require('knex')({
    client: 'mysql',
    connection: {
      host : 'PersistDb',
      user : 'Temp',
      password : 'password',
      database : 'ProjectHamilton'
    }
  });