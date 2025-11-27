import { body } from "express-validator";
import { Router } from "express";
import { AuthController } from "../../../application/controllers/";
import { validate, authenticateToken } from "../../middleware";

const router = Router();
const authController = new AuthController();

router.post("/register",
    validate([
        body("email").isEmail().withMessage("Valid email required"),
        body("username").isLength({ min: 3, max: 30 }).withMessage("Username must be 3-30 characters"),
        body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
        body("role").optional({ nullable: true }).isString().withMessage("Role must be a string"),
    ]),
    
    authController.register,
);

router.post("/login",
    validate([
        body("password").exists({ checkFalsy: true }).withMessage("Password is required.").bail().isString().withMessage("Password must be a string."),
        body("email").optional({ nullable: true }).trim().isEmail().withMessage("Invalid email format."),
        body("username").optional({ nullable: true }).trim().isLength({ min: 3 }).withMessage("Username must be at least 3 characters."),
        body("identifier").optional({ nullable: true }).trim().isLength({ min: 3 }).withMessage("Identifier must be at least 3 characters."),
        body().custom((_, { req }) => {
            const { email, username, identifier } = req.body ?? {};
            const credential = [identifier, email, username].find(
                (value) => typeof value === "string" && value.trim()
            );

            if(!credential) {
                throw new Error("Email or username is required.");
            }
            
            return true;
        }),
    ]),

    authController.login,
);

router.put("/change-password", authenticateToken,
    validate([
        body("currentPassword").isLength({ min: 8 }).withMessage("Current password must be at least 8 characters"),
        body("newPassword").isLength({ min: 8 }).withMessage("New password must be at least 8 characters"),
    ]),

    authController.changePassword,
);
router.post("/refresh", authController.refreshToken);
router.post("/logout",
    validate([
        body("refreshToken").optional({ nullable: true }).isString().withMessage("Refresh token must be a string."),
        body().custom((_, { req }) => {
            const { refreshToken } = (req?.body ?? {}) as Record<string, unknown>;
            const authorizationHeader = typeof req?.headers?.authorization === "string" ? req.headers.authorization : "";
            const fromBody = typeof refreshToken === "string" && refreshToken.trim().length > 0;
            const fromHeader = authorizationHeader.trim().length > 0;

            if(!fromBody && !fromHeader) {
                throw new Error("Provide refreshToken in body or Authorization header.");
            }

            return true;
        }),
    ]),
    
    authController.logout
);

router.post("/apikeys", authenticateToken, authController.createApiKey);
router.get("/apikeys", authenticateToken, authController.listApiKeys);
router.delete("/apikeys", authenticateToken, authController.revokeApiKey);

export default router;