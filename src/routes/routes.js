import { Router } from "express";
import placesRoutes from "./placesRoutes.js"
import geocodeRoutes from "./geocodeRoutes.js";


const routes = Router();

routes.use("/places", placesRoutes);
routes.use("/search", geocodeRoutes);


export default routes;