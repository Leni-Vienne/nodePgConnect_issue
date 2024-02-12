const config = require('./config.js');
const pgCon = require('pg')

const pool = new pgCon.Pool(config.postgres)

module.exports = pool
