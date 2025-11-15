import request, { Response as SupertestResponse } from "supertest";
import app from "../../src/app";

export const createCharacter = (token: string, payload: Record<string, unknown>): Promise<SupertestResponse> =>
    request(app)
        .post("/api/v1/characters")
        .set("Authorization", `Bearer ${token}`)
        .send(payload);

export const createArtifact = (token: string, payload: Record<string, unknown>): Promise<SupertestResponse> =>
    request(app)
        .post("/api/v1/artifacts")
        .set("Authorization", `Bearer ${token}`)
        .send(payload);