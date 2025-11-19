import express, { Application } from "express";
import { environment } from "./environment";
import compression from "compression";
import helmet from "helmet";
import cors from "cors";

export const serverConfig = {
    port: environment.PORT,
    compression: {
        level: 6,
        threshold: 1024,
    },
    cors: {
        origin: environment.NODE_ENV === "production" ? environment.CORS_ORIGIN.split(",").map(o => o.trim()) : "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"] as string[],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"] as string[],
        exposedHeaders: ["X-Total-Count", "X-Page-Count"] as string[],
        credentials: true,
    },
} as const;

export const createServer = (): Application => {
    const app = express();
    app.set("trust proxy", 1);

    app.use(helmet());
    app.use(cors(serverConfig.cors));
    app.use(compression(serverConfig.compression));
    app.use(express.urlencoded({ extended: true, limit: "10mb" }));
    app.use(express.json({ limit: "10mb" }));

    return app;
};

export const startServer = (app: Application): void => {
    const server = app.listen(serverConfig.port, () => {
        console.log(`📊 | Environment: ${environment.NODE_ENV}`);
        console.log(`🚀 | Server running on port ${serverConfig.port}`);
    });

    process.on("SIGTERM", () => {
        console.log("SIGTERM received, shutting down");

        server.close(() => {
            console.log("Process terminated");
        });
    });
};