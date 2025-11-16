import { Router } from "express";
import { environment } from "../../shared/config/";
import characterRoutes from "./media/characterRoutes";
import artifactRoutes from "./media/artifactRoutes";
import authRoutes from "./user/authRoutes";
import userRoutes from "./user/userRoutes";

const router = Router();

router.use(`${environment.API_VERSION}/auth`, authRoutes);
router.use(`${environment.API_VERSION}/users`, userRoutes);
router.use(`${environment.API_VERSION}/artifacts`, artifactRoutes);
router.use(`${environment.API_VERSION}/characters`, characterRoutes);

export default router;