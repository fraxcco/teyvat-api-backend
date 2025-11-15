import { NextFunction, Request, Response } from "express";
const startTimeSymbol = Symbol("requestStartTime");

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    ((req as unknown) as Record<symbol, number>)[startTimeSymbol] = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - (((req as unknown) as Record<symbol, number>)[startTimeSymbol] ?? Date.now());
        const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;

        if(res.statusCode >= 500) {
            console.error(message);
        } else if(res.statusCode >= 400) {
            console.warn(message);
        } else {
            console.info(message);
        };
    });

    next();
};