import config from "../config.js";
import Place from "../models/Place.js";

class PlaceService{
    getById =  (queryParams) => {
        try{       
            const place = {
                id: queryParams.id,
                key: queryParams.key || "",
                format: queryParams.format || config.format,
              };
          

              let results = Place.getById(place.id, place.format);
              return results;       

        } catch(error){
            throw new Error(error.message)   
        }
    }
}

export default PlaceService