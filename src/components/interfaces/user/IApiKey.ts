import mongoose, { Document } from "mongoose";

export interface IApiKey extends Document {
    key: string;
    label: string;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
};