/**
 * Email Notification Service
 * Handles email notifications for claim lifecycle state changes and audit events.
 */
export interface EmailPayload {
  to: string;
  subject: string;
  template: 'CLAIM_SUBMITTED' | 'STATUS_UPDATED' | 'REVISION_REQUESTED' | 'PAYMENT_DISBURSED';
  data: {
    claimId: string;
    patientName: string;
    status: string;
    amount?: number;
    reviewerNotes?: string;
    recipientName?: string;
  };
}

export class EmailService {
  /**
   * Dispatches an email notification (formatted for production / console logger)
   */
  async sendClaimStatusEmail(payload: EmailPayload): Promise<boolean> {
    const { to, subject, template, data } = payload;

    const formattedBody = this.renderTemplate(template, data);

    console.log('\n==================================================');
    console.log(`📧 [EMAIL DISPATCHED] To: ${to}`);
    console.log(`📌 Subject: ${subject}`);
    console.log(`📄 Template: ${template}`);
    console.log('--------------------------------------------------');
    console.log(formattedBody);
    console.log('==================================================\n');

    return true;
  }

  private renderTemplate(template: EmailPayload['template'], data: EmailPayload['data']): string {
    const claimRef = `#${data.claimId.slice(-6).toUpperCase()}`;

    switch (template) {
      case 'CLAIM_SUBMITTED':
        return `Dear ${data.recipientName || 'Reviewer'},\n\nA new claim ${claimRef} has been submitted for Patient ${data.patientName}. Total claimed: $${data.amount?.toFixed(2)}.\n\nPlease log in to your review queue to adjudicate this claim.`;

      case 'STATUS_UPDATED':
        return `Dear ${data.recipientName || 'Healthcare Provider'},\n\nYour claim ${claimRef} for Patient ${data.patientName} status has been updated to: [${data.status}].\n${data.reviewerNotes ? `Reviewer Notes: "${data.reviewerNotes}"` : ''}\n\nLog in to ClaimCare to view full details and Explanation of Benefits (EOB).`;

      case 'REVISION_REQUESTED':
        return `Dear ${data.recipientName || 'Healthcare Provider'},\n\nClaim ${claimRef} requires clarification before processing.\n\nRequested Revisions: "${data.reviewerNotes}"\n\nPlease update and resubmit the claim at your earliest convenience.`;

      case 'PAYMENT_DISBURSED':
        return `Dear ${data.recipientName || 'Healthcare Provider'},\n\nPayment of $${data.amount?.toFixed(2)} for Claim ${claimRef} has been executed.\n\nRemittance advice EDI 835 has been generated for your record.`;

      default:
        return `Claim ${claimRef} notification update.`;
    }
  }
}

export const emailService = new EmailService();
