"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const admin_routes_1 = require("./admin.routes");
const auth_routes_1 = require("./auth.routes");
const campaign_routes_1 = require("./campaign.routes");
const dashboard_routes_1 = require("./dashboard.routes");
const payment_routes_1 = require("./payment.routes");
const student_routes_1 = require("./student.routes");
exports.router = (0, express_1.Router)();
exports.router.get("/health", (_request, response) => {
    response.status(200).json({
        success: true,
        message: "MatricPay API is running",
    });
});
exports.router.use("/auth", auth_routes_1.authRoutes);
exports.router.use("/admin", admin_routes_1.adminRoutes);
exports.router.use("/organizer", dashboard_routes_1.dashboardRoutes);
exports.router.use("/campaigns", dashboard_routes_1.dashboardRoutes);
exports.router.use("/campaigns", student_routes_1.studentRoutes);
exports.router.use("/campaigns", campaign_routes_1.campaignRoutes);
exports.router.use("/", payment_routes_1.paymentRoutes);
//# sourceMappingURL=index.js.map