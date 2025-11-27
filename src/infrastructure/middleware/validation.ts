import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";
import { HTTP_STATUS, ERROR_MESSAGES } from "../../shared/config";

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    
    if(!errors.isEmpty()) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: { message: ERROR_MESSAGES.VALIDATION_ERROR, statusCode: HTTP_STATUS.BAD_REQUEST, details: errors.array() },
        });

        return;
    }
    
    next();
};

export const validate = (validations: ValidationChain[]) => {
    return async(req: Request, res: Response, next: NextFunction) => {
        await Promise.all(validations.map(validation => validation.run(req)));
        validateRequest(req, res, next);
    };
};