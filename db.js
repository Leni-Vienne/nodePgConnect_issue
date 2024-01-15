const config = require('./config.js');
const pgCon = require('pg')

const pool = new pgCon.Pool(config.postgres)
pool.connect()

module.exports = pool
