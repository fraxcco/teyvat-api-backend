import request from "supertest";
import app from "../src/app";
import User from "../src/components/models/user/User";
import { setupTestDatabase, teardownTestDatabase } from "../src/shared/config/database";
import { createAdminAccount, createUserAccount, createApiKey } from "./utils/auth";

describe("Security Validators Test", () => {
    let userToken: string = "";
    let adminToken: string = "";
    let apiKey: string = "";

    beforeAll(async () => {
        await setupTestDatabase([User]);

        const user = await createUserAccount("secValUser");
        userToken = user.accessToken;

        const admin = await createAdminAccount("secValAdmin");
        adminToken = admin.accessToken;

        apiKey = await createApiKey(adminToken, "test_key");
    });

    afterAll(async () => {
        await teardownTestDatabase([User]);
    });

    test("Missing Authorization header on protected route returns 401", async () => {
        const res = await request(app).get("/v1/users");
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    test("Authorization without Bearer prefix returns 401", async () => {
        const res = await request(app)
            .get("/v1/users/me")
            .set("Authorization", adminToken);

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    test("Authorization with empty bearer token returns 401", async () => {
        const res = await request(app)
            .get("/v1/users/me")
            .set("Authorization", "Bearer ");

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    test("user role cannot access admin-only list", async () => {
        const res = await request(app)
            .get("/v1/users")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
    });

    test("admin can access user list", async () => {
        const res = await request(app)
            .get("/v1/users")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    test("public endpoint requires API key", async () => {
        const res = await request(app).get("/v1/characters");
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    test("public endpoint accepts API key", async () => {
        const res = await request(app)
            .get("/v1/characters")
            .set("X-API-Key", apiKey);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test("OPTIONS preflight carries CORS headers", async () => {
        const res = await request(app)
            .options("/v1/characters")
            .set("Origin", "http://127.0.0.1:5500")
            .set("Access-Control-Request-Method", "GET");

        expect([200, 204]).toContain(res.status);
        expect(res.headers["access-control-allow-origin"]).toBeTruthy();
    });
});