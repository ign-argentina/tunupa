"use strict";

var env = process.env.NODE_ENV || "development";
const config = require("../config.json")[env];

module.exports = config;
