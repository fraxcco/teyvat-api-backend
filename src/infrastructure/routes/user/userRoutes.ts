import { body } from "express-validator";
import { Router } from "express";
import { UserController } from "../../../application/controllers";
import { validate, requireRole, authenticateToken } from "../../middleware";

const router = Router();
const userController = new UserController();

router.get("/me", authenticateToken, userController.getCurrentUser);
router.put("/me", authenticateToken, validate([ body("email").optional().isEmail().withMessage("Valid email required"), body("username").optional().isLength({ min: 3, max: 30 }).withMessage("Username must be 3-30 characters"), ]), userController.updateCurrentUser);
router.get("/:id", authenticateToken, requireRole(["admin"]), userController.getUserById);
router.get("/", authenticateToken, requireRole(["admin"]), userController.getAllUsers);

export default router;