import routes from "./infrastructure/routes";
import { createServer } from "./shared/config/";
import { errorHandler, notFoundHandler } from "./infrastructure/middleware/";
import { requestLogger } from "./infrastructure/middleware/requestLogger";
const app = createServer();

app.use(routes);
app.use(notFoundHandler);
app.use(requestLogger);
app.use(errorHandler);

export default app;