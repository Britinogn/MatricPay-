import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: env.EMAIL_SECURE,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

const getTemplateContent = async (templateName: string): Promise<string> => {
  const templatePath = path.join(__dirname, "..", "templates", "email", templateName);
  return fs.readFile(templatePath, "utf-8");
};

export const sendWelcomeEmail = async (email: string, name: string): Promise<void> => {
  try {
    let htmlContent = await getTemplateContent("welcome.html");
    htmlContent = htmlContent.replace("{{name}}", name);

    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: email,
      subject: `Welcome to ${env.APP_NAME}`,
      html: htmlContent,
    });
  } catch (error) {
    console.error(`Failed to send welcome email to ${email}`, error);
  }
};

export const sendPasswordResetEmail = async (email: string, resetToken: string): Promise<void> => {
  try {
    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${resetToken}`;
    let htmlContent = await getTemplateContent("reset-password.html");
    htmlContent = htmlContent.replace("{{resetUrl}}", resetUrl);

    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: email,
      subject: `Reset Your Password - ${env.APP_NAME}`,
      html: htmlContent,
    });
  } catch (error) {
    console.error(`Failed to send password reset email to ${email}`, error);
  }
};
