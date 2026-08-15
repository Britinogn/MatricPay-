"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmail = sendWelcomeEmail;
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const env_1 = require("../config/env");
const transporter = nodemailer_1.default.createTransport({
    host: env_1.env.EMAIL_HOST,
    port: env_1.env.EMAIL_PORT,
    secure: env_1.env.EMAIL_SECURE,
    auth: {
        user: env_1.env.EMAIL_USER,
        pass: env_1.env.EMAIL_PASS,
    },
});
function escapeHtml(value) {
    return value.replace(/[&<>'"]/g, (character) => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            '"': "&quot;",
        };
        return entities[character];
    });
}
async function getTemplateContent(templateName) {
    const templatePath = path_1.default.join(__dirname, "..", "templates", "email", templateName);
    return promises_1.default.readFile(templatePath, "utf-8");
}
function renderTemplate(template, variables) {
    return Object.entries(variables).reduce((content, [key, value]) => {
        return content.replaceAll(`{{${key}}}`, escapeHtml(value));
    }, template);
}
async function sendWelcomeEmail(email, name) {
    try {
        const htmlContent = renderTemplate(await getTemplateContent("welcome.html"), {
            name,
        });
        await transporter.sendMail({
            from: env_1.env.EMAIL_FROM,
            to: email,
            subject: `Welcome to ${env_1.env.APP_NAME}`,
            html: htmlContent,
        });
    }
    catch (error) {
        console.error(`Failed to send welcome email to ${email}`, error);
    }
}
async function sendPasswordResetEmail(email, resetToken) {
    try {
        const resetUrl = `${env_1.env.CLIENT_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;
        const htmlContent = renderTemplate(await getTemplateContent("reset-password.html"), {
            resetUrl,
        });
        await transporter.sendMail({
            from: env_1.env.EMAIL_FROM,
            to: email,
            subject: `Reset Your Password - ${env_1.env.APP_NAME}`,
            html: htmlContent,
        });
    }
    catch (error) {
        console.error(`Failed to send password reset email to ${email}`, error);
    }
}
//# sourceMappingURL=email.js.map