"use strict";

const config = require("../config");
const db = require("../database");
const models = require("../models/places");


// TO DO
const query = async (req, res) => {
  let p = {
    id: req.query.id || "",
    key: req.query.key || "",
    format: req.query.format || config.format,
  };

  if (p.id) {
    let model,
      fc = {
        type: "fc",
        features: null,
      };
    try {
      p.format === "geojson" ? (model = models.idGeojson) : (model = models.id);

      await db.pool.query(model, [p.id], (error, results) => {
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

module.exports = {
  query
};
