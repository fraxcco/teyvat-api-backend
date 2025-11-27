import { Request, Response } from "express";
import { HTTP_STATUS, ERROR_MESSAGES, environment } from "../../shared/config";
import rateLimit from "express-rate-limit";

export const createRateLimiter = (windowMs: number, max: number, message?: string) => {
    return rateLimit({ windowMs, max,
        message: { success: false, error: { message: message || ERROR_MESSAGES.TOO_MANY_REQUESTS, statusCode: HTTP_STATUS.TOO_MANY_REQUESTS }},
        standardHeaders: true,
        legacyHeaders: false,
        handler: (_req: Request, res: Response) => {
            res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
                success: false,
                error: { message: message || ERROR_MESSAGES.TOO_MANY_REQUESTS, statusCode: HTTP_STATUS.TOO_MANY_REQUESTS }
            });
        },
    });
};

export const generalLimiter = createRateLimiter(environment.RATE_LIMIT_WINDOW_MS, environment.RATE_LIMIT_MAX_REQUESTS, "Too many requests from this IP, please try again later.");
export const testLimiter = createRateLimiter(1000, 1000, "Test rate limiter");