import { ReactNode } from 'react';

interface EmailTemplateProps {
  children: ReactNode;
  preheader?: string;
}

export function BaseEmailTemplate({ children, preheader }: EmailTemplateProps) {
  return (
    <html>
      <head>
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>SuburbMates</title>
        <style dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            body, table, td, p, a, li, blockquote {
              -webkit-text-size-adjust: 100%;
              -ms-text-size-adjust: 100%;
            }
            
            table, td {
              mso-table-lspace: 0pt;
              mso-table-rspace: 0pt;
            }
            
            img {
              -ms-interpolation-mode: bicubic;
            }

            body {
              margin: 0;
              padding: 0;
              width: 100% !important;
              height: 100% !important;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background-color: #f8fafc;
            }

            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
            }

            .header {
              background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
              padding: 32px 24px;
              text-align: center;
            }

            .logo {
              color: #ffffff;
              font-size: 24px;
              font-weight: 700;
              text-decoration: none;
              display: inline-block;
              margin-bottom: 8px;
            }

            .tagline {
              color: #e0e7ff;
              font-size: 14px;
              margin: 0;
            }

            .content {
              padding: 40px 24px;
            }

            .button {
              display: inline-block;
              background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
              color: #ffffff !important;
              text-decoration: none;
              padding: 16px 32px;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              text-align: center;
              margin: 24px 0;
            }

            .button:hover {
              background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
            }

            .footer {
              background-color: #f1f5f9;
              padding: 32px 24px;
              text-align: center;
              color: #64748b;
              font-size: 14px;
              border-top: 1px solid #e2e8f0;
            }

            .footer a {
              color: #1e40af;
              text-decoration: none;
            }

            .social-links {
              margin: 24px 0;
            }

            .social-links a {
              display: inline-block;
              margin: 0 12px;
              color: #64748b;
              text-decoration: none;
            }

            .divider {
              height: 1px;
              background-color: #e2e8f0;
              margin: 32px 0;
            }

            h1 {
              color: #1e293b;
              font-size: 28px;
              font-weight: 700;
              line-height: 1.2;
              margin: 0 0 16px 0;
            }

            h2 {
              color: #334155;
              font-size: 20px;
              font-weight: 600;
              line-height: 1.3;
              margin: 32px 0 16px 0;
            }

            p {
              color: #475569;
              font-size: 16px;
              line-height: 1.6;
              margin: 0 0 16px 0;
            }

            .highlight {
              background-color: #fef3c7;
              padding: 16px;
              border-radius: 8px;
              border-left: 4px solid #f59e0b;
              margin: 24px 0;
            }

            .text-center {
              text-align: center;
            }

            .text-sm {
              font-size: 14px;
            }

            .text-xs {
              font-size: 12px;
            }

            .mb-0 {
              margin-bottom: 0 !important;
            }

            @media screen and (max-width: 640px) {
              .email-container {
                width: 100% !important;
                margin: 0 !important;
              }
              
              .header, .content, .footer {
                padding-left: 16px !important;
                padding-right: 16px !important;
              }
              
              .button {
                width: 100% !important;
                box-sizing: border-box;
              }
            }
          `
        }} />
      </head>
      <body>
        {preheader && (
          <div style={{
            display: 'none',
            fontSize: '1px',
            color: '#333333',
            lineHeight: '1px',
            maxHeight: '0px',
            maxWidth: '0px',
            opacity: 0,
            overflow: 'hidden'
          }}>
            {preheader}
          </div>
        )}
        
        <div className="email-container">
          <div className="header">
            <a href="https://suburbmates.com.au" className="logo">
              SuburbMates
            </a>
            <p className="tagline">Melbourne's Business Community Platform</p>
          </div>
          
          <div className="content">
            {children}
          </div>
          
          <div className="footer">
            <div className="social-links">
              <a href="https://facebook.com/suburbmates">Facebook</a>
              <a href="https://instagram.com/suburbmates">Instagram</a>
              <a href="https://linkedin.com/company/suburbmates">LinkedIn</a>
            </div>
            
            <p className="text-sm">
              <strong>SuburbMates</strong><br />
              Melbourne's Business Community Platform<br />
              <a href="https://suburbmates.com.au">suburbmates.com.au</a>
            </p>
            
            <div className="divider" />
            
            <p className="text-xs mb-0">
              You're receiving this email because you created an account with SuburbMates.<br />
              <a href="{{.SiteURL}}/unsubscribe?token={{.Token}}">Unsubscribe</a> | 
              <a href="mailto:support@suburbmates.com.au">Contact Support</a> | 
              <a href="https://suburbmates.com.au/privacy">Privacy Policy</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}