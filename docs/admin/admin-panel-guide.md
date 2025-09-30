# 🛠️ SuburbMates Admin Panel Complete Guide

## 🎯 **Overview**

The SuburbMates Admin Panel is a comprehensive administrative interface that provides complete control over the platform's business operations, user management, content moderation, and system automation. Built with Next.js and secured with role-based access control.

### **Access Information**
- **URL**: `https://suburbmates.com.au/admin`
- **Authentication**: Supabase Auth with admin role verification
- **Access Control**: Role-based (ADMIN role) + environment-based email whitelist
- **Security**: Protected routes with middleware authentication

---

## 🔐 **Access Control & Security**

### **Admin Authentication Process**

1. **Initial Login**: Standard user login at `/auth/signin`
2. **Role Verification**: System checks two validation methods:
   - **Database Role**: User.role = 'ADMIN' in Prisma database
   - **Email Whitelist**: Email listed in `ADMIN_EMAILS` environment variable
3. **Access Control**: Middleware redirects non-admins to user dashboard
4. **Session Management**: Continuous authentication checks on all admin routes

### **Admin User Setup Instructions**

#### **Method 1: Database Role Assignment**
```sql
-- Update user role in database
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

#### **Method 2: Environment Variable Whitelist**
```env
# Add to .env.local
ADMIN_EMAILS=admin1@suburbmates.com.au,admin2@suburbmates.com.au
```

#### **Creating First Admin User**
1. Register normally through website signup
2. Verify email address
3. Update database role manually:
   ```sql
   UPDATE users 
   SET role = 'ADMIN' 
   WHERE email = 'your-email@domain.com';
   ```
4. Access admin panel at `/admin`

---

## 📊 **Admin Dashboard Overview**

### **Key Metrics Display**

The main dashboard shows real-time platform statistics:

#### **Primary Metrics**
- **Total Users**: Platform user count with monthly growth percentage
- **Total Businesses**: Active business listings with growth trends
- **Pending Claims**: Business ownership claims awaiting review (urgent indicator)
- **New Inquiries**: Customer leads generated in last 24 hours

#### **AI Automation Status**
- **Active Status**: Shows if AI automation is running
- **Claims Processed**: Number of claims auto-processed by AI
- **Accuracy Rate**: AI decision accuracy percentage
- **Time Saved**: Hours saved through automation

#### **Recent Activity Feed**
Real-time activity stream showing:
- AI auto-approvals and decisions
- New business registrations
- High-priority lead generation
- Spam filtering results
- Manual admin actions

---

## 🏢 **Business Management**

### **Business Listings Overview** (`/admin/businesses`)

Complete control over all business profiles on the platform.

#### **Business Status Management**
- **PENDING**: Newly registered, awaiting approval
- **APPROVED**: Live on platform, discoverable in search
- **REJECTED**: Hidden from public, with rejection reasons

#### **Business Actions Available**

##### **Bulk Operations**
- Approve multiple businesses simultaneously
- Reject with standardized reason templates
- Export business data for analysis
- Send batch notifications to business owners

##### **Individual Business Management**
1. **Profile Review**: Complete business profile inspection
2. **Status Changes**: Approve, reject, or flag for review
3. **Content Moderation**: Edit descriptions, remove inappropriate content
4. **Contact Information**: Verify and update business details
5. **Profile Customization**: Override theme settings if needed

#### **Business Verification Process**
1. **Automated Checks**: AI pre-screening for obvious issues
2. **Manual Review**: Admin visual inspection of profile
3. **Contact Verification**: Email/phone validation if required
4. **Decision Recording**: Status change with admin notes
5. **Notification**: Automated email to business owner

### **Advanced Business Features**

#### **Profile Optimization Analysis**
- **Missing Elements**: Hero images, descriptions, contact info
- **Completeness Score**: Profile completion percentage
- **SEO Health**: Meta tags, structured data validation
- **Performance Metrics**: View counts, lead generation stats

#### **Business Analytics Dashboard**
- **Top Performers**: Businesses ranked by leads and views
- **Geographic Distribution**: Melbourne suburb performance
- **Category Analysis**: Most successful business types
- **Seasonal Trends**: Monthly performance patterns

---

## ✅ **Ownership Claims Management**

### **Claims Verification Dashboard** (`/admin/claims`)

Comprehensive system for managing business ownership verification requests.

#### **Claim Types Processed**
1. **Email Verification**: Business email domain matching
2. **Phone Verification**: Business phone number confirmation
3. **Document Upload**: ABN certificates, licenses, permits
4. **ABN Verification**: Australian Business Number validation
5. **Manual Evidence**: Photos, business cards, other proof

### **Claims Review Workflow**

#### **Step 1: Claim Assessment**
1. **Select Pending Claim**: Click claim from dashboard list
2. **Review Claim Details**: 
   - **Business Information**: Name, address, contact details
   - **Claiming User**: Email, name, registration date
   - **Verification Method**: Type of proof submitted
   - **Evidence Analysis**: Documents, emails, or other proof

#### **Step 2: Verification Process**
1. **Cross-Reference Data**: Compare claim data with business listing
2. **Evidence Validation**: 
   - **Email Domain Match**: Check if claimant email matches business domain
   - **ABN Lookup**: Validate Australian Business Number against ASIC database
   - **Document Authenticity**: Review uploaded certificates/licenses
   - **Contact Verification**: Call business phone number if needed

#### **Step 3: Decision Making**
1. **Approval Criteria**:
   - Email domain matches business name
   - ABN validation successful
   - Documents appear legitimate
   - No red flags in verification process

2. **Rejection Criteria**:
   - Mismatched business information
   - Invalid or expired documents
   - Suspicious activity patterns
   - Unresponsive verification attempts

#### **Step 4: Action Execution**

##### **Approving a Claim**
1. **Click "Approve" Button** on claim details
2. **Add Admin Notes** (optional but recommended)
3. **System Actions Triggered**:
   - Business ownership transferred to claimant
   - Claimant granted business management access
   - Previous owner access revoked (if applicable)
   - Approval email sent to claimant
   - Audit log entry created

##### **Rejecting a Claim**
1. **Click "Reject" Button** on claim details
2. **Mandatory Rejection Notes**: Provide clear reason
3. **System Actions Triggered**:
   - Claim status updated to REJECTED
   - Rejection email sent with explanation
   - Business remains with current owner
   - Audit log entry with rejection reason

### **AI-Assisted Verification**

#### **Automatic Pre-Screening**
The AI system automatically analyzes incoming claims and provides:
- **Confidence Score**: 0-100% likelihood of legitimacy
- **Risk Assessment**: Flags suspicious patterns
- **Recommendation**: Approve, reject, or manual review
- **Evidence Quality**: Assessment of submitted documentation

#### **AI Recommendations Usage**
1. **High Confidence (80%+)**: Consider auto-approval
2. **Medium Confidence (40-79%)**: Manual review recommended
3. **Low Confidence (<40%)**: Likely rejection candidate
4. **Red Flags**: Immediate manual review required

---

## 👥 **User Management**

### **User Administration** (`/admin/users`)

Complete user account management and moderation tools.

#### **User Account Controls**
1. **Profile Management**: Edit user information
2. **Role Assignment**: Grant/revoke admin privileges
3. **Account Status**: Suspend, ban, or reactivate users
4. **Email Verification**: Force email verification if needed
5. **Password Reset**: Generate password reset links

#### **User Analytics**
- **Registration Trends**: New user signups over time
- **Activity Patterns**: Login frequency, feature usage
- **Business Owners**: Users with claimed businesses
- **Support Tickets**: User-reported issues

### **Content Moderation**
- **Reported Content**: User-flagged inappropriate material
- **Spam Detection**: AI-flagged suspicious activity
- **Profile Reviews**: Business profile content approval
- **Comment Moderation**: Review and moderate user comments

---

## 💬 **Inquiries & Lead Management**

### **Customer Inquiry Dashboard** (`/admin/inquiries`)

Monitor and manage all customer leads and business inquiries.

#### **Inquiry Management Features**

##### **Lead Quality Assessment**
- **Spam Detection**: AI-powered spam filtering
- **Quality Scoring**: Lead qualification (High/Medium/Low priority)
- **Source Tracking**: Where inquiries originated (profile, search, social)
- **Conversion Tracking**: Follow-up status and outcomes

##### **Inquiry Actions**
1. **Status Management**: NEW → CONTACTED → CONVERTED → CLOSED
2. **Priority Assignment**: High-priority leads flagged for immediate attention
3. **Spam Filtering**: Remove or flag spam inquiries
4. **Business Notifications**: Ensure business owners are notified

#### **Lead Analytics**
- **Volume Trends**: Inquiries per day/week/month
- **Conversion Rates**: Lead-to-customer conversion percentages
- **Top Performing Businesses**: Highest lead generation
- **Source Attribution**: Most effective lead sources

### **Business Owner Communication**
- **Lead Notifications**: Email alerts for new inquiries
- **Follow-up Reminders**: Automated follow-up suggestions
- **Response Time Tracking**: Monitor business response rates
- **Lead Quality Feedback**: Business owner satisfaction surveys

---

## 🚀 **Bulk Operations Management**

### **Unified Bulk Operations Dashboard** (`/admin/bulk-operations`)

Comprehensive bulk operations system providing enterprise-grade mass management capabilities across all platform areas.

#### **Overview Dashboard Features**

##### **Unified Metrics Display**
- **Total Operations**: All-time bulk operation count across all modules
- **Active Operations**: Currently processing operations with real-time status
- **Completed Today**: Daily completion statistics with success rates
- **Failed Operations**: Operations requiring attention with error details

##### **Cross-Module Activity Feed**
- **Real-time Updates**: Live activity stream showing operations across all modules
- **Operation Attribution**: User attribution and timestamp information
- **Status Visualization**: Color-coded status indicators (Success, Failed, In Progress)
- **Detailed Context**: Operation descriptions with item counts and progress

### **Bulk Business Management**

#### **Mass Business Operations**

##### **Bulk Approval Workflows**
1. **Criteria-based Selection**: Filter businesses by quality score, category, or suburb
2. **Safety Confirmations**: Mandatory confirmations for mass approval operations
3. **Progress Tracking**: Real-time progress indicators for bulk operations
4. **Audit Logging**: Comprehensive logging of all bulk business decisions

##### **Quality Score Management**
- **Mass Recalculation**: Bulk quality score updates across selected businesses
- **Quality Insights**: Visual analytics showing score distribution and trends
- **Improvement Recommendations**: AI-generated suggestions for business improvements
- **Category Analysis**: Quality metrics broken down by business categories

##### **Advanced Business Analytics**
- **Performance Metrics**: Business growth and engagement statistics
- **Geographic Analysis**: Suburb-based performance insights
- **Trend Analysis**: Monthly and seasonal business performance patterns
- **Export Capabilities**: Custom field selection for business data exports

### **Bulk User Management**

#### **User Administration at Scale**

##### **Mass Role Assignment**
- **Role Management**: Bulk assignment of user roles (Admin, Business Owner, User)
- **Validation Checks**: Safety validations preventing unauthorized role escalation
- **User Segmentation**: Target users by activity, registration date, or profile completeness
- **Progress Tracking**: Real-time updates for bulk role assignment operations

##### **Account Status Control**
- **Bulk Status Changes**: Mass activate, suspend, or ban user accounts
- **Reason Management**: Standardized reason templates for account actions
- **Communication Integration**: Automated notifications for affected users
- **Rollback Capabilities**: Undo functionality for reversible account changes

##### **User Analytics and Insights**
- **Growth Metrics**: User registration and retention trend analysis
- **Activity Patterns**: User engagement and platform usage analytics
- **Business Owner Identification**: Users with claimed business profiles
- **Support Integration**: User-reported issues and support ticket tracking

### **Mass Communication System**

#### **Multi-Channel Campaign Management**

##### **Campaign Creation and Management**
- **Template System**: Reusable email, SMS, and notification templates
- **Channel Selection**: Multi-channel messaging (Email, SMS, Push, In-app)
- **A/B Testing**: Message optimization with variant testing
- **Scheduling**: Campaign automation with date/time scheduling

##### **Advanced Audience Targeting**
- **User Segmentation**: Target by role, activity, location, or custom criteria
- **Business Targeting**: Reach businesses by category, status, or quality score
- **Dynamic Audiences**: Real-time segmentation based on current data
- **Custom Segments**: Create and save audience segments for reuse

##### **Campaign Analytics**
- **Delivery Tracking**: Real-time delivery status and success rates
- **Engagement Metrics**: Open rates, click-through rates, and conversion tracking
- **Performance Comparison**: Campaign effectiveness analysis and insights
- **ROI Calculation**: Return on investment for marketing campaigns

### **Advanced CSV Operations**

#### **Enhanced Import/Export Interface**

##### **Drag-and-Drop Import System**
- **Multi-format Support**: CSV, JSON, XML, and Excel file import
- **Real-time Validation**: Instant file validation with error detection
- **Field Mapping**: Visual mapping interface for data transformation
- **Preview System**: Interactive data preview before import execution

##### **Data Quality Management**
- **Quality Assessment**: Automated data quality scoring and recommendations
- **Duplicate Detection**: Advanced duplicate identification during import
- **Data Transformation**: Field-level data conversion and formatting
- **Import History**: Complete audit trail of all import operations

##### **Export Customization**
- **Field Selection**: Custom field selection and ordering for exports
- **Format Options**: Multiple export formats with template support
- **Scheduled Exports**: Automated export scheduling with email delivery
- **Filtered Exports**: Advanced criteria-based data filtering

##### **Data Synchronization**
- **Incremental Updates**: Sync only changed data for efficiency
- **Rollback Capabilities**: Undo import operations where applicable
- **Progress Monitoring**: Real-time progress tracking for large operations
- **Error Recovery**: Partial success handling with detailed error reporting

### **Bulk Operations Best Practices**

#### **Safety Guidelines**
1. **Always Preview**: Use preview functions before executing bulk operations
2. **Start Small**: Test bulk operations on small datasets first
3. **Monitor Progress**: Watch real-time progress indicators for issues
4. **Review Results**: Check operation results and audit logs after completion
5. **Document Decisions**: Add detailed notes for significant bulk operations

#### **Performance Optimization**
1. **Batch Size Management**: Use appropriate batch sizes for system resources
2. **Off-Peak Operations**: Schedule large operations during low-traffic periods
3. **Resource Monitoring**: Monitor system resources during bulk operations
4. **Error Handling**: Plan for partial failures and recovery procedures

#### **Audit and Compliance**
1. **Comprehensive Logging**: All bulk operations are automatically logged
2. **User Attribution**: Every operation tracks the performing administrator
3. **Timestamp Accuracy**: Precise operation timing for audit trails
4. **Data Backup**: Regular backups before major bulk operations

### **Integration with Other Admin Systems**

#### **AI Automation Integration**
- **Quality Scoring**: Bulk operations integrate with AI quality assessments
- **Duplicate Detection**: Advanced AI-powered duplicate identification
- **Content Analysis**: AI-assisted content review for bulk approvals
- **Risk Assessment**: AI risk scoring for bulk user management

#### **Analytics Integration**
- **Performance Impact**: Track bulk operation impact on platform metrics
- **Business Intelligence**: Integrate bulk operation data with BI systems
- **Trend Analysis**: Monitor bulk operation patterns and effectiveness
- **ROI Tracking**: Measure return on investment for bulk management efforts

---

## 🤖 **AI Automation Management**

### **AI Settings Dashboard** (`/admin/ai`)

Control and monitor all automated processes and AI-powered features.

#### **AI Automation Features**

##### **Business Claim Verification AI**
- **Automatic Pre-screening**: Initial claim assessment
- **Document Analysis**: AI-powered document verification
- **Risk Assessment**: Fraud detection algorithms
- **Confidence Scoring**: Reliability of AI recommendations

##### **Lead Quality AI**
- **Spam Detection**: Automatic spam inquiry filtering
- **Lead Scoring**: Quality assessment algorithms
- **Priority Assignment**: Automatic prioritization
- **Response Suggestions**: AI-generated response templates

##### **Content Moderation AI**
- **Inappropriate Content Detection**: Adult content, spam, scams
- **Business Description Analysis**: Quality and legitimacy assessment
- **Image Moderation**: Uploaded image content verification
- **SEO Optimization**: Automatic SEO improvements

#### **AI Configuration Controls**

##### **Automation Rules Management**
1. **Enable/Disable AI Features**: Toggle individual AI systems
2. **Confidence Thresholds**: Adjust automatic decision thresholds
3. **Manual Override Settings**: When to require human review
4. **Notification Preferences**: AI decision alerts

##### **AI Performance Monitoring**
- **Accuracy Metrics**: AI decision accuracy over time
- **Processing Volume**: Number of items processed daily
- **Error Rates**: False positive/negative tracking
- **Performance Optimization**: AI model improvements

### **AI Training & Improvement**

#### **Feedback Loop Management**
1. **Manual Review Results**: Feed admin decisions back to AI
2. **Performance Analytics**: Track AI accuracy improvements
3. **Model Updates**: Apply improved AI models
4. **Custom Training**: Train AI on SuburbMates-specific data

---

## 📈 **Analytics & Reporting**

### **Platform Analytics Dashboard** (`/admin/analytics`)

Comprehensive business intelligence and performance monitoring.

#### **Key Performance Indicators**

##### **Business Metrics**
- **Total Active Businesses**: Approved business count
- **New Business Registrations**: Daily/weekly/monthly signups
- **Business Verification Rate**: Claim approval percentages
- **Profile Completion Rate**: Average profile completeness

##### **User Engagement Metrics**
- **Active Users**: Daily/Monthly active user counts
- **Search Activity**: Search queries and results
- **Profile Views**: Business profile visit counts
- **Lead Generation**: Inquiry volume and quality

##### **Revenue Metrics**
- **Premium Upgrades**: Paid feature adoption
- **Subscription Revenue**: Monthly recurring revenue
- **Lead Value**: Estimated economic value of leads generated
- **Business Acquisition Cost**: Cost to acquire new businesses

#### **Custom Reports Generation**
1. **Date Range Selection**: Flexible reporting periods
2. **Metric Selection**: Choose specific KPIs to track
3. **Export Options**: CSV, PDF report generation
4. **Automated Reports**: Scheduled email reports

### **Growth Analytics**
- **Suburb Performance**: Melbourne suburb-specific metrics
- **Category Analysis**: Business category performance
- **Seasonal Trends**: Monthly/quarterly patterns
- **Competitive Analysis**: Market positioning insights

---

## ⚙️ **System Settings**

### **Platform Configuration** (`/admin/settings`)

Core system settings and configuration management.

#### **General Settings**
- **Platform Name**: Site branding and titles
- **Contact Information**: Support contact details
- **Email Configuration**: SMTP settings and templates
- **API Keys**: External service integrations

#### **Feature Flags Management**
- **Feature Toggles**: Enable/disable platform features
- **A/B Testing**: Experimental feature rollouts
- **Maintenance Mode**: Platform maintenance controls
- **Regional Settings**: Melbourne-specific configurations

#### **Security Settings**
- **Admin Access Control**: Manage admin permissions
- **Rate Limiting**: API and form submission limits
- **Spam Protection**: Anti-spam configuration
- **Backup Settings**: Data backup scheduling

### **Email Template Management**
- **Welcome Emails**: New user onboarding
- **Business Notifications**: Claim decisions, approvals
- **Marketing Emails**: Newsletter and promotion templates
- **System Alerts**: Error and maintenance notifications

---

## 📋 **Common Admin Workflows**

### **Daily Operations Checklist**

#### **Morning Review (15 minutes)**
1. **Check Dashboard Metrics**: Review overnight activity
2. **Pending Claims**: Quick count of claims awaiting review
3. **High-Priority Leads**: Review any urgent customer inquiries
4. **AI Alerts**: Check for any AI system notifications

#### **Claim Processing Workflow (30 minutes)**
1. **Sort by Priority**: Review oldest claims first
2. **Verification Process**: Follow 4-step verification process
3. **Batch Decisions**: Process multiple similar claims together
4. **Documentation**: Add notes for complex decisions

#### **Business Quality Review (20 minutes)**
1. **New Business Approvals**: Review recent registrations
2. **Profile Quality Check**: Identify incomplete profiles
3. **Content Moderation**: Review flagged content
4. **SEO Optimization**: Identify optimization opportunities

#### **Weekly Analytics Review (45 minutes)**
1. **Performance Metrics**: Review week-over-week growth
2. **Top Performers**: Identify successful businesses
3. **Issue Identification**: Spot concerning trends
4. **Optimization Opportunities**: Plan improvements

### **Emergency Response Procedures**

#### **High-Volume Spam Attack**
1. **Enable Enhanced Filtering**: Increase spam detection sensitivity
2. **Manual Review**: Switch AI to manual review mode
3. **User Communication**: Notify legitimate users of delays
4. **Post-Incident**: Analyze attack patterns, improve filters

#### **System Performance Issues**
1. **Performance Monitoring**: Check dashboard load times
2. **Database Optimization**: Identify slow queries
3. **Cache Management**: Clear system caches if needed
4. **User Communication**: Status page updates

#### **Content Policy Violations**
1. **Immediate Removal**: Hide violating content
2. **User Notification**: Contact business owner
3. **Policy Review**: Assess if policy updates needed
4. **Documentation**: Log incident for pattern analysis

---

## 🔧 **Technical Administration**

### **Database Management**
- **User Data**: Direct database access for critical issues
- **Business Data**: Bulk data operations and migrations
- **Audit Logs**: Complete action history tracking
- **Backup Management**: Data backup and recovery procedures

### **API Management**
- **Rate Limiting**: Control API usage and abuse
- **Authentication**: Manage API keys and access tokens
- **Monitoring**: API performance and error tracking
- **Documentation**: Keep API docs updated

### **Third-Party Integrations**
- **Email Service**: Resend API configuration
- **Analytics**: Google Analytics and custom tracking
- **Storage**: Image and file storage management
- **Payment Processing**: Subscription and payment handling

---

## 📞 **Admin Support & Resources**

### **Help Documentation**
- **User Guides**: Complete admin workflow documentation
- **Video Tutorials**: Step-by-step process videos
- **FAQ**: Common questions and solutions
- **Troubleshooting**: Problem resolution guides

### **Contact Information**
- **Technical Support**: Developer contact for system issues
- **Policy Questions**: Business policy clarifications
- **Emergency Contact**: 24/7 support for critical issues
- **Training Resources**: New admin onboarding materials

### **Admin Community**
- **Admin Forums**: Discussion with other administrators
- **Best Practices**: Shared admin experiences and tips
- **Policy Updates**: Notifications of platform changes
- **Feature Requests**: Submit suggestions for improvements

---

## 🎯 **Success Metrics & KPIs**

### **Admin Efficiency Metrics**
- **Average Claim Processing Time**: Target <24 hours
- **Approval Accuracy Rate**: Target >95% correct decisions
- **User Satisfaction**: Business owner feedback scores
- **System Uptime**: Platform availability percentage

### **Platform Health Metrics**
- **Business Growth Rate**: Monthly new business additions
- **User Retention**: Monthly active user retention
- **Lead Quality Score**: Average lead conversion rate
- **Content Quality**: Profile completeness and accuracy

### **Automation Success Metrics**
- **AI Accuracy Rate**: AI decision correctness percentage
- **Time Savings**: Hours saved through automation
- **False Positive Rate**: Incorrect AI decisions percentage
- **Manual Override Rate**: AI decisions requiring human review

---

This comprehensive guide covers all aspects of the SuburbMates admin panel. For specific technical questions or advanced configuration needs, refer to the technical documentation or contact the development team.

**Remember**: All admin actions are logged for audit purposes. Always follow the verification procedures and document decisions thoroughly.