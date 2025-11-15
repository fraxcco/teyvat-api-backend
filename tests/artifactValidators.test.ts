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

describe("Artifact Validators Test", () => {
    let adminToken = "";
    let apiKey = "";

    beforeAll(async () => {
        await setupTestDatabase([User, Artifact, Character]);

        const admin = await createAdminAccount("artifact_validators");
        adminToken = admin.accessToken;
        apiKey = await createApiKey(adminToken, "art_val_key");

        await createArtifactApi(
            adminToken,
            buildArtifactPayload({
                id: "viridescent_venerer",
                name: "Viridescent Venerer",
                region: "Mondstadt",
                setBonus: {
                    twoPiece: "Anemo DMG Bonus +15%",
                    fourPiece: "Swirl DMG +60%",
                },
            })
        );

        await createArtifactApi(
            adminToken,
            buildArtifactPayload({
                id: "blizzard_strayer",
                name: "Blizzard Strayer",
                region: "Snezhnaya",
                versionAdded: "1.2",
                releaseDate: "2020-12-23",
                setBonus: {
                    twoPiece: "Cryo DMG Bonus +15%",
                    fourPiece: "Crit rate bonus vs frozen targets.",
                },
            })
        );

        await createArtifactApi(
            adminToken,
            buildArtifactPayload({
                id: "resolution_of_sojourner",
                name: "Resolution of Sojourner",
                rarity: 4,
                setBonus: {
                    twoPiece: "ATK +18%",
                    fourPiece: "Charged Attack crit rate +30%",
                },
            })
        );
    });

    afterAll(async () => {
        await teardownTestDatabase([User, Artifact, Character]);
    });

    test("list returns only ids", async () => {
        const res = await request(app)
            .get("/api/v1/artifacts")
            .set("X-API-Key", apiKey);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(typeof res.body.data[0]).toBe("string");
    });

    test("region filter narrows results", async () => {
        const res = await request(app)
            .get("/api/v1/artifacts?region=Mondstadt&sortBy=name")
            .set("X-API-Key", apiKey);
        expect(res.status).toBe(200);
        expect(new Set(res.body.data)).toEqual(new Set(["resolution_of_sojourner", "viridescent_venerer"]));
    });

    test("rarity filter returns only matching rarity", async () => {
        const res = await request(app)
            .get("/api/v1/artifacts?rarity=5&sortBy=name")
            .set("X-API-Key", apiKey);
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(2);
        expect(new Set(res.body.data)).toEqual(new Set(["blizzard_strayer", "viridescent_venerer"]));
    });

    test("sort by version ascending", async () => {
        const res = await request(app)
            .get("/api/v1/artifacts?sortBy=versionAdded&sortOrder=asc")
            .set("X-API-Key", apiKey);
        expect(res.status).toBe(200);
        expect(res.body.data[0]).toBe("resolution_of_sojourner");
    });

    test("name filter returns exact match", async () => {
        const res = await request(app)
            .get("/api/v1/artifacts?name=Blizzard Strayer")
            .set("X-API-Key", apiKey);
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual(["blizzard_strayer"]);
    });

    test("versionAdded filter returns matching artifacts", async () => {
        const res = await request(app)
            .get("/api/v1/artifacts?versionAdded=1.0&sortBy=name")
            .set("X-API-Key", apiKey);
        expect(res.status).toBe(200);
        expect(new Set(res.body.data)).toEqual(new Set(["resolution_of_sojourner", "viridescent_venerer"]));
    });

    test("releaseDate filter matches artifacts released that day", async () => {
        const res = await request(app)
            .get("/api/v1/artifacts?releaseDate=2020-12-23")
            .set("X-API-Key", apiKey);
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual(["blizzard_strayer"]);
    });

    test("invalid sort field is rejected", async () => {
        const res = await request(app)
            .get("/api/v1/artifacts?sortBy=invalidField")
            .set("X-API-Key", apiKey);
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test("details endpoint reflects stored data", async () => {
        const res = await request(app)
            .get("/api/v1/artifacts/blizzard_strayer")
            .set("X-API-Key", apiKey);
        expect(res.status).toBe(200);
        expect(res.body.data.setBonus.twoPiece).toContain("Cryo");
    });

    test("update disallows id mutation", async () => {
        const res = await request(app)
            .put("/api/v1/artifacts/viridescent_venerer")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ id: "new-id" });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});