import { Router } from "express";
import GeocodeController from "../controllers/GeocodeController.js";

const geocodeRoutes = Router();
const geocodeController = new GeocodeController();


geocodeRoutes.get("/", geocodeController.geoCode);


export default geocodeRoutes;