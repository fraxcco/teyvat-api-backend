import * as dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDatabase, startServer } from "./shared/config/";

(async () => {
    await connectDatabase();
    startServer(app);
})();