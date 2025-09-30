# SuburbMates Email Management System

Complete guide to managing Resend emails from WARP IDE and command line.

## 🚀 Quick Start

### Check System Status
```bash
npm run email:control status
```

### Send Test Email
```bash
npm run email:control test your@email.com
npm run email:control test your@email.com welcome
```

### View Analytics
```bash
npm run email:control analytics
```

## 📋 System Overview

Your SuburbMates project has a comprehensive email management system built on Resend with:

- **Professional email templates** for all business workflows
- **Domain verification** for `suburbmates.com.au`
- **CLI tools** for testing and management
- **Programmatic API** for integration
- **Analytics and monitoring** capabilities

## 🔧 Environment Setup

Required environment variables in `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AUTH_EMAIL_FROM=SuburbMates <noreply@suburbmates.com.au>
NEXT_PUBLIC_APP_URL=https://suburbmates.com.au
```

## 📧 Email Templates

### Available Templates

| Template | Purpose | Usage |
|----------|---------|-------|
| **newInquiry** | Customer inquiry notifications | Sent to business owners when customers submit inquiries |
| **businessWelcome** | New business registration | Welcome new businesses to the platform |
| **claimApproved** | Business claim approved | Notify users their ownership claim was approved |
| **claimRejected** | Claim needs verification | Request additional documentation for claims |
| **claimSubmitted** | Claim confirmation | Confirm claim submission received |
| **claimVerificationNeeded** | Additional verification | Request more verification documents |
| **businessApproved** | Business profile approved | Notify when business profile goes live |
| **businessRejected** | Profile needs review | Business profile requires changes |

### Template Features

- 📱 **Mobile-responsive** HTML templates
- 🎨 **Branded** with SuburbMates colors and styling
- 🔗 **Interactive** with action buttons and links
- 📊 **Trackable** with open and click tracking

## ⌨️ Command Line Interface

### System Commands

```bash
# Complete system status check
npm run email:control status

# Check domain verification
npm run email:control domains

# List all available templates
npm run email:control templates

# View system demo and examples
npm run email:demo
```

### Testing Commands

```bash
# Send basic test email
npm run email:control test user@example.com

# Send welcome template test
npm run email:control test user@example.com welcome

# Send inquiry template test
npm run email:control test user@example.com inquiry
```

### Sending Business Emails

```bash
# Send welcome email
npm run email:control send welcome owner@business.com "Business Name"

# Send inquiry notification
npm run email:control send inquiry owner@business.com "Business Name"

# Send claim approval
npm run email:control send claim-approved owner@business.com "Business Name"

# Send claim rejection
npm run email:control send claim-rejected owner@business.com "Business Name" "Reason for rejection"
```

### Analytics Commands

```bash
# View email analytics (last 20 emails)
npm run email:control analytics

# View more email history
npm run email:control analytics 50

# View email activity logs
npm run email:control logs

# View logs for specific time period
npm run email:control logs 48  # Last 48 hours
```

### Bulk Operations

```bash
# Send bulk emails from CSV file
npm run email:control bulk path/to/emails.csv
```

CSV Format:
```csv
email,type,param1,param2
owner@business.com,welcome,Business Name
customer@email.com,inquiry,Business Name
```

## 💻 Programmatic Usage

### Using the Email Manager

```typescript
import { emailManager, quickSendTest } from './lib/email-manager';

// Quick system check
const status = await emailManager.getSystemStatus();
console.log('Email system ready:', status.resendConnected && status.domainVerified);

// Send test email
const result = await quickSendTest('user@example.com', 'welcome');
if (result.success) {
  console.log('Test email sent:', result.emailId);
}

// Send business email
await emailManager.sendBusinessEmail('welcome', 'owner@business.com', {
  ownerName: 'John Smith',
  businessName: 'Smith\'s Cafe',
  profileUrl: 'https://suburbmates.com.au/business/smiths-cafe',
  approvalStatus: 'APPROVED'
});
```

### Using Existing Email Functions

```typescript
import { 
  sendInquiryNotificationEmail,
  sendBusinessRegistrationEmail,
  sendClaimApprovedEmail 
} from './lib/email';

// Send inquiry notification
await sendInquiryNotificationEmail('owner@business.com', {
  customerName: 'Sarah Johnson',
  customerEmail: 'sarah@example.com',
  message: 'I\'d like to book a table',
  businessName: 'Smith\'s Cafe',
  inquiryId: 'INQ-123456'
});

// Send business registration email
await sendBusinessRegistrationEmail('owner@business.com', {
  ownerName: 'John Smith',
  businessName: 'Smith\'s Cafe',
  profileUrl: 'https://suburbmates.com.au/business/smiths-cafe',
  approvalStatus: 'APPROVED'
});
```

### Bulk Email Processing

```typescript
const bulkRequests = [
  {
    type: 'welcome',
    recipient: 'owner1@business.com',
    data: { businessName: 'Business 1', ownerName: 'Owner 1' }
  },
  {
    type: 'claim-approved',
    recipient: 'owner2@business.com',
    data: { businessName: 'Business 2', businessSlug: 'business-2' }
  }
];

const results = await emailManager.sendBulkEmails(bulkRequests, 1000);
console.log(`Sent: ${results.successful}, Failed: ${results.failed}`);
```

## 📊 Analytics and Monitoring

### Email Analytics

The system provides comprehensive analytics when available:

- **Delivery rates** - Percentage of emails successfully delivered
- **Open rates** - Percentage of delivered emails that were opened
- **Bounce rates** - Percentage of emails that bounced
- **Click tracking** - Track clicks on email buttons and links
- **Recent activity** - List of recent email sends with status

### System Monitoring

Monitor your email system health:

```typescript
const status = await emailManager.getSystemStatus();

// Check for issues
if (status.errors.length > 0) {
  console.log('Email system issues:', status.errors);
}

// Verify domain
const domain = await emailManager.checkDomainStatus();
if (!domain?.verified) {
  console.log('Domain verification needed');
}
```

## 🛠️ Troubleshooting

### Common Issues

**1. Domain Not Verified**
```bash
npm run email:control domains
```
- Check DNS records in your domain provider
- Verify SPF, DKIM, and DMARC records
- Allow up to 48 hours for DNS propagation

**2. Missing Environment Variables**
```bash
npm run email:control status
```
- Ensure `RESEND_API_KEY` is set in `.env.local`
- Verify `AUTH_EMAIL_FROM` matches your verified domain
- Check `NEXT_PUBLIC_APP_URL` is correct

**3. Template Errors**
```bash
npm run email:control templates
```
- Verify all email template files are present
- Check for syntax errors in template functions
- Ensure import paths are correct

**4. API Rate Limits**
- Use delay between bulk emails (default: 1000ms)
- Monitor your Resend account usage
- Consider upgrading plan for higher limits

### Debug Commands

```bash
# Full system diagnostic
npm run email:control status

# Test basic connectivity
npm run email:control test your@email.com basic

# Check specific template
npm run email:control test your@email.com welcome

# View detailed logs
npm run email:control logs 24

# Run demo to see all functionality
npm run email:demo
```

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit API keys to version control
   - Use different keys for development/production
   - Rotate API keys regularly

2. **Email Validation**
   - Validate all email addresses before sending
   - Use the built-in validation function
   - Handle bounces and complaints properly

3. **Rate Limiting**
   - Implement delays between bulk emails
   - Monitor sending volume
   - Respect Resend rate limits

4. **Data Protection**
   - Don't log sensitive customer data
   - Use HTTPS for all email-related endpoints
   - Comply with email marketing regulations

## 📚 Further Reading

- [Resend Documentation](https://resend.com/docs)
- [Email Template Best Practices](https://resend.com/docs/send/with-react)
- [Domain Verification Guide](https://resend.com/docs/dashboard/domains/introduction)
- [Analytics and Tracking](https://resend.com/docs/dashboard/analytics/introduction)

## 🆘 Support

If you encounter issues:

1. Run `npm run email:demo` to see full system capabilities
2. Check `npm run email:control status` for system health
3. Review logs with `npm run email:control logs`
4. Test with `npm run email:control test your@email.com`

Your SuburbMates email system is production-ready with comprehensive templates, monitoring, and management tools! 🚀