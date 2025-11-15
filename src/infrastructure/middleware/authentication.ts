import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS, ERROR_MESSAGES } from "../../shared/config/constants";
import { environment } from "../../shared/config/environment";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: {
        id: string;
        username: string;
        email: string;
        role: string;
    };
};

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers["authorization"];
    const [scheme, token] = authHeader ? authHeader.split(" ") : [null, null];

    if(!scheme || scheme.toLowerCase() !== "bearer" || !token) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            error: {
                message: "Authorization header must provide Bearer accessToken",
                statusCode: HTTP_STATUS.UNAUTHORIZED,
            },
        });

        return;
    };

    jwt.verify(token, environment.JWT_SECRET, { algorithms: ["HS256"] }, (error: any, user: any) => {
        if(error) {
            res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                error: {
                    message: "Invalid, expired, or malformed accessToken",
                    statusCode: HTTP_STATUS.UNAUTHORIZED,
                },
            });

            return;
        };

        req.user = user;
        next();
    });
};

export const requireRole = (roles: string[]) => {
    return(req: AuthRequest, res: Response, next: NextFunction): void => {
        if(!req.user) {
            res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                error: {
                    message: "accessToken required for this operation",
                    statusCode: HTTP_STATUS.UNAUTHORIZED,
                },
            });
            
            return;
        };

        const userRole = String(req.user.role).toLowerCase();
        const allowed = roles.map((r) => String(r).toLowerCase());

        if(!allowed.includes(userRole)) {
            res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                error: {
                    message: ERROR_MESSAGES.FORBIDDEN,
                    statusCode: HTTP_STATUS.FORBIDDEN
                },
            });

            return;
        };

        next();
    };
};