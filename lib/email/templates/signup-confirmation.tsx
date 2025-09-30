import { BaseEmailTemplate } from './base-template';

interface SignupConfirmationProps {
  confirmationUrl: string;
  businessName?: string;
  userEmail: string;
}

export function SignupConfirmationEmail({ 
  confirmationUrl, 
  businessName, 
  userEmail 
}: SignupConfirmationProps) {
  const firstName = userEmail.split('@')[0];
  
  return (
    <BaseEmailTemplate 
      preheader="Confirm your SuburbMates account and start building your business profile"
    >
      <div className="text-center">
        <h1>Welcome to SuburbMates! 🎉</h1>
        <p>
          Hi {firstName}, thanks for joining Melbourne's premier business community platform.
        </p>
      </div>

      <div className="highlight">
        <h2>🚀 You're one step away from:</h2>
        <ul style={{ margin: '8px 0', paddingLeft: '20px', color: '#92400e' }}>
          <li>Creating your professional business profile</li>
          <li>Connecting with Melbourne residents</li>
          <li>Generating quality leads for your business</li>
          <li>Joining our growing community of local businesses</li>
        </ul>
      </div>

      <div className="text-center">
        <h2>Confirm Your Email Address</h2>
        <p>
          Click the button below to verify your email and activate your account:
        </p>
        
        <a href={confirmationUrl} className="button">
          ✅ Confirm My Account
        </a>
        
        <p className="text-sm" style={{ color: '#64748b', marginTop: '16px' }}>
          This link will expire in 24 hours for security reasons.
        </p>
      </div>

      {businessName && (
        <div style={{ 
          backgroundColor: '#f0f9ff', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #0ea5e9',
          margin: '32px 0'
        }}>
          <h2 style={{ color: '#0ea5e9', marginTop: '0' }}>
            🏢 Ready to claim "{businessName}"?
          </h2>
          <p>
            We found an existing business listing that might be yours. After confirming your email, 
            you'll be able to claim and personalize your business profile.
          </p>
        </div>
      )}

      <div style={{ marginTop: '40px' }}>
        <h2>What happens next?</h2>
        <ol style={{ paddingLeft: '20px', color: '#475569' }}>
          <li><strong>Confirm your email</strong> by clicking the button above</li>
          <li><strong>Complete your profile setup</strong> with business details</li>
          <li><strong>Personalize your profile</strong> with themes, photos, and content</li>
          <li><strong>Share your profile</strong> across social media and start getting leads!</li>
        </ol>
      </div>

      <div className="text-center" style={{ marginTop: '40px' }}>
        <p>
          <strong>Need help getting started?</strong><br />
          Our team is here to help you succeed.
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
          If you didn't create this account, you can safely ignore this email.
        </p>
        <p className="text-xs" style={{ color: '#94a3b8' }}>
          Having trouble with the button? Copy and paste this link into your browser:<br />
          <a href={confirmationUrl} style={{ color: '#1e40af', wordBreak: 'break-all' }}>
            {confirmationUrl}
          </a>
        </p>
      </div>
    </BaseEmailTemplate>
  );
}