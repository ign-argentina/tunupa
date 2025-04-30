import BaseModel from './BaseModel.js';

const IDNORMAL =
         "SELECT (SELECT row_to_json(t) FROM (SELECT id, name, depto, pcia) AS t) AS place FROM places WHERE id = $1 ;", // params: id
    IDGEOJSON =
        "SELECT 'Feature' AS type, ST_AsGeoJSON (ST_GeometryN (geom, 1))::json AS geometry, (SELECT row_to_json(t) FROM (SELECT id, name, type, aglo, gob_local, depto, pcia, code AS cod_bahra) AS t) AS properties FROM places WHERE id = $1;", // params: id
    GEOCODE =
        "SELECT (SELECT row_to_json(t) FROM ( SELECT id, type, name, depto, pcia, rank) AS t) AS place FROM places, to_tsquery_partial(lower(unaccent($1))) AS query, ts_rank_cd(vector, query) AS rank WHERE vector @@ query ORDER BY rank DESC LIMIT $2 ;", // params: text, limit
    GEOJSONGEOCODE =
        "SELECT 'Feature' AS type, ST_AsGeoJSON (ST_GeometryN (geom, 1))::json AS geometry, (SELECT row_to_json(t) FROM (SELECT id, name, type, aglo, gob_local, depto, pcia, code AS cod_bahra, rank) AS t) AS properties FROM places, to_tsquery_partial(lower(unaccent($1))) AS query, ts_rank_cd(vector, query) AS rank WHERE vector @@ query ORDER BY rank DESC LIMIT $2 ;", // params: text, limit
    REVERSE =
        "SELECT (SELECT row_to_json(t) FROM (SELECT id, name, depto, pcia) AS t ) AS place FROM places WHERE ST_DWithin( ST_Transform(geom, 3857), ST_Transform(ST_SetSRID(ST_Point($1, $2), 4326), 3857), $3 ) LIMIT $4 ;", // requires 4 params: lon, lat, radius, limit
    GEOJSONREVERSE =
        "SELECT 'Feature' AS type, ST_AsGeoJSON (ST_GeometryN (geom, 1))::json AS geometry, (SELECT row_to_json(t) FROM (SELECT name, type, aglo, gob_local, depto, pcia, code AS cod_bahra) AS t) AS properties FROM places WHERE ST_DWithin( ST_Transform(geom, 3857), ST_Transform(ST_SetSRID(ST_Point($1, $2), 4326), 3857), $3 ) LIMIT $4 ;", // requires 4 params: lon, lat, radius, limit
    INTERSECTS =
        "SELECT row_to_json(j) FROM (SELECT array_to_string(array_agg(distinct name),', ') AS properties, geom FROM (SELECT admin_areas.name AS name, t.geom AS geom FROM admin_areas,(SELECT ST_SetSRID(ST_Point($1, $2), 4326) AS geom) t WHERE ST_Intersects(t.geom, admin_areas.geom)) x GROUP BY geom LIMIT $3) j;"; // requires lon, lat and gives an array with all the envelopes / ¿ integrate with reverse?

class Place extends BaseModel {
    static getById = async (id, format) => {
        let place = null;

        if (format === "geojson") {
            place = this.#geojsonFormatByID(await super.runQuery(IDGEOJSON, [id]))
        } else {
            place = await super.runQuery(IDNORMAL, [id])
        }

        return place
    }

    static getByName = async (params) => {
        let place = []
        place = params.format === "list" ? await super.runQuery(GEOCODE, [params.q, params.limit]) : await super.runQuery(GEOJSONGEOCODE, [params.q, params.limit])
        return this.#geoJsonFormatByCoordinates(place, params.format)
    }

    static getByCoordinates = async (coords) => {
        try {

            let place = []

            if (coords.format === "list") {
                place = await super.runQuery(REVERSE, [coords.lon, coords.lat, coords.radius, coords.limit])
            } else {
                place = await super.runQuery(GEOJSONREVERSE, [coords.lon, coords.lat, coords.radius, coords.limit])
                place = this.#geoJsonFormatByCoordinates(place, coords.format);
            }

            if (!place || place.length < 1) {
                place = await super.runQuery(INTERSECTS, [coords.lon, coords.lat, coords.limit]);
            }

            return place;
        } catch (error) {
            console.log("Error en la capa de persistencia " + error.message)
            return []
        }
    }

    static #geoJsonFormatByCoordinates = (place, format) => {
        if (format === "geojson") {
            return {
                type: "FeatureCollection",
                features: place,
            };
        }
        return place;
    };

    // Documentacion pendiente
    static #geojsonFormatByID = (place) => {
        let placeFormat = {
            type: "fc",
            features: place,
        }

        if (placeFormat.features.length > 0) {
            placeFormat.features[0].properties.id = placeFormat.features[0].properties.id.toString();
        }

        return placeFormat
    }
}

export default Place;