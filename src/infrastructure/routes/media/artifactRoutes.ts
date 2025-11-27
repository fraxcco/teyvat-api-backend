import { Router } from "express";
import { ArtifactController } from "../../../application/controllers/"
import { requireRole, requireApiKey, authenticateToken } from "../../middleware";

const router = Router();
const artifactController = new ArtifactController();

router.get("/", requireApiKey, artifactController.getAllArtifacts);
router.get("/:id", requireApiKey, artifactController.getArtifactById);
router.post("/", authenticateToken, requireRole(["admin"]), artifactController.createArtifact);
router.put("/:id", authenticateToken, requireRole(["admin"]), artifactController.updateArtifact);
router.delete("/:id", authenticateToken, requireRole(["admin"]), artifactController.deleteArtifact);


export default router;