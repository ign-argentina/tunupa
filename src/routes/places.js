
import config from "../config.js";
import db from "../database.js";
import * as models from "../models/places.js";

// Documentacion pendiente
const runQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, results) =>
      err ? reject(err) : resolve(results.rows)
    );
  });
}

// Documentacion pendiente
const geojsonFormat = (results) => {
  let fc = {
    type: "fc",
    features: results,
  }

  if (fc.features.length > 0) {
    fc.features[0].properties.id = fc.features[0].properties.id.toString();
  }

  return fc
}

// Documentacion pendiente
const getPlaceById = async (req, res) => {
  try {
    const p = {
      id: req.query.id,
      key: req.query.key || "",
      format: req.query.format || config.format,
    };

    if (!p.id || isNaN(p.id) || !Number.isInteger(Number(p.id))) {
      return res.status(400).json("El ID debe ser un número entero")
    }

    let query = models.id;
    let results = null;

    if (p.format === "geojson") {
      results = geojsonFormat(await runQuery(models.idGeojson, [p.id]))
    } else {
      results = await runQuery(query, [p.id])
    }

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json(error.message)
  }

}

export default getPlaceById;