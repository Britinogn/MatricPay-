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

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };

    return entities[character];
  });
}

async function getTemplateContent(templateName: string): Promise<string> {
  const templatePath = path.join(__dirname, "..", "templates", "email", templateName);
  return fs.readFile(templatePath, "utf-8");
}

function renderTemplate(template: string, variables: Record<string, string>): string {
  return Object.entries(variables).reduce((content, [key, value]) => {
    return content.replaceAll(`{{${key}}}`, escapeHtml(value));
  }, template);
}

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  try {
    const htmlContent = renderTemplate(await getTemplateContent("welcome.html"), {
      name,
    });

    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: email,
      subject: `Welcome to ${env.APP_NAME}`,
      html: htmlContent,
    });
  } catch (error) {
    console.error(`Failed to send welcome email to ${email}`, error);
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<void> {
  try {
    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;
    const htmlContent = renderTemplate(await getTemplateContent("reset-password.html"), {
      resetUrl,
    });

    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: email,
      subject: `Reset Your Password - ${env.APP_NAME}`,
      html: htmlContent,
    });
  } catch (error) {
    console.error(`Failed to send password reset email to ${email}`, error);
  }
}
