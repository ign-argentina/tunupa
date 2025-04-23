import express from "express";
import cors from "cors";
import config from "./src/config.js";
import search from "./src/routes/search.js";
import places from "./src/routes/places.js";

const app = express();
const port = config.server.port;
const path = config.server.path;

app.use(cors());
/* app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));  */

app.get("/", (req, res) => {
  res.json({ info: "Geocodr API" });
});

app.get(`/${path}/search`, search);
app.get(`/${path}/places`, places);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
