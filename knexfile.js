// Update with your config settings.
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

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3'
    }
  },
  production: {
    client: 'postgresql',
    connection: {
      host: host,
      user: user,
      password: password,
      database: 'ProjectHamilton',
      port: 5432,
      connectTimeout: 90000
  },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
