import mongoose, { Schema } from "mongoose";
import { IApiKey } from "../../interfaces/";

const ApiKeySchema = new Schema<IApiKey>({
    key: { type: String, required: true, unique: true },
    label: { type: String, trim: true, required: true },
    userId: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false });

export default mongoose.model<IApiKey>("ApiKey", ApiKeySchema);