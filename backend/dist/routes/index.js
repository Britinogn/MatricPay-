"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const auth_routes_1 = require("./auth.routes");
exports.router = (0, express_1.Router)();
exports.router.get("/health", (_request, response) => {
    response.status(200).json({
        success: true,
        message: "MatricPay API is running",
    });
});
exports.router.use("/auth", auth_routes_1.authRoutes);
//# sourceMappingURL=index.js.map