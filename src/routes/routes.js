import { Router } from "express";
import placesRoutes from "./placesRoutes.js"


const routes = Router();

routes.use("/places", placesRoutes);
/* routes.use("/search", searchRoutes);
 */

export default routes;