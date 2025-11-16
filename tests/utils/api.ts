import request, { Response as SupertestResponse } from "supertest";
import app from "../../src/app";

export const createCharacter = (apiKey: string, token: string, payload: Record<string, unknown>): Promise<SupertestResponse> =>
    request(app)
        .post("/v1/characters")
        .set("Authorization", `Bearer ${token}`)
        .set("x-api-key", apiKey)
        .send(payload);

export const createArtifact = (apiKey: string, token: string, payload: Record<string, unknown>): Promise<SupertestResponse> =>
    request(app)
        .post("/v1/artifacts")
        .set("Authorization", `Bearer ${token}`)
        .set("x-api-key", apiKey)
        .send(payload);

export const createAdminUser = async (username: string, email: string, password: string): Promise<any> => {
    const res = await request(app)
        .post("/v1/auth/register")
        .send({ username, email, password, role: "ADMIN" });
    return { token: res.body.data };
};