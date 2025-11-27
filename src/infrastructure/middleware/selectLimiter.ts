import { RequestHandler } from "express";
import { generalLimiter, testLimiter } from "./rateLimiter";
import { environment } from "../../shared/config";

export const selectLimiter = (): RequestHandler => environment.NODE_ENV === "test" ? testLimiter : generalLimiter;