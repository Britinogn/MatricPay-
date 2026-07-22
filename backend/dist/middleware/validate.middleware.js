"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const zod_1 = require("zod");
const http_error_1 = require("../utils/http-error");
function validate(schemas) {
    return function validationMiddleware(request, _response, next) {
        const errors = {};
        if (schemas.body) {
            const result = schemas.body.safeParse(request.body);
            if (!result.success) {
                errors.body = zod_1.z.flattenError(result.error);
            }
            else {
                request.body = result.data;
            }
        }
        if (schemas.params) {
            const result = schemas.params.safeParse(request.params);
            if (!result.success) {
                errors.params = zod_1.z.flattenError(result.error);
            }
            else {
                request.params = result.data;
            }
        }
        if (schemas.query) {
            const result = schemas.query.safeParse(request.query);
            if (!result.success) {
                errors.query = zod_1.z.flattenError(result.error);
            }
            else {
                request.query = result.data;
            }
        }
        if (Object.keys(errors).length > 0) {
            return next(new http_error_1.HttpError(400, "Validation failed", errors));
        }
        return next();
    };
}
//# sourceMappingURL=validate.middleware.js.map