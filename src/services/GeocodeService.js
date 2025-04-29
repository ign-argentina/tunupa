import config from "../config.js";
import Place from "../models/Place.js";
import Coordinates from "coordinate-parser";

class GeocodeService{

    geoCode = async (params) => {
        try{

            let places = []
            const coords = this.#areCoordinates(params)

           if (coords != false){
            console.log("Coordenada valida")
            places = this.#reverseGeocode(coords)
           } else {
            console.log("Coordenadas invalidas, probando de manera directa")
            places = this.#directGeocode(params)
           }

           return places;
        }catch(error){

        }
    }

    #reverseGeocode = async (coords) => {
        return await Place.getByCoordinates(coords)
    }

    #directGeocode = async (params) => {
        return await Place.getByName(params)
    }

    #areCoordinates = (params) => {
        try{
            //console.log(params)
            const coords = new Coordinates(params.q);
            params.lat = coords.getLatitude();
            params.lon = coords.getLongitude();

           // console.log(params)
            return params;
        } catch(error){
            return false;
        }
    }
}

export default GeocodeService;