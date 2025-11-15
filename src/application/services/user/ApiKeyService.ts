import ApiKey from "../../../components/models/user/ApiKey";
import crypto from "crypto";
import { removeMongoID } from "../../../shared/utils/mongoSanitizer";

export class ApiKeyService {
    public async createApiKey(userId: string, label: string) {
        const key = crypto.randomBytes(32).toString("hex");
        const apiKey = await ApiKey.create({ key, userId, label });

        return apiKey;
    };

    public async listApiKeys(userId: string) {
        const keys = await ApiKey.find({ userId }).select("key label createdAt").lean();

        return removeMongoID(keys);
    };

    public async deleteApiKeyByQuery(query: any) {
        return ApiKey.deleteOne(query);
    };
};