"use strict";

const config = require("../config");
const db = require("../database");
const models = require("../models/queries");
const Coordinates = require("coordinate-parser");

const data = {
  normalize: (q) => {
    q = q.trim();
    let abb = config.abbreviations;
    abb.forEach((a) => {
      q = q.replace(a[0], a[1]);
    });
    return q;
  },
  _ck_lat: /^(-?[1-8]?\d(?:\.\d{1,18})?|90(?:\.0{1,18})?)$/,
  _ck_lon: /^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,18})?|180(?:\.0{1,18})?)$/,
};

const query = async (req, res) => {
  let p = {
    q: data.normalize(req.query.q) || "",
    key: req.query.key || "",
    lang: req.query.lang || config.lang,
    limit: req.query.limit || config.limit,
    radius: req.query.radius || config.radius,
    format: req.query.format || config.format,
    lat: null,
    lon: null,
  };

  if (p.q.length > 2) {
    let model,
      featureCollection = {
        type: "FeatureCollection",
        features: null,
      };
    try {
      // console.log(p.q);
      p.format === "list"
        ? (model = models.reverse)
        : (model = models.geojsonReverse);
      let position = new Coordinates(p.q);
      p.lat = position.getLatitude();
      p.lon = position.getLongitude();
      db.pool.query(
        model,
        [p.lon, p.lat, p.radius, p.limit],
        (error, results) => {
          // lat lon must be inverted for PostGIS
          if (error) {
            throw error;
          }
          if (p.format === "geojson") {
            featureCollection.features = results.rows;
            results = featureCollection;
          } else {
            results = results.rows;
          }
          if (results.length >= 1) {
            res.status(200).json(results);
          } else {
            model = models.intersects;
            db.pool.query(model, [p.lon, p.lat, p.limit], (error, results) => {
              if (error) {
                throw error;
              }
              if (p.format === "geojson") {
                featureCollection.features = results.rows;
                results = featureCollection;
              } else {
                results = results.rows;
              }
              res.status(200).json(results);
            });
          }
        }
      );
    } catch (error) {
      p.format === "list"
      ? (model = models.geocode)
      : (model = models.geojsonGeocode);
      
      db.pool.query(model, [p.q, p.limit], (error, results) => {
        if (error) {
          if(error.message.includes("authentication failed")) {
            res.status(500).json("Database authentication error, check credentials or connections available.");
          } else {
            res.status(500).json(error.message);
          }
          //console.log(error.message);
        }
        if (p.format === "geojson") {
          featureCollection.features = results.rows;
          results = featureCollection;
        } else {
          results = results.rows;
        }
        res.status(200).json(results);
      });
    }
  } else {
    res.status(500).json(config.messages.shortquery);
  }
};

const reverse = async () => {};

module.exports = {
  query,
};
