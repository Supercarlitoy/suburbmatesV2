import { SignupConfirmationEmail } from './signup-confirmation';
import { PasswordResetEmail } from './password-reset';
import { MagicLinkEmail } from './magic-link';

export { BaseEmailTemplate } from './base-template';
export { SignupConfirmationEmail } from './signup-confirmation';
export { PasswordResetEmail } from './password-reset';
export { MagicLinkEmail } from './magic-link';

// Email template types
export interface EmailTemplateData {
  userEmail: string;
  confirmationUrl?: string;
  resetUrl?: string;
  magicLinkUrl?: string;
  businessName?: string;
  isNewUser?: boolean;
}

// Template renderer function
export function renderEmailTemplate(
  template: 'signup-confirmation' | 'password-reset' | 'magic-link',
  data: EmailTemplateData
): string {
  let component;
  
  switch (template) {
    case 'signup-confirmation':
      if (!data.confirmationUrl) throw new Error('confirmationUrl is required for signup confirmation');
      component = SignupConfirmationEmail({
        confirmationUrl: data.confirmationUrl,
        userEmail: data.userEmail,
        businessName: data.businessName
      });
      break;
      
    case 'password-reset':
      if (!data.resetUrl) throw new Error('resetUrl is required for password reset');
      component = PasswordResetEmail({
        resetUrl: data.resetUrl,
        userEmail: data.userEmail
      });
      break;
      
    case 'magic-link':
      if (!data.magicLinkUrl) throw new Error('magicLinkUrl is required for magic link');
      component = MagicLinkEmail({
        magicLinkUrl: data.magicLinkUrl,
        userEmail: data.userEmail,
        isNewUser: data.isNewUser
      });
      break;
      
    default:
      throw new Error(`Unknown email template: ${template}`);
  }
  
  // Convert React component to HTML string
  // Note: In production, you'd use a library like @react-email/render
  // For now, this is a placeholder implementation
  return JSON.stringify(component);
}