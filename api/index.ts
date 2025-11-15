import app from "../src/app";
import { connectDatabase } from "../src/shared/config";
import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    await connectDatabase();
    return app(req, res);
};