import config from "./config.js";
import pkg from 'pg';

const {Pool} = pkg;
const db = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.dbname,
  user: config.db.user,
  password: config.db.pwd,
  max: 10,
  connectionTimeoutMillis: 0,
  idleTimeoutMillis: 0
});

export default db;