"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cors_middleware_1 = require("./middleware/cors.middleware");
const error_middleware_1 = require("./middleware/error.middleware");
const routes_1 = require("./routes");
exports.app = (0, express_1.default)();
exports.app.use((0, helmet_1.default)());
exports.app.use(cors_middleware_1.corsMiddleware);
exports.app.use(express_1.default.json({
    verify: (request, _response, buffer) => {
        request.rawBody = Buffer.from(buffer);
    },
}));
exports.app.use(express_1.default.urlencoded({ extended: true }));
exports.app.use((0, cookie_parser_1.default)());
exports.app.use((0, morgan_1.default)("dev"));
exports.app.use("/api", routes_1.router);
exports.app.use(error_middleware_1.notFoundMiddleware);
exports.app.use(error_middleware_1.errorMiddleware);
//# sourceMappingURL=app.js.map