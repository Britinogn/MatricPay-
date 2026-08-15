import { Router } from "express";
import { adminRoutes } from "./admin.routes";
import { authRoutes } from "./auth.routes";
import { campaignRoutes } from "./campaign.routes";
import { dashboardRoutes } from "./dashboard.routes";
import { paymentRoutes } from "./payment.routes";
import { studentRoutes } from "./student.routes";

export const router = Router();

router.get("/health", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "MatricPay API is running",
  });
});

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/organizer", dashboardRoutes);
router.use("/campaigns", dashboardRoutes);
router.use("/campaigns", studentRoutes);
router.use("/campaigns", campaignRoutes);
router.use("/", paymentRoutes);
