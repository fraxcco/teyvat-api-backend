import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../../middleware/validation";
import { authenticateToken, requireRole } from "../../middleware/authentication";
import { UserController } from "../../../application/controllers";
import { selectLimiter } from "../../middleware/selectLimiter";

const router = Router();
const userController = new UserController();
router.use(selectLimiter());

router.get("/me", authenticateToken, userController.getCurrentUser);
router.put(
    "/me",
    authenticateToken,
    validate([
        body("email").optional().isEmail().withMessage("Valid email required"),
        body("username").optional().isLength({ min: 3, max: 30 }).withMessage("Username must be 3-30 characters"),
    ]),
    userController.updateCurrentUser,
);

router.get("/", authenticateToken, requireRole(["admin"]), userController.getAllUsers);
router.get("/:id", authenticateToken, requireRole(["admin"]), userController.getUserById);

export default router;