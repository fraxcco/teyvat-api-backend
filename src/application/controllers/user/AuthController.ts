import { Request, Response } from "express";
import { IUser } from "../../../components/interfaces";
import { HTTP_STATUS } from "../../../shared/config/constants";
import { verifyAccessToken } from "../../../shared/utils/jwtUtils";
import { CustomError } from "../../../infrastructure/middleware/errorHandler";
import { asyncHandler } from "../../../infrastructure/middleware/errorHandler";
import { environment } from "../../../shared/config/environment";
import { generateToken } from "../../../shared/utils/jwtUtils";
import { hashToken } from "../../../shared/utils/hashToken";
import { AuthService } from "../../services/";
import { ApiKeyService } from "../../services/user/ApiKeyService";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
    user: { id: string; email: string; username: string; role: string };
};

const sanitizeUser = (user: IUser) => ({
    id: user._id,
    role: user.role,
    email: user.email,
    username: user.username,
});

export class AuthController {
    constructor(
        private readonly authService: AuthService = new AuthService(),
        private readonly apiKeyService: ApiKeyService = new ApiKeyService()
    ) {};

    public login = asyncHandler(async (req: Request, res: Response) => {
        const { identifier, email, username, password } = req.body;

        if(typeof password !== "string" || !password.trim()) {
            throw new CustomError("Password is required.", HTTP_STATUS.BAD_REQUEST);
        }

        const credential = [identifier, email, username].find((value) => typeof value === "string" && value.trim());

        if(!credential) {
            throw new CustomError("Email or username is required.", HTTP_STATUS.BAD_REQUEST);
        };

        const user = await this.authService.authenticateUser(credential.trim(), password);
        const { accessToken, refreshToken } = generateToken(user);

        const hashed = hashToken(refreshToken);
        await this.authService.saveRefreshToken(user._id.toString(), hashed);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { user: sanitizeUser(user), accessToken, refreshToken },
        });
    });

    public register = asyncHandler(async (req: Request, res: Response) => {
        const { username, email, password, role } = req.body;

        const user = await this.authService.registerUser({ username, email, password, role });
        const { accessToken, refreshToken } = generateToken(user);

        const hashed = hashToken(refreshToken);
        await this.authService.saveRefreshToken(user._id.toString(), hashed);

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            data: { user: sanitizeUser(user), accessToken, refreshToken },
        });
    });

    public changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { currentPassword, newPassword } = req.body;
        await this.authService.changePassword(req.user.id, currentPassword, newPassword);

        res.status(HTTP_STATUS.OK).json({ success: true, message: "Password changed successfully" });
    });

    public refreshToken = asyncHandler(async (req: Request, res: Response) => {
        const { refreshToken } = req.body;

        if(!refreshToken) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                error: { message: "Refresh token required", statusCode: HTTP_STATUS.UNAUTHORIZED },
            });
        };

        let decoded: any;

        try {
            decoded = jwt.verify(refreshToken, environment.JWT_REFRESH_SECRET, { algorithms: ["HS256"] });
        } catch {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                error: { message: "Invalid or expired refresh token", statusCode: HTTP_STATUS.UNAUTHORIZED },
            });
        };

        const hashed = hashToken(refreshToken);
        const user = await this.authService.findByRefreshToken(hashed);

        if(!user || user._id.toString() !== decoded.id) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                error: { message: "Invalid refresh token", statusCode: HTTP_STATUS.UNAUTHORIZED },
            });
        };

        await this.authService.revokeRefreshToken(hashed);

        const { accessToken, refreshToken: newRefreshToken } = generateToken(user);
        const newHashedRefreshToken = hashToken(newRefreshToken);

        await this.authService.saveRefreshToken(user._id.toString(), newHashedRefreshToken);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { accessToken, refreshToken: newRefreshToken },
        });
    });

    public logout = asyncHandler(async (req: Request, res: Response) => {
        const bodyToken = typeof req.body?.refreshToken === "string" ? req.body.refreshToken.trim() : "";
        const authHeader = req.headers.authorization;

        if(bodyToken) {
            await this.authService.revokeRefreshToken(bodyToken);
        } else if(authHeader?.startsWith("Bearer ")) {
            const accessToken = authHeader.split(" ")[1];
            const payload = verifyAccessToken(accessToken);
            const userId = String(payload?.id ?? payload?.sub ?? "");
            
            if(!userId) {
                throw new CustomError("Invalid access token.", HTTP_STATUS.UNAUTHORIZED);
            };
            
            await this.authService.revokeRefreshTokenForUser(userId);
        } else {
            throw new CustomError("Refresh token or Authorization header is required.", HTTP_STATUS.BAD_REQUEST);
        };

        res.status(HTTP_STATUS.OK).json(({ success: true, message: "Logged out successfully" }));
    });

    public createApiKey = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user.id;
        const { label } = req.body;
        
        const apiKey = await this.apiKeyService.createApiKey(userId, label);
        res.status(HTTP_STATUS.CREATED).json({ success: true, data: { key: apiKey.key, label: apiKey.label } });
    });

    public listApiKeys = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user.id;
        const keys = await this.apiKeyService.listApiKeys(userId);

        res.json({ success: true, data: keys });
    });

    public revokeApiKey = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user.id;
        const { key, label } = req.body || {};
    
        if(!key && !label) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: { message: "Provide api key or label to revoke" } });
        };
    
        let query: any = { userId };
        
        if(key) query.key = key;
        if(label) query.label = label;
    
        const result = await this.apiKeyService.deleteApiKeyByQuery(query);

        if(result.deletedCount === 0) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: { message: "API key not found" } });
        };
    
        res.json({ success: true });
    });
};