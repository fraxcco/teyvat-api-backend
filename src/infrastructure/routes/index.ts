import { Router } from "express";
import { environment } from "../../shared/config/";
import characterRoutes from "./media/characterRoutes";
import artifactRoutes from "./media/artifactRoutes";
import authRoutes from "./user/authRoutes";
import userRoutes from "./user/userRoutes";

const router = Router();
const apiPrefix = `${environment.API_PREFIX}${environment.API_VERSION}`;

router.use(`${apiPrefix}/auth`, authRoutes);
router.use(`${apiPrefix}/users`, userRoutes);
router.use(`${apiPrefix}/artifacts`, artifactRoutes);
router.use(`${apiPrefix}/characters`, characterRoutes);

export default router;