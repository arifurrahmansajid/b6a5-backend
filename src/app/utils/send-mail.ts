import ejs from "ejs";
import status from "http-status";
import nodemailer from "nodemailer";
import path from "path";
import { getConfig } from "../config";
import type { SendMailOptions } from "../types";
import AppError from "./app-error.util";

const config = getConfig();

const transporter = nodemailer.createTransport({
  host: config.email.smtp.host,
  port: config.email.smtp.port,
  secure: config.email.smtp.secure, // true for 465, false for 587
  auth: {
    user: config.email.smtp.user,
    pass: config.email.smtp.pass,
  },
});

export const sendMail = async ({
  to,
  subject,
  templateName,
  templateData,
  attachments,
}: SendMailOptions) => {
  try {
    const templatePath = path.resolve(process.cwd(), `src/app/templates/${templateName}.ejs`);

    const html = await ejs.renderFile(templatePath, templateData);

    const info = await transporter.sendMail({
      from: config.email.from,
      to: to,
      subject: subject,
      html: html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });

    if (config.nodeEnv === "development") {
      console.log(
        `📧 [${new Date().toISOString()}] EMAIL SENT → To: ${to} | ID: ${info.messageId}`,
      );
    }
  } catch (error: any) {
    const message = error.message || "Failed to send mail";
    throw new AppError(status.INTERNAL_SERVER_ERROR, message);
  }
};
