import { Router } from "express";

export const router = Router();

router.get("/health", (_request, response) => {
    response.status(200).json({
        success: true,
        message: "MatricPay API is running",
    });
});
