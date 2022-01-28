"use strict";

const express = require("express");
const cors = require("cors");
const app = express();

const config = require("./src/config");
const port = config.server.port;
const path = config.server.path;
const search = require("./src/routes/search");
const places = require("./src/routes/places");

app.use(cors());

app.get("/", (req, res) => {
  res.json({ info: "Geocodr API" });
});

app.get(`/${path}/search`, search.query);
app.get(`/${path}/places`, places.query);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
