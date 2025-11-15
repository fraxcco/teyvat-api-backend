import crypto from "crypto";
import jwt from "jsonwebtoken";
import { HTTP_STATUS } from "../config/constants";
import { environment } from "../config/environment";
import { CustomError } from "../../infrastructure/middleware/errorHandler";

interface AccessPayload {
    id: string;
    username: string;
    email: string;
    role: string;
};

interface RefreshPayload {
    id: string;
};

export interface JwtUserLike {
    _id: string;
    username: string;
    email: string;
    role: string;
};

export const generateToken = (user: JwtUserLike) => {
    const accessPayload: AccessPayload = {
        id: String(user._id),
        username: user.username,
        email: user.email,
        role: user.role,
    };

    const accessToken = jwt.sign(accessPayload, environment.JWT_SECRET,
        {
            expiresIn: environment.JWT_EXPIRES_IN as any,
            algorithm: "HS256",
            subject: String(user._id),
        }
    );

    const refreshPayload: RefreshPayload = { id: String(user._id) };

    const refreshToken = jwt.sign(refreshPayload, environment.JWT_REFRESH_SECRET,
        {
            expiresIn: environment.JWT_REFRESH_EXPIRES_IN as any,
            algorithm: "HS256",
            subject: String(user._id),
            jwtid: crypto.randomUUID(),
        },
    );

    return { accessToken, refreshToken };
};

export const verifyAccessToken = <T = Record<string, unknown>>(token: string): T => {
    try {
        return jwt.verify(token, environment.JWT_SECRET) as T;
    } catch (error) {
        throw new CustomError("Invalid or expired access token.", HTTP_STATUS.UNAUTHORIZED);
    };
};