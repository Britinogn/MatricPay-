import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { campaignRoutes } from "./campaign.routes";
import { studentRoutes } from "./student.routes";

export const router = Router();

router.get("/health", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "MatricPay API is running",
  });
});

router.use("/auth", authRoutes);
router.use("/campaigns", studentRoutes);
router.use("/campaigns", campaignRoutes);
