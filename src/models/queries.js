"use strict";

const geocode =
    "SELECT (SELECT row_to_json(t) FROM ( SELECT id, type, name, depto, pcia, rank) AS t) AS place FROM places, to_tsquery_partial(lower(unaccent($1))) AS query, ts_rank_cd(vector, query) AS rank WHERE vector @@ query ORDER BY rank DESC LIMIT $2 ;", // params: text, limit
  reverse =
    "SELECT (SELECT row_to_json(t) FROM (SELECT id, name, depto, pcia) AS t ) AS place FROM places WHERE ST_DWithin( ST_Transform(geom, 3857), ST_Transform(ST_SetSRID(ST_Point($1, $2), 4326), 3857), $3 ) LIMIT $4 ;", // requires 4 params: lon, lat, radius, limit
  geojsonGeocode =
    "SELECT 'Feature' AS type, ST_AsGeoJSON (ST_GeometryN (geom, 1))::json AS geometry, (SELECT row_to_json(t) FROM (SELECT id, name, type, aglo, gob_local, depto, pcia, code AS cod_bahra, rank) AS t) AS properties FROM places, to_tsquery_partial(lower(unaccent($1))) AS query, ts_rank_cd(vector, query) AS rank WHERE vector @@ query ORDER BY rank DESC LIMIT $2 ;", // params: text, limit
  geojsonReverse =
    "SELECT 'Feature' AS type, ST_AsGeoJSON (ST_GeometryN (geom, 1))::json AS geometry, (SELECT row_to_json(t) FROM (SELECT name, type, aglo, gob_local, depto, pcia, code AS cod_bahra) AS t) AS properties FROM places WHERE ST_DWithin( ST_Transform(geom, 3857), ST_Transform(ST_SetSRID(ST_Point($1, $2), 4326), 3857), $3 ) LIMIT $4 ;", // requires 4 params: lon, lat, radius, limit
  intersects = "SELECT row_to_json(j) FROM (SELECT array_to_string(array_agg(distinct name),', ') AS properties, geom FROM (SELECT admin_areas.name AS name, t.geom AS geom FROM admin_areas,(SELECT ST_SetSRID(ST_Point($1, $2), 4326) AS geom) t WHERE ST_Intersects(t.geom, admin_areas.geom)) x GROUP BY geom LIMIT $3) j;"; // requires lon, lat and gives an array with all the envelopes / ¿ integrate with reverse?

module.exports = {
  geocode,
  reverse,
  geojsonGeocode,
  geojsonReverse,
  intersects
};
