import request from "supertest";
import app from "../src/app";
import User from "../src/components/models/user/User";
import { setupTestDatabase, teardownTestDatabase } from "../src/shared/config/database";
import { createAdminAccount, createUserAccount, createApiKey } from "./utils/auth";

describe("Security Test", () => {
    let userToken: string;
    let adminToken: string;
    let apiKey: string;

    beforeAll(async () => {
        await setupTestDatabase([User]);

        const user = await createUserAccount("security_user");
        userToken = user.accessToken;

        const admin = await createAdminAccount("security_admin");
        adminToken = admin.accessToken;

        apiKey = await createApiKey(adminToken, "security_key");
    });

    afterAll(async () => {
        await teardownTestDatabase([User]);
    });

    test("invalid Authorization header yields 401", async () => {
        const res = await request(app)
            .get("/api/v1/users/me")
            .set("Authorization", "Bearer invalid-token");

        expect(res.status).toBe(401);
    });

    test("user role blocked from artifact creation", async () => {
        const res = await request(app)
            .post("/api/v1/artifacts")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                id: "guard_artifact",
                name: "Initiate",
                rarity: 3,
                versionAdded: "1.0",
                releaseDate: "2020-09-28",
                region: "Mondstadt",
                setBonus: {
                    twoPiece: "None",
                    fourPiece: "None",
                },
            });

        expect(res.status).toBe(403);
    });

    test("missing Authorization header when required returns 401", async () => {
        const res = await request(app).post("/api/v1/characters").send({
            id: "guard_character",
            name: "Guard",
        });

        expect(res.status).toBe(401);
    });

    test("admin token accepted for protected route", async () => {
        const res = await request(app)
            .get("/api/v1/users/me")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
    });

    test("public endpoint requires API key", async () => {
        const res = await request(app).get("/api/v1/artifacts");
        expect(res.status).toBe(401);
    });

    test("public endpoint accepts API key", async () => {
        const res = await request(app)
            .get("/api/v1/artifacts")
            .set("X-API-Key", apiKey);

        expect(res.status).toBe(200);
    });
});