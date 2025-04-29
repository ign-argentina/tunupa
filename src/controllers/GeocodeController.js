import GeocodeService from "../services/GeocodeService.js";
import config from "../config.js";

const MIN_QUERY_LENGTH = 2;

class GeocodeController {
    constructor(){        
        this.geocodeService = new GeocodeService();
    }

    geoCode = async (req, res) => {
        try {
            const params = {
                q: data.normalize(req.query.q || ""),
                key: req.query.key || "",
                lang: req.query.lang || config.lang,
                limit: req.query.limit || config.limit,
                radius: req.query.radius || config.radius,
                format: req.query.format || config.format,
                lat: null,
                lon: null,
              };
             
              if (params.q.length <= MIN_QUERY_LENGTH) {
                return res.status(400).json(config.messages.shortquery);
              }

            console.log("no")
            const results = await this.geocodeService.geoCode(params);
            return res.status(200).json(results);

        } catch (error) {
            console.log("Error en el controlador", error)
            return res.status(500).json(error.message);
        }
    }
}

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

export default GeocodeController;
