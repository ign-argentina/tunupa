import config from "../config.js";
import db from "../database.js";
import * as models from "../models/queries.js";
import Coordinates from "coordinate-parser";

const MIN_QUERY_LENGTH = 2;

/**
 * Normaliza una cadena de texto aplicando reemplazos definidos en las abreviaciones de configuración.
 * Elimina espacios en blanco al principio y al final, y reemplaza coincidencias según `config.abbreviations` ubicados en el archivo config.json.
 *
 * @param {string} q - Cadena de texto a normalizar.
 * @returns {string} - Cadena normalizada.
 */

const data = {
  normalize: (q) => {
    q = q.trim();
    let abb = config.abbreviations;
    abb.forEach((a) => {
      q = q.replace(a[0], a[1]);
    });
    return q;
  },
};

/**
 * Formatea los resultados de la consulta según el formato solicitado.
 *
 * @param {Array} rows - Array de filas, resultado de la query a la DB.
 * @param {string} format - Formato ("geojson" o "list").
 * @returns {Object|Array} - Devuelve un objeto "FeatureCollection" en GeoJSON si el formato es "geojson", o el array de filas si el formato es "list".
 */

const formatResults = (rows, format) => {
  if (format === "geojson") {
    return {
      type: "FeatureCollection",
      features: rows,
    };
  }
  return rows;
};

/**
 * Genera objeto respuesta. Compara la longitud de las filas con 0 y asigna el código HTTP correspondiente.
 *
 * @param {Array} rows - Array de filas, resultado de la query a la DB.
 * @returns {Object} - Devuelve un objeto respuesta con su código HTTP y cuerpo.
 * 
 * 
 */

const getResponse = (rows) => {
  let response = {
    code: 200,
    body: rows,
  }

  return response;
};

/**
 * Ejecuta la consulta SQL y devuelve una promesa con los resultados.
 *
 * @param {String} query - Query a ejecutarse
 * @param {Array} params - Array de paraámetros
 * @returns {Promise<Aray>} - Promesa que se resuelve con las filas del resultado de la consulta.
 * 
 */

const runQuery = (query, params) => { 
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, results) =>
      err ? reject(err) : resolve(results.rows)
    );
  });
}


/**
 * Maneja una búsqueda geográfica por coordenadas o texto.
 * 
 * Si el parámetro `q` es una coordenada válida, realiza geocodificación reversa.
 * Si falla, intenta una geocodificación directa.
 * 
 * @async
 * @param {Object} req - Request HTTP (Express).
 * @param {Object} res - Response HTTP (Express).
 * @returns {Object} Respuesta con resultados en formato JSON.
 * 
 * @example
 * // GET /buscador/search?q=-40.154704,-71.349861
 * 
 * @example
 * // GET /buscador/search?q=huajla,%20atamisqui
 */

const query = async (req, res) => {
  const p = {
    q: data.normalize(req.query.q || ""),
    key: req.query.key || "",
    lang: req.query.lang || config.lang,
    limit: req.query.limit || config.limit,
    radius: req.query.radius || config.radius,
    format: req.query.format || config.format,
    lat: null,
    lon: null,
  };

  if (p.q.length <= MIN_QUERY_LENGTH) {
    return res.status(400).json(config.messages.shortquery);
  }

  try {
    const position = new Coordinates(p.q);
    p.lat = position.getLatitude();
    p.lon = position.getLongitude();

    const sql = p.format === "list" ? models.reverse : models.geojsonReverse;
    let rows = await runQuery(sql, [p.lon, p.lat, p.radius, p.limit]);

    if (!rows || rows.length < 1) {
      const sql = models.intersects;
      rows = await runQuery(sql, [p.lon, p.lat, p.limit]);
    }

    const response = getResponse(formatResults(rows, p.format))
   
   
   // return res.status(200).json(formatResults(rows, p.format));
      return res.status(response.code).json(response.body);  

  } catch (error) {
    return directGecoding(res, p);
  }
};

/**
 * Realiza una búsqueda de geocodificación directa en base a una consulta `q`.
 * 
 * En caso de error autenticación en la base de datos, devuelve un mensaje específico. Otros errores son devueltos con su mensaje original.
 * 
 * @async
 * @param {Object} res - Objeto de respuesta HTTP proveniente de la función principal.
 * @param {Object} p - Parámetros previamente normalizados.
 * @returns {Object} - Respuesta JSON con los resultados de la petición.
 * 
 */

const directGecoding = async (res, p) => {

  const sql = p.format === "list" ? models.geocode : models.geojsonGeocode;
  try {
    
    const rows = await runQuery(sql, [p.q, p.limit]);
    const response = getResponse(formatResults(rows, p.format))

    return res.status(response.code).json(response.body);

  } catch (error) {
    console.log("An error has been catched", error)
    const isAuthError = error.message.includes("authentication failed");
    return res.status(500).json(isAuthError ? "Database authentication error, check credentials or connections available." : error.message);
  }
}

export default query;