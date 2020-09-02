const environment = process.env.ENVIRONMENT || 'development'
const config = require('../knexfile.js')[environment];

const db = require('knex')(config);

export default db;