import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const appUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: 'Reset your password',
    html: `
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
    `
  });
}
