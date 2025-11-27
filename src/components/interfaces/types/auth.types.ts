import { Request } from "express";

// EXTENSIONS
export interface AuthRequest extends Request {
    user: AccessPayload;
}

// INTERFACES
export interface AccessPayload {
    id: string;
    username: string;
    email: string;
    role: string;
}

export interface RefreshPayload {
    id: string;
}

export interface JwtUserLike {
    _id: string;
    username: string;
    email: string;
    role: string;
}

// API KEY
export interface ApiKeyRequest extends Request {
    apiKeyUserId?: string;
}