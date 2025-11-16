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
router.get(`${environment.API_VERSION}/`, (_req, res) => res.redirect("https://docs.teyvatapi.xyz/"));
router.use((req, res, next) => {
	if(req.path.startsWith(environment.API_VERSION)) return next();

	return res.redirect("https://docs.teyvatapi.xyz/");
});

export default router;