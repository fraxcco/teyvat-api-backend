import { Router } from "express";
import { CharacterController } from "../../../application/controllers/";
import { requireRole, requireApiKey, authenticateToken } from "../../middleware";

const router = Router();
const characterController = new CharacterController();

router.get("/", requireApiKey, characterController.getAllCharacters);
router.get("/:id", requireApiKey, characterController.getCharacterById);
router.post("/", authenticateToken, requireRole(["admin"]), characterController.createCharacter);
router.put("/:id", authenticateToken, requireRole(["admin"]), characterController.updateCharacter);
router.delete("/:id", authenticateToken, requireRole(["admin"]), characterController.deleteCharacter);

export default router;