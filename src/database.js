"use strict";

const config = require("./config");

const Pool = require("pg").Pool;
const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.dbname,
  user: config.db.user,
  password: config.db.pwd,
  max: 10,
  connectionTimeoutMillis: 0,
  idleTimeoutMillis: 0
});

module.exports = {
  pool
};
