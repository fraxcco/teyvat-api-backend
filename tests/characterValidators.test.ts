import request from "supertest";
import app from "../src/app";
import User from "../src/components/models/user/User";
import Character from "../src/components/models/media/Character";
import Artifact from "../src/components/models/media/Artifact";
import { setupTestDatabase, teardownTestDatabase } from "../src/shared/config/database";
import { createAdminAccount } from "./utils/auth";
import { buildCharacterPayload } from "./utils/payloads";
import { createCharacter as createCharacterApi } from "./utils/api";
import { createApiKey } from "./utils/auth";

describe("Character Validators Test", () => {
    let adminToken = "";
    let apiKey = "";

    beforeAll(async () => {
        await setupTestDatabase([User, Character, Artifact]);

        const admin = await createAdminAccount("character_validators");
        adminToken = admin.accessToken;
        apiKey = await createApiKey(adminToken, "char_val_key");

        await createCharacterApi(
            apiKey,
            adminToken,
            buildCharacterPayload({
                id: "ALBEDO",
                name: "Albedo",
                rarity: 5,
                region: "Mondstadt",
                element: "Geo",
                weaponType: "Sword",
                versionAdded: "1.2",
                releaseDate: "2020-12-23",
                description: "Chief Alchemist of the Knights of Favonius.",
            })
        );

        await createCharacterApi(
            apiKey,
            adminToken,
            buildCharacterPayload({
                id: "sucrose",
                name: "Sucrose",
                rarity: 4,
                region: "Mondstadt",
                element: "Anemo",
                weaponType: "Catalyst",
                versionAdded: "1.0",
                releaseDate: "2020-09-28",
                description: "Anemo alchemist seeking truth.",
            })
        );

        await createCharacterApi(
            apiKey,
            adminToken,
            buildCharacterPayload({
                id: "lisa",
                name: "Lisa",
                rarity: 4,
                region: "Mondstadt",
                element: "Electro",
                weaponType: "Catalyst",
                versionAdded: "1.0",
                releaseDate: "2020-09-28",
                description: "Librarian of the Knights of Favonius.",
            })
        );
    });

    afterAll(async () => {
        await teardownTestDatabase([User, Character, Artifact]);
    });

    test("uppercase id is normalized to lowercase", async () => {
        const res = await request(app)
            .get("/v1/characters")
            .set("X-API-Key", apiKey);
        expect(res.status).toBe(200);
        expect(res.body.data).toContain("albedo");
    });

    test("list sorted by rarity desc", async () => {
        const res = await request(app)
            .get("/v1/characters?sortBy=rarity&sortOrder=desc")
            .set("X-API-Key", apiKey);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data[0]).toBe("albedo");
        expect(res.body.data).toEqual(expect.arrayContaining(["lisa", "sucrose"]));
    });

    test("pagination returns different results by page", async () => {
        const first = await request(app)
            .get("/v1/characters?limit=1&page=1&sortBy=name&sortOrder=asc")
            .set("X-API-Key", apiKey);
        const second = await request(app)
            .get("/v1/characters?limit=1&page=2&sortBy=name&sortOrder=asc")
            .set("X-API-Key", apiKey);

        expect(first.status).toBe(200);
        expect(second.status).toBe(200);
        expect(first.body.data[0]).not.toBe(second.body.data[0]);
        expect(first.body.pagination.totalPages).toBeGreaterThanOrEqual(2);
    });

    test("weaponType filter returns only matching entries", async () => {
        const res = await request(app)
            .get("/v1/characters?weaponType=Catalyst&sortBy=name")
            .set("X-API-Key", apiKey);
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(2);
        expect(new Set(res.body.data)).toEqual(new Set(["lisa", "sucrose"]));
    });

    test("name filter returns exact match", async () => {
        const res = await request(app)
            .get("/v1/characters?name=Lisa")
            .set("X-API-Key", apiKey);
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual(["lisa"]);
    });

    test("versionAdded filter returns matching entries", async () => {
        const res = await request(app)
            .get("/v1/characters?versionAdded=1.0&sortBy=name&sortOrder=asc")
            .set("X-API-Key", apiKey);
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual(["lisa", "sucrose"]);
    });

    test("releaseDate filter matches characters released that day", async () => {
        const res = await request(app)
            .get("/v1/characters?releaseDate=2020-12-23")
            .set("X-API-Key", apiKey);
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual(["albedo"]);
    });

    test("invalid sort field yields 400", async () => {
        const res = await request(app)
            .get("/v1/characters?sortBy=invalidField")
            .set("X-API-Key", apiKey);
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test("update rejects changing immutable id", async () => {
        const res = await request(app)
            .put("/v1/characters/albedo")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ id: "new-id" });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});