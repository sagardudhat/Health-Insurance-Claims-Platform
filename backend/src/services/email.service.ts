import nodemailer from 'nodemailer';

export interface EmailPayload {
  to: string;
  subject: string;
  template:
    | 'WELCOME_REGISTER'
    | 'CLAIM_SUBMITTED'
    | 'STATUS_UPDATED'
    | 'REVISION_REQUESTED'
    | 'PAYMENT_DISBURSED';
  data: {
    claimId?: string;
    patientName?: string;
    status?: string;
    amount?: number;
    reviewerNotes?: string;
    recipientName?: string;
    userEmail?: string;
    role?: string;
  };
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) return this.transporter;

    // 1. If custom SMTP configured in .env, use real production SMTP server
    const smtpHost = process.env.SMTP_HOST?.trim();
    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPass = process.env.SMTP_PASS?.trim();

    if (smtpHost && smtpUser && smtpPass) {
      try {
        this.transporter = nodemailer.createTransport({
          host: smtpHost,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });
        console.log(`📧 [Email Engine] Connected to custom SMTP server (${smtpHost})`);
        return this.transporter;
      } catch (err) {
        console.warn(
          `📧 [Email Engine Warning] Failed to connect to custom SMTP (${smtpHost}), falling back:`,
          err
        );
      }
    }

    console.log(
      '📧 [Email Engine] No custom SMTP credentials provided in .env. Initializing local Ethereal test transport...'
    );

    // 2. Fallback for testing: Generate Ethereal Email test SMTP account
    try {
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
      console.log(`📧 [Email Engine] Test Ethereal SMTP Initialized (User: ${testAccount.user})`);
    } catch (err) {
      console.warn(
        '📧 [Email Engine Warning] Failed to initialize Ethereal SMTP, using json transport fallback:',
        (err as Error).message
      );
      this.transporter = nodemailer.createTransport({ jsonTransport: true });
    }

    return this.transporter;
  }

  /**
   * Dispatches an email notification (renders HTML & text bodies and sends via Nodemailer)
   */
  async sendClaimStatusEmail(payload: EmailPayload): Promise<boolean> {
    try {
      const transporter = await this.getTransporter();
      const { to, subject, template, data } = payload;

      const htmlBody = this.renderHtmlTemplate(template, data);
      const textBody = this.renderTextTemplate(template, data);

      const fromAddress =
        process.env.EMAIL_FROM || '"ClaimCare Health" <no-reply@claimcare.health>';

      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        text: textBody,
        html: htmlBody,
      });

      console.log('\n==================================================');
      console.log(`📧 [EMAIL SENT SUCCESS] MessageId: ${info.messageId}`);
      console.log(`📌 To: ${to}`);
      console.log(`🏷️ Subject: ${subject}`);
      console.log(`📄 Template: ${template}`);

      // If Ethereal test transport, print instant preview URL!
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`🔗 [PREVIEW SENT EMAIL IN BROWSER]: ${previewUrl}`);
      }
      console.log('==================================================\n');

      return true;
    } catch (error) {
      console.error('❌ [Email Dispatch Failed]:', error);
      return false;
    }
  }

  private renderTextTemplate(
    template: EmailPayload['template'],
    data: EmailPayload['data']
  ): string {
    const claimRef = data.claimId ? `#${data.claimId.slice(-6).toUpperCase()}` : '';

    switch (template) {
      case 'WELCOME_REGISTER':
        return `Hello ${data.recipientName || 'User'},\n\nWelcome to ClaimCare Health Insurance Claims Platform! Your account has been registered successfully as a [${(data.role || 'user').toUpperCase()}].\n\nYou can now log in and access your portal dashboard.`;

      case 'CLAIM_SUBMITTED':
        return `Dear ${data.recipientName || 'Reviewer'},\n\nA new claim ${claimRef} has been submitted for Patient ${data.patientName}. Total claimed: $${data.amount?.toFixed(2)}.\n\nPlease log in to your review queue to adjudicate this claim.`;

      case 'STATUS_UPDATED':
        return `Dear ${data.recipientName || 'Healthcare Provider'},\n\nYour claim ${claimRef} for Patient ${data.patientName} status has been updated to: [${data.status}].\n${data.reviewerNotes ? `Reviewer Notes: "${data.reviewerNotes}"` : ''}\n\nLog in to ClaimCare to view full details and Explanation of Benefits (EOB).`;

      case 'REVISION_REQUESTED':
        return `Dear ${data.recipientName || 'Healthcare Provider'},\n\nClaim ${claimRef} requires clarification before processing.\n\nRequested Revisions: "${data.reviewerNotes}"\n\nPlease update and resubmit the claim at your earliest convenience.`;

      case 'PAYMENT_DISBURSED':
        return `Dear ${data.recipientName || 'Healthcare Provider'},\n\nPayment of $${data.amount?.toFixed(2)} for Claim ${claimRef} has been executed.\n\nRemittance advice EDI 835 has been generated for your record.`;

      default:
        return `Notification update for ${data.recipientName || 'User'}.`;
    }
  }

  private renderHtmlTemplate(
    template: EmailPayload['template'],
    data: EmailPayload['data']
  ): string {
    const textContent = this.renderTextTemplate(template, data).replace(/\n/g, '<br/>');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            .header { background-color: #0284c7; color: #ffffff; padding: 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
            .content { padding: 32px 24px; font-size: 14px; line-height: 1.6; }
            .badge { display: inline-block; background-color: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: 9999px; font-weight: 700; font-size: 12px; margin-bottom: 16px; }
            .footer { background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>ClaimCare Health Insurance Platform</h1>
            </div>
            <div class="content">
              <span class="badge">Official Notification</span>
              <p>${textContent}</p>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} ClaimCare Inc. All rights reserved. Automated System Email.
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
