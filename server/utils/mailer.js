import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function sendResetEmail(toEmail, resetToken) {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  await transporter.sendMail({
    from: `"GlobeTrotter" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Reset your GlobeTrotter password",
    html: `
      <p>You requested a password reset.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>This link expires in 15 minutes. If you didn't request this, ignore this email.</p>
    `
  });
}