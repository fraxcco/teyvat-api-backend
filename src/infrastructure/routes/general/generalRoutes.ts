import { Router } from "express";
import { HTTP_STATUS, environment } from "../../../shared/config";

const router = Router();

router.get(`/`, (_req, res) => {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "No endpoint provided.",
        endpoints: [
            "/auth",
            "/users",
            "/artifacts",
            "/characters"
        ],
    });
});

router.get(`/health`, (_req, res) => {
    res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
            status: "OK",
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            environment: environment.NODE_ENV,
        },
    });
});

export default router;