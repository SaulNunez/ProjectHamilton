import Knex from "knex";

const environment = process.env.ENVIRONMENT || 'development'
const config = require('../knexfile.js')[environment];

const db: Knex = require('knex')(config);

declare module "knex/types/result" {
    interface Registry {
        Count: number;
    }
}

export default db;