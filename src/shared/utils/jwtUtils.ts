import jwt from "jsonwebtoken";
import { HTTP_STATUS, environment } from "../config";
import { CustomError } from "../../infrastructure/middleware/errorHandler";
import { AccessPayload, RefreshPayload, JwtUserLike } from "../../components/interfaces";

export const generateToken = (user: JwtUserLike) => {
    const accessPayload: AccessPayload = { id: String(user._id), username: user.username, email: user.email, role: user.role };
    const accessToken = jwt.sign(accessPayload, environment.JWT_SECRET,
        {
            expiresIn: environment.JWT_EXPIRES_IN,
            algorithm: "HS256",
            subject: String(user._id),
        } as jwt.SignOptions,
    );

    const refreshPayload: RefreshPayload = { id: String(user._id) };
    const refreshToken = jwt.sign(refreshPayload, environment.JWT_REFRESH_SECRET,
        {
            expiresIn: environment.JWT_REFRESH_EXPIRES_IN,
            algorithm: "HS256",
            subject: String(user._id),
        } as jwt.SignOptions,
    );

    return { accessToken, refreshToken };
};

export const verifyAccessToken = <T = Record<string, unknown>>(token: string): T => {
    try {
        return jwt.verify(token, environment.JWT_SECRET, { algorithms: ["HS256"] }) as T;
    } catch {
        throw new CustomError("Invalid or expired access token.", HTTP_STATUS.UNAUTHORIZED);
    }
};