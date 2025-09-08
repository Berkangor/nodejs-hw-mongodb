import nodemailer from 'nodemailer';
import { getEnvVar } from '../utils/getEnvVar.js';

const host = getEnvVar('SMTP_HOST');
const port = Number(getEnvVar('SMTP_PORT', '587'));
const user = getEnvVar('SMTP_USER');
const pass = getEnvVar('SMTP_PASSWORD');
const from = getEnvVar('SMTP_FROM');

export const mailer = nodemailer.createTransport({
  host,
  port,
  secure: false,
  auth: { user, pass },
});

export async function sendResetMail({ to, resetLink }) {
  return await mailer.sendMail({
    from,
    to,
    subject: 'Reset your password',
    text: `Click the link to reset your password (expires in 5 minutes):\n${resetLink}`,
    html: `<p>Click the link to reset your password (expires in <b>5 minutes</b>):</p>
           <p><a href="${resetLink}" target="_blank">${resetLink}</a></p>`,
  });
}
