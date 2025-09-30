import { BaseEmailTemplate } from './base-template';

interface MagicLinkProps {
  magicLinkUrl: string;
  userEmail: string;
  isNewUser?: boolean;
}

export function MagicLinkEmail({ magicLinkUrl, userEmail, isNewUser = false }: MagicLinkProps) {
  const firstName = userEmail.split('@')[0];
  
  return (
    <BaseEmailTemplate 
      preheader="Your secure login link for SuburbMates - no password required"
    >
      <div className="text-center">
        <h1>{isNewUser ? 'Welcome to SuburbMates! ✨' : 'Welcome Back! 👋'}</h1>
        <p>
          Hi {firstName}, {isNewUser ? "let's get your business profile set up" : "ready to continue building your business presence"}?
        </p>
      </div>

      <div className="text-center">
        <h2>🔗 Secure Login Link</h2>
        <p>
          Click the button below to {isNewUser ? 'get started' : 'log in'} without entering a password:
        </p>
        
        <a href={magicLinkUrl} className="button">
          {isNewUser ? '🚀 Get Started' : '🔑 Log In Securely'}
        </a>
        
        <p className="text-sm" style={{ color: '#64748b', marginTop: '16px' }}>
          This link will expire in 1 hour and can only be used once.
        </p>
      </div>

      {isNewUser && (
        <div className="highlight">
          <h2>🎯 Ready to generate more leads?</h2>
          <p style={{ margin: '0', color: '#92400e' }}>
            <strong>SuburbMates helps Melbourne businesses:</strong> Create professional profiles, 
            connect with local customers, and share their services across social media.
          </p>
        </div>
      )}

      <div style={{ marginTop: '40px' }}>
        <h2>{isNewUser ? "What's next?" : "Quick reminders:"}</h2>
        {isNewUser ? (
          <ol style={{ paddingLeft: '20px', color: '#475569' }}>
            <li><strong>Click the login link</strong> above to access your account</li>
            <li><strong>Complete your business profile</strong> with details and photos</li>
            <li><strong>Choose a professional theme</strong> that matches your brand</li>
            <li><strong>Share your profile</strong> and start receiving leads!</li>
          </ol>
        ) : (
          <ul style={{ paddingLeft: '20px', color: '#475569' }}>
            <li><strong>Update your profile</strong> with fresh content and photos</li>
            <li><strong>Check your lead notifications</strong> and respond to inquiries</li>
            <li><strong>Share your profile</strong> on social media for more visibility</li>
            <li><strong>Review your analytics</strong> to see how your profile is performing</li>
          </ul>
        )}
      </div>

      <div style={{ 
        backgroundColor: '#f0f9ff', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #0ea5e9',
        margin: '32px 0'
      }}>
        <h2 style={{ color: '#0ea5e9', marginTop: '0' }}>
          💡 Pro Tip: Bookmark Your Dashboard
        </h2>
        <p style={{ margin: '0' }}>
          After logging in, bookmark your dashboard page for quick access. 
          You can always use magic links when you need a fresh login!
        </p>
      </div>

      <div style={{ 
        backgroundColor: '#fef2f2', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #ef4444',
        margin: '32px 0'
      }}>
        <h2 style={{ color: '#dc2626', marginTop: '0' }}>
          🔒 Security Notice
        </h2>
        <p style={{ margin: '0' }}>
          This login link was requested for: <strong>{userEmail}</strong><br />
          If you didn't request this, please ignore this email and your account will remain secure.
        </p>
      </div>

      <div className="text-center" style={{ marginTop: '40px' }}>
        <p>
          <strong>Need help with your profile?</strong><br />
          Our Melbourne-based team is here to support local businesses.
        </p>
        <p>
          <a href="mailto:support@suburbmates.com.au" style={{ color: '#1e40af' }}>
            📧 Email Support
          </a> | 
          <a href="https://suburbmates.com.au/help" style={{ color: '#1e40af', marginLeft: '8px' }}>
            📚 Help Center
          </a> | 
          <a href="https://suburbmates.com.au/examples" style={{ color: '#1e40af', marginLeft: '8px' }}>
            🎨 Profile Examples
          </a>
        </p>
      </div>

      <div className="divider" />

      <div className="text-center">
        <p className="text-sm" style={{ color: '#64748b' }}>
          <strong>Login Details:</strong><br />
          Email: {userEmail}<br />
          Requested: {new Date().toLocaleString('en-AU', { 
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
          <a href={magicLinkUrl} style={{ color: '#1e40af', wordBreak: 'break-all' }}>
            {magicLinkUrl}
          </a>
        </p>
      </div>
    </BaseEmailTemplate>
  );
}