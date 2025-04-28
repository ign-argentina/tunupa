import PlaceService from "../services/PlaceService.js";

class PlaceController {
    PlaceService = new PlaceService();

    getById = async (req, res) => {
        try {
            const place = req.query
            if (!place.id || isNaN(place.id) || !Number.isInteger(Number(place.id))) {
                return res.status(400).json("El ID debe ser un número entero")
              }

            let response = await this.PlaceService.getById(req.query);

            return res.status(200).json(response);
        } catch (error) {

            if (error.message === "El ID debe ser un número entero") {
                return res.status(400).json(error.message);
            }
            console.log("Error en el controlador", error)
            return res.status(500).json(error.message);
        }
    }
}

export default PlaceController;