import { Document } from "mongoose";

// create a IUser interface
export interface IUser extends Document {
    _id: string;
    role: string;
    email: string;
    username: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    refreshToken?: string | null;
};