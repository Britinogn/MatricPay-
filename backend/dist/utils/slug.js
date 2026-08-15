"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugifyTitle = slugifyTitle;
exports.generateSlugSuffix = generateSlugSuffix;
exports.generateCampaignSlug = generateCampaignSlug;
exports.isValidSlug = isValidSlug;
const crypto_1 = __importDefault(require("crypto"));
const DEFAULT_SUFFIX_LENGTH = 6;
const DEFAULT_MAX_BASE_LENGTH = 64;
function slugifyTitle(title, maxBaseLength = DEFAULT_MAX_BASE_LENGTH) {
    const slug = title
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-{2,}/g, "-")
        .slice(0, maxBaseLength)
        .replace(/-+$/g, "");
    return slug || "campaign";
}
function generateSlugSuffix(length = DEFAULT_SUFFIX_LENGTH) {
    const bytesNeeded = Math.ceil(length * 0.75);
    return crypto_1.default
        .randomBytes(bytesNeeded)
        .toString("base64url")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toLowerCase()
        .slice(0, length);
}
function generateCampaignSlug(title) {
    return `${slugifyTitle(title)}-${generateSlugSuffix()}`;
}
function isValidSlug(slug) {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
//# sourceMappingURL=slug.js.map