import app from "../src/app";
import { connectDatabase } from "../src/shared/config";
import { VercelRequest, VercelResponse } from "@vercel/node";
import mongoose from "mongoose";

let cachedConnection: typeof mongoose | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if(cachedConnection && mongoose.connection.readyState === 1) return app(req, res);

    await connectDatabase();
    cachedConnection = mongoose;

    return app(req, res);
};