"use strict";

const id =
    "SELECT (SELECT row_to_json(t) FROM (SELECT id, name, depto, pcia) AS t) AS place FROM places WHERE id = $1 ;", // params: id
    idGeojson =
    "SELECT 'Feature' AS type, ST_AsGeoJSON (ST_GeometryN (geom, 1))::json AS geometry, (SELECT row_to_json(t) FROM (SELECT id, name, type, aglo, gob_local, depto, pcia, code AS cod_bahra) AS t) AS properties FROM places WHERE id = $1;"; // params: id

module.exports = {
  id,
  idGeojson
};