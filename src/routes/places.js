
import config from "../config.js";
import db from "../database.js";
import * as models from "../models/places.js";


// TO DO
const query = async (req, res) => {

  let p = {
    id: req.query.id || "",
    key: req.query.key || "",
    format: req.query.format || config.format,
  };

    // Validar si existe y si es un número entero || HotFix
    if (!p.id || isNaN(p.id) || !Number.isInteger(Number(p.id))) {
      return res.status(400).json({ error: 'El parámetro "id" debe ser un número entero válido.' });
    }


  if (p.id) {
    let model,
      fc = {
        type: "fc",
        features: null,
      };
    try {
      p.format === "geojson" ? (model = models.idGeojson) : (model = models.id);

      db.query(model, [p.id], (error, results) => {
        if (error) {
          throw error;
        }
        if (p.format === "geojson") {
          fc.features = results.rows;
          if (fc.features.length > 0) {
            fc.features[0].properties.id =
              fc.features[0].properties.id.toString();
          }
          results = fc;
        } else {
          results = results.rows;
        }
        res.status(200).json(results);
      });
    } catch (error) {
      throw error
    }
  } else {
    res.status(500).json(config.messages.shortquery);
  }
};

export default query;