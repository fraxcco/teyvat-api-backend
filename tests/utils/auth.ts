import request from "supertest";
import app from "../../src/app";

interface RegisterOptions {
    email: string;
    username: string;
    password?: string;
    role?: string;
};

interface AuthAccount {
    accessToken: string;
    refreshToken: string;
    userId: string;
};

const extractTokens = (payload: any): AuthAccount => {
    const data = payload?.data ?? {};
    const tokens = data?.tokens ?? {};

    const accessToken =
        typeof data.accessToken === "string" && data.accessToken
            ? data.accessToken
            : typeof tokens.accessToken === "string"
                ? tokens.accessToken
                : "";

    const refreshToken =
        typeof data.refreshToken === "string" && data.refreshToken
            ? data.refreshToken
            : typeof tokens.refreshToken === "string"
                ? tokens.refreshToken
                : "";

    const user = data.user ?? data.profile ?? {};
    const userId =
        typeof user._id === "string" && user._id
            ? user._id
            : typeof user.id === "string"
                ? user.id
                : "";

    return { accessToken, refreshToken, userId };
};

export const registerAccount = async ({username, email, password = "Password123!", role}: RegisterOptions): Promise<AuthAccount> => {
    const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
            email,
            username,
            password,
            role,
        });

    if(response.status >= 400) {
        throw new Error(`Failed to register ${username}: ${response.status} ${response.text}`);
    };

    return extractTokens(response.body);
};

const MAX_USERNAME_LENGTH = 30;

const slugifyScenario = (scenario: string): string =>
    scenario.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "tester";

const buildUsername = (prefix: string, scenario: string): string => {
    const slug = prefix + "_" + slugifyScenario(scenario);
    
    if(slug.length <= MAX_USERNAME_LENGTH) {
        return slug;
    };

    const suffix = Math.random().toString(36).slice(-3);
    const trimmed = slug.slice(0, Math.max(1, MAX_USERNAME_LENGTH - suffix.length));
    return trimmed + suffix;
};

export const createAdminAccount = async (scenario: string) => {
    const username = buildUsername("admin", scenario);
    const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
            email: `admin_${scenario}@example.com`,
            username,
            password: "Password123!",
            role: "admin",
        });

    if(response.status >= 400) {
        throw new Error(`Failed to register ${username}: ${response.status} ${response.text}`);
    };

    return extractTokens(response.body);
};

export const createUserAccount = async (scenario: string) => {
    const username = buildUsername("user", scenario);
    const response = await request(app)
        .post("/api/v1/auth/register")
        .send({
            email: `user_${scenario}@example.com`,
            username,
            password: "Password123!",
        });

    if(response.status >= 400) {
        throw new Error(`Failed to register ${username}: ${response.status} ${response.text}`);
    };

    return extractTokens(response.body);
};

export const createApiKey = async (token: string, label?: string): Promise<string> => {
    const response = await request(app)
        .post("/api/v1/auth/apikeys")
        .set("Authorization", `Bearer ${token}`)
        .send({ label });

    if(response.status >= 400) {
        throw new Error(`Failed to create API key: ${response.status} ${response.text}`);
    };

    return response.body.data.key;
};