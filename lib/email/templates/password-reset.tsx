import { BaseEmailTemplate } from './base-template';

interface PasswordResetProps {
  resetUrl: string;
  userEmail: string;
}

export function PasswordResetEmail({ resetUrl, userEmail }: PasswordResetProps) {
  const firstName = userEmail.split('@')[0];
  
  return (
    <BaseEmailTemplate 
      preheader="Reset your SuburbMates password securely and regain access to your account"
    >
      <div className="text-center">
        <h1>Reset Your Password 🔐</h1>
        <p>
          Hi {firstName}, we received a request to reset your SuburbMates password.
        </p>
      </div>

      <div className="text-center">
        <h2>Secure Password Reset</h2>
        <p>
          Click the button below to create a new password for your account:
        </p>
        
        <a href={resetUrl} className="button">
          🔑 Reset My Password
        </a>
        
        <p className="text-sm" style={{ color: '#64748b', marginTop: '16px' }}>
          This link will expire in 1 hour for security reasons.
        </p>
      </div>

      <div className="highlight">
        <h2>🛡️ Security Notice</h2>
        <p style={{ margin: '0', color: '#92400e' }}>
          For your security, this password reset link can only be used once. 
          If you need another reset link, you'll need to request it again.
        </p>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h2>What happens next?</h2>
        <ol style={{ paddingLeft: '20px', color: '#475569' }}>
          <li><strong>Click the reset button</strong> above to access the secure reset form</li>
          <li><strong>Create a new password</strong> that's strong and unique</li>
          <li><strong>Log in with your new password</strong> and access your business profile</li>
          <li><strong>Continue managing</strong> your SuburbMates presence</li>
        </ol>
      </div>

      <div style={{ 
        backgroundColor: '#fef2f2', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #ef4444',
        margin: '32px 0'
      }}>
        <h2 style={{ color: '#dc2626', marginTop: '0' }}>
          ⚠️ Didn't request this reset?
        </h2>
        <p style={{ margin: '0' }}>
          If you didn't request a password reset, you can safely ignore this email. 
          Your account remains secure and no changes have been made.
        </p>
      </div>

      <div className="text-center" style={{ marginTop: '40px' }}>
        <p>
          <strong>Need help with your account?</strong><br />
          Our support team is here to help.
        </p>
        <p>
          <a href="mailto:support@suburbmates.com.au" style={{ color: '#1e40af' }}>
            📧 Email Support
          </a> | 
          <a href="https://suburbmates.com.au/help" style={{ color: '#1e40af', marginLeft: '8px' }}>
            📚 Help Center
          </a>
        </p>
      </div>

      <div className="divider" />

      <div className="text-center">
        <p className="text-sm" style={{ color: '#64748b' }}>
          <strong>Account Details:</strong><br />
          Email: {userEmail}<br />
          Request Time: {new Date().toLocaleString('en-AU', { 
            timeZone: 'Australia/Melbourne',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })} AEDT
        </p>
        
        <p className="text-xs" style={{ color: '#94a3b8' }}>
          Having trouble with the button? Copy and paste this link into your browser:<br />
          <a href={resetUrl} style={{ color: '#1e40af', wordBreak: 'break-all' }}>
            {resetUrl}
          </a>
        </p>
      </div>
    </BaseEmailTemplate>
  );
}