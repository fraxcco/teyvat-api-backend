import type { RequestHandler } from "express";
import { environment } from "../../shared/config";
import { generalLimiter, testLimiter } from "./rateLimiter";

export const selectLimiter = (): RequestHandler => environment.NODE_ENV === "test" ? testLimiter : generalLimiter;