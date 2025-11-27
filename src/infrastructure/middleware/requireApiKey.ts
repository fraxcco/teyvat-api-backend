import { HTTP_STATUS } from "../../shared/config";
import { Response, NextFunction } from "express";
import { ApiKeyRequest } from "../../components/interfaces/index";
import ApiKey from "../../components/models/user/ApiKey";

export async function requireApiKey(req: ApiKeyRequest, res: Response, next: NextFunction) {
    const apiKey = req.header("x-api-key");
    
    if(!apiKey) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { message: "API key required" } });
    }

    const keyDoc = await ApiKey.findOne({ key: apiKey });
    
    if(!keyDoc) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: { message: "Invalid API key" } });
    }
    
    req.apiKeyUserId = keyDoc.userId;
    next();
}