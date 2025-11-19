import * as dotenv from "dotenv";
import { getEnv, getEnvNumber } from "../utils/envParams";
dotenv.config();

export const environment = {
    // Environment
    NODE_ENV: getEnv("NODE_ENV"),
    PORT: getEnvNumber("PORT"),

    // Database
    MONGODB_URI: getEnv("MONGODB_URI"),

    // API
    API_VERSION: getEnv("API_VERSION"),

    // Security
    JWT_SECRET: getEnv("JWT_SECRET"),
    JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN"),
    JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
    JWT_REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN"),
    BCRYPT_SALT_ROUNDS: getEnvNumber("BCRYPT_SALT_ROUNDS"),

    // CORS
    CORS_ORIGIN: getEnv("CORS_ORIGIN"),

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: getEnvNumber("RATE_LIMIT_WINDOW_MS"),
    RATE_LIMIT_MAX_REQUESTS: getEnvNumber("RATE_LIMIT_MAX_REQUESTS"),

    // Pagination
    DEFAULT_PAGE_SIZE: getEnvNumber("DEFAULT_PAGE_SIZE"),
    MAX_PAGE_SIZE: getEnvNumber("MAX_PAGE_SIZE"),
} as const;

export type Environment = typeof environment;