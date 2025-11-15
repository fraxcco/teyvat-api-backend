import { Router } from "express";
import { authenticateToken, requireRole } from "../../middleware/authentication";
import { CharacterController } from "../../../application/controllers/";
import { selectLimiter } from "../../middleware/selectLimiter";
import { requireApiKey } from "../../middleware/requireApiKey";

const router = Router();
const characterController = new CharacterController();
router.use(selectLimiter());

router.post("/", authenticateToken, requireRole(["admin"]), characterController.createCharacter);
router.put("/:id", authenticateToken, requireRole(["admin"]), characterController.updateCharacter);
router.delete("/:id", authenticateToken, requireRole(["admin"]), characterController.deleteCharacter);

router.get("/", requireApiKey, characterController.getAllCharacters);
router.get("/:id", requireApiKey, characterController.getCharacterById);

export default router;