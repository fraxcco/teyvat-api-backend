import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS, ERROR_MESSAGES, environment } from "../../shared/config";
import { AuthRequest, AccessPayload } from "../../components/interfaces";
import jwt from "jsonwebtoken";

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers["authorization"];
    const [scheme, token] = authHeader ? authHeader.split(" ") : [null, null];

    if(!scheme || scheme.toLowerCase() !== "bearer" || !token) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            error: { message: "Authorization header must provide Bearer accessToken", statusCode: HTTP_STATUS.UNAUTHORIZED },
        });

        return;
    }

    jwt.verify(token, environment.JWT_SECRET, { algorithms: ["HS256"] }, (error, user) => {
        if(error) {
            res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                error: { message: "Invalid, expired, or malformed accessToken", statusCode: HTTP_STATUS.UNAUTHORIZED },
            });

            return; 
        }

        (req as AuthRequest).user = user as AccessPayload;
        next();
    });
};

export const requireRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = (req as AuthRequest).user;
        if(!user) {
            res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                error: { message: "accessToken required for this operation", statusCode: HTTP_STATUS.UNAUTHORIZED },
            });
            return;
        }

        if(!roles.map((r) => r.toLowerCase()).includes(user.role.toLowerCase())) {
            res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                error: { message: ERROR_MESSAGES.FORBIDDEN, statusCode: HTTP_STATUS.FORBIDDEN },
            });
            return;
        }
        next();
    };
};