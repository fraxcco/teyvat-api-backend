import { Document } from "mongoose";

export interface IUser extends Partial<Document> {
    _id: string;
    role: string;
    email: string;
    username: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    refreshToken?: string | null;
}