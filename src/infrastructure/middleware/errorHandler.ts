import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS, ERROR_MESSAGES, environment } from "../../shared/config";

export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR, isOperational: boolean = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (error: AppError, _req: Request, res: Response, _next: NextFunction): void => {
    const { statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, message } = error;
    
    if(environment.NODE_ENV === "test") {
        console.error(`❌ | Error ${statusCode}: ${message}`);
        console.error(error.stack);
    }

    res.status(statusCode).json({
        success: false,
        error: { message: message || ERROR_MESSAGES.INTERNAL_ERROR, statusCode, ...(environment.NODE_ENV === "development" && { stack: error.stack })}
    });
};

export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: { message: `Route ${req.originalUrl} not found`, statusCode: HTTP_STATUS.NOT_FOUND }
    });
};

export const asyncHandler = <T extends Request>(fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>) => {
    return (req: T, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};