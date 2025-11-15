import request from "supertest";
import app from "../src/app";
import User from "../src/components/models/user/User";
import { setupTestDatabase, teardownTestDatabase } from "../src/shared/config/database";

describe("Authentication Test", () => {
    let accessToken: string;
    let refreshToken: string;
    let userId: string;

    beforeAll(async () => {
        await setupTestDatabase([User]);
    });

    afterAll(async () => {
        await teardownTestDatabase([User]);
    });

    test("register issues tokens and stores lowercase role", async () => {
        const res = await request(app).post("/api/v1/auth/register").send({
            username: "adminUser",
            email: "admin@example.com",
            password: "Password123",
            role: "ADMIN",
        });

        expect(res.status).toBe(201);
        expect(res.body.data.user.role).toBe("admin");
        expect(res.body.data.accessToken).toBeDefined();
        expect(res.body.data.refreshToken).toBeDefined();

        accessToken = res.body.data.accessToken;
        refreshToken = res.body.data.refreshToken;
        userId = res.body.data.user.id;
    });

    test("duplicate register fails with 409", async () => {
        const res = await request(app).post("/api/v1/auth/register").send({
            username: "adminUser",
            email: "admin@example.com",
            password: "Password123",
        });

        expect(res.status).toBe(409);
    });

    test("login succeeds and returns fresh tokens", async () => {
        const res = await request(app).post("/api/v1/auth/login").send({
            email: "admin@example.com",
            password: "Password123",
        });

        expect(res.status).toBe(200);
        accessToken = res.body.data.accessToken;
        refreshToken = res.body.data.refreshToken;
    });

    test("login with wrong password returns 401", async () => {
        const res = await request(app).post("/api/v1/auth/login").send({
            email: "admin@example.com",
            password: "WrongPass",
        });

        expect(res.status).toBe(401);
    });

    test("profile without token returns 401", async () => {
        const res = await request(app).get("/api/v1/users/me");
        expect(res.status).toBe(401);
    });

    test("profile with token returns user info", async () => {
        const res = await request(app)
            .get("/api/v1/users/me")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe(userId);
    });

    test("change password fails with wrong current password", async () => {
        const res = await request(app)
            .put("/api/v1/auth/change-password")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ currentPassword: "WrongPass", newPassword: "NewPassword123" });

        expect(res.status).toBe(400);
    });

    test("change password succeeds and invalidates old password", async () => {
        const change = await request(app)
            .put("/api/v1/auth/change-password")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ currentPassword: "Password123", newPassword: "NewPassword123" });

        expect(change.status).toBe(200);

        const relog = await request(app).post("/api/v1/auth/login").send({
            email: "admin@example.com",
            password: "NewPassword123",
        });

        expect(relog.status).toBe(200);
        accessToken = relog.body.data.accessToken;
        refreshToken = relog.body.data.refreshToken;
    });

    test("refresh without token returns 401", async () => {
        const res = await request(app).post("/api/v1/auth/refresh").send({});
        expect(res.status).toBe(401);
    });

    test("refresh rotates tokens and rejects reuse", async () => {
        const res = await request(app).post("/api/v1/auth/refresh").send({ refreshToken });
        expect(res.status).toBe(200);

        const reused = await request(app).post("/api/v1/auth/refresh").send({ refreshToken });
        expect(reused.status).toBe(401);

        refreshToken = res.body.data.refreshToken;
        accessToken = res.body.data.accessToken;
    });

    test("logout revokes refresh token", async () => {
        const logout = await request(app).post("/api/v1/auth/logout").send({ refreshToken });
        expect(logout.status).toBe(200);

        const afterLogout = await request(app).post("/api/v1/auth/refresh").send({ refreshToken });
        expect(afterLogout.status).toBe(401);
    });
});