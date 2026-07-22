"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendWelcomeEmail = void 0;
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
const getTemplateContent = async (templateName) => {
    const templatePath = path_1.default.join(__dirname, "..", "templates", "email", templateName);
    return promises_1.default.readFile(templatePath, "utf-8");
};
const sendWelcomeEmail = async (email, name) => {
    try {
        let htmlContent = await getTemplateContent("welcome.html");
        htmlContent = htmlContent.replace("{{name}}", name);
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
};
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendPasswordResetEmail = async (email, resetToken) => {
    try {
        const resetUrl = `${env_1.env.CLIENT_URL}/reset-password?token=${resetToken}`;
        let htmlContent = await getTemplateContent("reset-password.html");
        htmlContent = htmlContent.replace("{{resetUrl}}", resetUrl);
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
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
//# sourceMappingURL=email.js.map