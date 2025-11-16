import request from "supertest";
import app from "../src/app";
import User from "../src/components/models/user/User";
import Character from "../src/components/models/media/Character";
import Artifact from "../src/components/models/media/Artifact";
import { setupTestDatabase, teardownTestDatabase } from "../src/shared/config/database";
import { createAdminAccount, createUserAccount } from "./utils/auth";
import { buildCharacterPayload } from "./utils/payloads";
import { createCharacter as createCharacterApi } from "./utils/api";
import { createApiKey } from "./utils/auth";

describe("Character Test", () => {
    let adminToken: string;
    let userToken: string;
    let apiKey: string;

    beforeAll(async () => {
        await setupTestDatabase([User, Character, Artifact]);

        const admin = await createAdminAccount("characters");
        adminToken = admin.accessToken;

        const user = await createUserAccount("characters");
        userToken = user.accessToken;

        apiKey = await createApiKey(adminToken, "char_test_key");
    });

    afterAll(async () => {
        await teardownTestDatabase([User, Character, Artifact]);
    });

    test("initial list is empty", async () => {
        const res = await request(app)
            .get("/v1/characters")
            .set("X-API-Key", apiKey);
        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
    });

    test("creation without token returns 401", async () => {
        const res = await request(app).post("/v1/characters").send({});
        expect(res.status).toBe(401);
    });

    test("creation with user role returns 403", async () => {
        const res = await request(app)
            .post("/v1/characters")
            .set("Authorization", `Bearer ${userToken}`)
            .send({ id: "amber", name: "Amber" });

        expect(res.status).toBe(403);
    });

    test("admin creates character", async () => {
        const res = await createCharacterApi(
            apiKey,
            adminToken,
            buildCharacterPayload({
                id: "diluc",
                name: "Diluc",
                rarity: 5,
                region: "Mondstadt",
                element: "Pyro",
                weaponType: "Claymore",
                description: "Owner of Dawn Winery.",
                versionAdded: "1.0",
                releaseDate: "2020-09-28",
                constellations: [{ level: 1, name: "Conviction", description: "extra DMG" }],
                stats: {
                    baseHP: 1000,
                    baseATK: 26,
                    baseDEF: 60,
                    ascensionStats: {
                        hpPercentage: 0.1,
                        attackPercentage: 0.1,
                        defensePercentage: 0.1,
                        elementalMastery: 0,
                        energyRecharge: 0,
                        healingBonus: 0,
                        critRate: 0.05,
                        critDMG: 0.5,
                        bonusDMG: 0.2,
                    },
                },
                talents: {
                    normalAttack: { name: "Tempered Sword", description: "four strikes" },
                    chargedAttack: { name: "Searing Onslaught", description: "heavy slash" },
                    plungingAttack: { name: "Plunging Attack", description: "plunge from mid-air" },
                    elementSkill: { name: "Searing Onslaught", description: "Pyro slash", energyCost: 0, duration: 0, cooldown: 10 },
                    elementalBurst: { name: "Dawn", description: "Flame phoenix", energyCost: 40, duration: 0, cooldown: 12 },
                },
            })
        );

        expect(res.status).toBe(201);
    });

    test("duplicate creation returns 409", async () => {
        const res = await createCharacterApi(
            apiKey,
            adminToken,
            buildCharacterPayload({
                id: "diluc",
                name: "Diluc 2",
            })
        );

        expect(res.status).toBe(409);
    });

    test("list supports filters and pagination metadata", async () => {
        const res = await request(app)
            .get("/v1/characters?region=Mondstadt&element=Pyro&limit=5")
            .set("X-API-Key", apiKey);

        expect(res.status).toBe(200);
        expect(res.body.pagination.total).toBeGreaterThanOrEqual(1);
        expect(res.body.data.some((c: any) => c === "diluc")).toBe(true);
    });

    test("get by id works", async () => {
        const res = await request(app)
            .get("/v1/characters/diluc")
            .set("X-API-Key", apiKey);
        expect(res.status).toBe(200);
        expect(res.body.data.name).toBe("Diluc");
    });

    test("nonexistent character returns 404", async () => {
        const res = await request(app)
            .get("/v1/characters/nonexistent")
            .set("X-API-Key", apiKey);
        expect(res.status).toBe(404);
    });

    test("update requires admin and applies changes", async () => {
        const res = await request(app)
            .put("/v1/characters/diluc")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ region: "Liyue" });

        expect(res.status).toBe(200);
        expect(res.body.data.region).toBe("Liyue");
    });

    test("delete removes record", async () => {
        const res = await request(app)
            .delete("/v1/characters/diluc")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.status).toBe(204);

        const lookup = await request(app)
            .get("/v1/characters/diluc")
            .set("X-API-Key", apiKey);
        expect(lookup.status).toBe(404);
    });
});