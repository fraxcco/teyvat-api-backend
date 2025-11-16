import request from "supertest";
import app from "../src/app";
import User from "../src/components/models/user/User";
import Artifact from "../src/components/models/media/Artifact";
import Character from "../src/components/models/media/Character";
import { setupTestDatabase, teardownTestDatabase } from "../src/shared/config/database";
import { createAdminAccount } from "./utils/auth";
import { buildArtifactPayload } from "./utils/payloads";
import { createArtifact as createArtifactApi } from "./utils/api";
import { createApiKey } from "./utils/auth";

describe("Artifact Test", () => {
    let adminToken: string;
    let apiKey: string;

    beforeAll(async () => {
        await setupTestDatabase([User, Artifact, Character]);

        const admin = await createAdminAccount("artifacts");
        adminToken = admin.accessToken;
        apiKey = await createApiKey(adminToken, "art_test_key");
    });

    afterAll(async () => {
        await teardownTestDatabase([User, Artifact, Character]);
    });

    test("list initially empty", async () => {
        const res = await request(app)
            .get("/v1/artifacts")
            .set("X-API-Key", apiKey);
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
    });

    test("create artifact requires auth", async () => {
        const res = await request(app).post("/v1/artifacts").send({});
        expect(res.status).toBe(401);
    });

    test("admin creates artifact", async () => {
        const res = await createArtifactApi(
            apiKey,
            adminToken,
            buildArtifactPayload({
                id: "crimson_witch_of_flames",
                name: "Crimson Witch of Flames",
                setBonus: {
                    twoPiece: "Pyro DMG Bonus +15%",
                    fourPiece: "Overloaded/Burning/Burgeon +40%",
                },
            })
        );

        expect(res.status).toBe(201);
    });
    
    test("duplicate artifact creation returns 409", async () => {
        const res = await createArtifactApi(
            apiKey,
            adminToken,
            buildArtifactPayload({ id: "crimson_witch_of_flames" })
        );

        expect(res.status).toBe(409);
    });

    test("list returns IDs and pagination", async () => {
        const res = await request(app)
            .get("/v1/artifacts?region=Mondstadt&limit=10")
            .set("X-API-Key", apiKey);
        expect(res.status).toBe(200);
        expect(res.body.data).toContain("crimson_witch_of_flames");
        expect(res.body.pagination.total).toBeGreaterThanOrEqual(1);
    });

    test("fetch details by id", async () => {
        const res = await request(app)
            .get("/v1/artifacts/crimson_witch_of_flames")
            .set("X-API-Key", apiKey);
        expect(res.status).toBe(200);
        expect(res.body.data.name).toBe("Crimson Witch of Flames");
    });

    test("update artifact works", async () => {
        const res = await request(app)
            .put("/v1/artifacts/crimson_witch_of_flames")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ region: "Liyue" });

        expect(res.status).toBe(200);
        expect(res.body.data.region).toBe("Liyue");
    });

    test("delete artifact", async () => {
        const res = await request(app)
            .delete("/v1/artifacts/crimson_witch_of_flames")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(204);

        const lookup = await request(app)
            .get("/v1/artifacts/crimson_witch_of_flames")
            .set("X-API-Key", apiKey);
        expect(lookup.status).toBe(404);
    });
});