import { Router } from "express";
import { selectLimiter } from "../middleware";
import { environment } from "../../shared/config/";
import generalRoutes from "./general/generalRoutes";
import characterRoutes from "./media/characterRoutes";
import artifactRoutes from "./media/artifactRoutes";
import authRoutes from "./user/authRoutes";
import userRoutes from "./user/userRoutes";

const router = Router();
router.use(selectLimiter());

router.get("/", (_req, res) => res.redirect("/v1"));
router.use(`${environment.API_VERSION}/`, generalRoutes);
router.use(`${environment.API_VERSION}/auth`, authRoutes);
router.use(`${environment.API_VERSION}/users`, userRoutes);
router.use(`${environment.API_VERSION}/artifacts`, artifactRoutes);
router.use(`${environment.API_VERSION}/characters`, characterRoutes);

export default router;