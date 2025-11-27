import mongoose, { Model } from "mongoose";
import { environment } from "./environment";
import { IUser, IArtifact, ICharacter } from "../../components/interfaces/";
type AllowedModels = Model<IUser> | Model<IArtifact> | Model<ICharacter>;

let isConnected = false;

export const databaseConfig = {
    uri: environment.MONGODB_URI,
    options: {
        minPoolSize: 0,
        maxPoolSize: environment.NODE_ENV === "test" ? 10 : 5,
        serverSelectionTimeoutMS: 3000,
        socketTimeoutMS: 45000,
        bufferCommands: true,
        retryWrites: true,
        w: "majority",
    },
} as const;

export const connectDatabase = async (): Promise<void> => {
    if(isConnected) return;

    try {
        await mongoose.connect(databaseConfig.uri, databaseConfig.options);

        const { host, name } = mongoose.connection;
        console.log(`✅ | Database connected: ${host}/${name}`);

        isConnected = true;
    } catch (error) {
        console.error(`❌ | Database connection failed: ${error}`);

        isConnected = false;
        process.exit(1);
    }
};

export const disconnectDatabase = async (): Promise<void> => {
    if(!isConnected) return;

    await mongoose.disconnect();

    isConnected = false;
};

const clearCollections = async (models: ReadonlyArray<AllowedModels>): Promise<void> => {
    if(!models?.length) return;

    await Promise.all(models.map((model) => (model as Model<unknown>).deleteMany({})))
};

export const setupTestDatabase = async (models: ReadonlyArray<AllowedModels>): Promise<void> => {
    await connectDatabase();
    await clearCollections(models);
};

export const teardownTestDatabase = async (models: ReadonlyArray<AllowedModels>): Promise<void> => {
    await clearCollections(models);
    await disconnectDatabase();
};

process.on("SIGINT", async () => {
    await disconnectDatabase();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    await disconnectDatabase();
    process.exit(0);
});