import Knex from "knex";

const environment = process.env.ENVIRONMENT || 'development'
const config = require('../knexfile.js')[environment];

const db: Knex = require('knex')(config);

export default db;