import { Router } from "express";
import PlacesController from "../controllers/PlacesController.js";

const placesRoutes = Router();
const placeController = new PlacesController();

// placesRoutes.get("/:id", placesController.getPlaceById); // Ideal por parámetro y no por query al ser búsqueda simple.

placesRoutes.get("/", placeController.getById);

export default placesRoutes;