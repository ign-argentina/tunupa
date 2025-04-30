import express from "express";
import cors from "cors";
import config from "./src/config.js";
import routes from "./src/routes/routes.js";

import pathh from 'path'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'

const app = express();
const port = config.server.port;
const path = config.server.path;

app.use(cors());


/* app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));  */

app.get("/", (req, res) => {
  res.json({ info: "Geocodr API" });
});

// Mostrar Swagger UI
const apiSpec = pathh.join(process.cwd(), 'openapi.yaml');
const openApiDocument = YAML.load(apiSpec);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

/****** USO DE RUTAS  ******/
app.use(`/${path}`, routes);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});