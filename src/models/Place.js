import BaseModel from './BaseModel.js';

const IDNORMAL =
    "SELECT (SELECT row_to_json(t) FROM (SELECT id, name, depto, pcia) AS t) AS place FROM places WHERE id = $1 ;", // params: id
    IDGEOJSON =
    "SELECT 'Feature' AS type, ST_AsGeoJSON (ST_GeometryN (geom, 1))::json AS geometry, (SELECT row_to_json(t) FROM (SELECT id, name, type, aglo, gob_local, depto, pcia, code AS cod_bahra) AS t) AS properties FROM places WHERE id = $1;"; // params: id


class Place extends BaseModel {
    static getById = async (id, format) => {

        let place = null;

        if (format === "geojson") {
            place = this.geojsonFormat(await super.runQuery(IDGEOJSON, [id]))
        } else {
            place = await super.runQuery(IDNORMAL, [id])
        }

        return place
    }

    static getByName = async (name, formae) => {

    }

    
    // Documentacion pendiente
    static geojsonFormat = (place) => {
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
