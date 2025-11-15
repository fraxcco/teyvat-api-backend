import { Router } from "express";
import { authenticateToken, requireRole } from "../../middleware/authentication";
import { ArtifactController } from "../../../application/controllers/"
import { selectLimiter } from "../../middleware/selectLimiter";
import { requireApiKey } from "../../middleware/requireApiKey";

const router = Router();
const artifactController = new ArtifactController();
router.use(selectLimiter());

router.post("/", authenticateToken, requireRole(["admin"]), artifactController.createArtifact);
router.put("/:id", authenticateToken, requireRole(["admin"]), artifactController.updateArtifact);
router.delete("/:id", authenticateToken, requireRole(["admin"]), artifactController.deleteArtifact);

router.get("/", requireApiKey, artifactController.getAllArtifacts);
router.get("/:id", requireApiKey, artifactController.getArtifactById);

export default router;