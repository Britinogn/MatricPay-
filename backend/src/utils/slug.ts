import crypto from "crypto";

const DEFAULT_SUFFIX_LENGTH = 6;
const DEFAULT_MAX_BASE_LENGTH = 64;

export function slugifyTitle(title: string, maxBaseLength = DEFAULT_MAX_BASE_LENGTH): string {
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

export function generateSlugSuffix(length = DEFAULT_SUFFIX_LENGTH): string {
  const bytesNeeded = Math.ceil(length * 0.75);

  return crypto
    .randomBytes(bytesNeeded)
    .toString("base64url")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase()
    .slice(0, length);
}

export function generateCampaignSlug(title: string): string {
  return `${slugifyTitle(title)}-${generateSlugSuffix()}`;
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
