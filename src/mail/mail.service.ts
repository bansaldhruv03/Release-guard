import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.initTransporter();
  }

  private async initTransporter() {
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    const host = this.config.get<string>('SMTP_HOST') || 'smtp-relay.brevo.com';
    const port = parseInt(this.config.get<string>('SMTP_PORT') || '587');

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: false,
        auth: { user, pass },
      });
      this.logger.log(`Mail transporter initialized with SMTP host: ${host}`);
    } else {
      this.logger.warn('No SMTP credentials found. Creating an Ethereal test account for local development...');
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      // Store the ethereal user to use as 'from' address
      this.testEmailAccount = testAccount.user;
    }
  }

  private testEmailAccount?: string;

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    // Wait for the transporter to be ready if it's still generating the test account
    while (!this.transporter) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const from = this.config.get<string>('SMTP_FROM') || 'releaseguard189@gmail.com';
    const mailOptions = {
      from: `"Release Guard" <${from}>`,
      to,
      subject: 'Reset your Release Guard password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 12px;">
          <h1 style="color: #38bdf8; margin-bottom: 8px;">🛡️ Release Guard</h1>
          <h2 style="margin-top: 0;">Password Reset Request</h2>
          <p style="color: #94a3b8;">You requested to reset your password. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
          <a href="${resetUrl}" style="display: inline-block; margin: 24px 0; padding: 14px 28px; background: linear-gradient(135deg, #38bdf8, #a78bfa); color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Reset My Password
          </a>
          <p style="color: #64748b; font-size: 12px;">If you did not request this, you can safely ignore this email. Your password will not change.</p>
          <hr style="border-color: #1e293b; margin: 24px 0;">
          <p style="color: #475569; font-size: 12px;">© 2026 Release Guard · Securing your pipelines</p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${to}`);
      
      if (!this.config.get<string>('SMTP_USER')) {
        this.logger.log(`[TESTING] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}`, error);
      throw error;
    }
  }
}
