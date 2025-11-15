import { HTTP_STATUS } from "../../shared/config";
import { Request, Response, NextFunction } from "express";
import ApiKey from "../../components/models/user/ApiKey";

export async function requireApiKey(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.header("x-api-key");
    
    if(!apiKey) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { message: "API key required" } });
    };

    const keyDoc = await ApiKey.findOne({ key: apiKey });
    
    if(!keyDoc) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { message: "Invalid API key" } });
    };
    
    (req as any).apiKeyUserId = keyDoc.userId;
    next();
};