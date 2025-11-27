import routes from "./infrastructure/routes";
import { createServer } from "./shared/config/";
import { requestLogger, errorHandler, notFoundHandler } from "./infrastructure/middleware";
const app = createServer();

app.use(routes);
app.use(notFoundHandler);
app.use(requestLogger);
app.use(errorHandler);

export default app;