import crypto from "crypto";
import { FilterQuery } from "mongoose";
import { removeMongoID } from "../../../shared/utils";
import { IApiKey } from "../../../components/interfaces";
import ApiKey from "../../../components/models/user/ApiKey";

export class ApiKeyService {
    public async createApiKey(userId: string, label: string) {
        const key = crypto.randomBytes(32).toString("hex");
        const apiKey = await ApiKey.create({ key, userId, label });

        return apiKey;
    }

    public async listApiKeys(userId: string) {
        const keys = await ApiKey.find({ userId }).select("key label createdAt").lean();

        return removeMongoID(keys);
    }

    public async deleteApiKeyByQuery(query: FilterQuery<IApiKey>) {
        return ApiKey.deleteOne(query);
    }
}