import { Document } from "mongoose";

export interface IApiKey extends Partial<Document> {
    key: string;
    label: string;
    userId: string;
    createdAt: Date;
}