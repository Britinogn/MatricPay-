"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = asyncHandler;
function asyncHandler(handler) {
    return function wrappedHandler(request, response, next) {
        Promise.resolve(handler(request, response, next)).catch(next);
    };
}
//# sourceMappingURL=async-handler.js.map