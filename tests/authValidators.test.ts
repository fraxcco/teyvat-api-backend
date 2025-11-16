import request from "supertest";
import app from "../src/app";
import User from "../src/components/models/user/User";
import { setupTestDatabase, teardownTestDatabase } from "../src/shared/config/database";

describe("Authentication Validators Test", () => {
    let accessToken: string = "";
    let refreshToken: string = "";

    beforeAll(async () => {
        await setupTestDatabase([User]);
    });

    afterAll(async () => {
        await teardownTestDatabase([User]);
    });

    test("register rejects missing email", async () => {
        const res = await request(app).post("/v1/auth/register").send({
            username: "no-email",
            password: "Password123",
        });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test("register rejects invalid email format", async () => {
        const res = await request(app).post("/v1/auth/register").send({
            username: "bad-email",
            email: "not-an-email",
            password: "Password123",
        });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test("register rejects unsupported role", async () => {
        const res = await request(app).post("/v1/auth/register").send({
            role: "SUPERUSER",
            email: "weird-role@example.com",
            username: "weird-role",
            password: "Password123",
        });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test("successful register provides tokens", async () => {
        const res = await request(app).post("/v1/auth/register").send({
            username: "edge-admin",
            email: "edge-admin@example.com",
            password: "Password123",
            role: "ADMIN",
        });

        expect(res.status).toBe(201);
        expect(res.body.data.accessToken).toBeDefined();
        expect(res.body.data.refreshToken).toBeDefined();

        accessToken = res.body.data.accessToken;
        refreshToken = res.body.data.refreshToken;
    });

    test("login rejects malformed email", async () => {
        const res = await request(app).post("/v1/auth/login").send({
            email: "bad-email",
            password: "Password123",
        });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test("login rejects unknown email", async () => {
        const res = await request(app).post("/v1/auth/login").send({
            email: "missing@example.com",
            password: "Password123",
        });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    test("refresh rejects missing token in body", async () => {
        const res = await request(app).post("/v1/auth/refresh").send({});
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    test("refresh rejects tampered token", async () => {
        const res = await request(app).post("/v1/auth/refresh").send({
            refreshToken: `${refreshToken}tamper`,
        });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    test("profile rejects malformed Authorization header", async () => {
        const res = await request(app)
            .get("/v1/users/me")
            .set("Authorization", "Token not-bearer");

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    test("change-password rejects short new password", async () => {
        const res = await request(app)
            .put("/v1/auth/change-password")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                currentPassword: "Password123",
                newPassword: "short",
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});