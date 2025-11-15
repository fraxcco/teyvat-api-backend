import mongoose, { Schema } from "mongoose";
import type { IApiKey } from "../../interfaces/user/IApiKey";

const ApiKeySchema = new Schema<IApiKey>({
    key: { type: String, required: true, unique: true },
    label: { type: String, trim: true, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
}, {
    versionKey: false
});

export default mongoose.model<IApiKey>("ApiKey", ApiKeySchema);