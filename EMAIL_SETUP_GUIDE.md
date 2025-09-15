# 📧 Professional Email Setup Guide for SuburbMates

**This guide will help you replace the unprofessional Supabase default emails with branded emails from your domain.**

---

## 🚨 **Current Issue**

**Problem:** Default Supabase emails come from `no-reply@mail.app.supabase.io` which:
- ❌ Looks unprofessional
- ❌ Doesn't match your brand
- ❌ May be flagged as spam
- ❌ Reduces user trust

**Solution:** Configure custom SMTP with Resend to send branded emails from `noreply@suburbmates.com.au`

---

## ✅ **What We've Already Implemented**

**1. Custom Email Templates** ✅
- Professional SuburbMates-branded email templates
- Responsive HTML design with proper styling
- Clear call-to-action buttons
- Consistent brand colors and messaging

**2. Resend Integration** ✅
- Custom email confirmation function
- Professional sender address: `SuburbMates <noreply@suburbmates.com.au>`
- Error handling and logging

**3. Modified Signup Flow** ✅
- Custom confirmation emails sent via Resend
- Proper redirect URLs configured
- Business name personalization

---

## 🔧 **Required Configuration Steps**

### **Step 1: Environment Variables**

Add these to your `.env.local` file:

```bash
# Resend Configuration (Already configured)
RESEND_API_KEY=your_resend_api_key_here

# App URL (Update if needed)
NEXT_PUBLIC_APP_URL=https://suburbmates.com.au

# Email Domain Configuration
SENDER_DOMAIN=suburbmates.com.au
ADMIN_EMAIL=admin@suburbmates.com.au
```

### **Step 2: Domain Verification in Resend**

1. **Login to Resend Dashboard**
   - Go to https://resend.com/domains
   - Add your domain: `suburbmates.com.au`

2. **Add DNS Records**
   ```
   Type: TXT
   Name: @
   Value: resend-domain-verification=xxx
   
   Type: MX
   Name: @
   Value: feedback-smtp.resend.com
   Priority: 10
   
   Type: TXT
   Name: @
   Value: "v=spf1 include:_spf.resend.com ~all"
   
   Type: TXT
   Name: resend._domainkey
   Value: [DKIM key provided by Resend]
   ```

3. **Verify Domain**
   - Wait for DNS propagation (up to 24 hours)
   - Click "Verify" in Resend dashboard

### **Step 3: Supabase SMTP Configuration**

**Option A: Disable Supabase Auth Emails (Recommended)**

1. Go to Supabase Dashboard → Authentication → Settings
2. **Disable** "Enable email confirmations"
3. **Disable** "Enable email change confirmations"
4. Our custom Resend emails will handle all confirmations

**Option B: Configure Custom SMTP in Supabase**

1. Go to Supabase Dashboard → Authentication → Settings → SMTP Settings
2. Configure:
   ```
   SMTP Host: smtp.resend.com
   SMTP Port: 587
   SMTP Username: resend
   SMTP Password: [Your Resend API Key]
   Sender Email: noreply@suburbmates.com.au
   Sender Name: SuburbMates
   ```

### **Step 4: Update Email Templates in Supabase (If using Option B)**

1. Go to Authentication → Email Templates
2. **Confirm Signup Template:**
   ```html
   <h2>Confirm Your SuburbMates Account</h2>
   <p>Welcome to SuburbMates! Please confirm your email address:</p>
   <a href="{{ .ConfirmationURL }}">Confirm Email</a>
   ```

3. **Reset Password Template:**
   ```html
   <h2>Reset Your SuburbMates Password</h2>
   <p>Click the link below to reset your password:</p>
   <a href="{{ .ConfirmationURL }}">Reset Password</a>
   ```

---

## 🎯 **Recommended Approach: Option A**

**We recommend Option A (Disable Supabase emails) because:**

✅ **Full Control:** Complete control over email design and content
✅ **Better Deliverability:** Resend has better deliverability rates
✅ **Professional Branding:** Consistent with your brand
✅ **Advanced Features:** Rich HTML templates, analytics, etc.
✅ **No Conflicts:** No risk of duplicate emails

---

## 📧 **Current Email Flow**

**With our implementation:**

1. **User Signs Up** → Custom Resend email sent
2. **User Clicks Confirmation** → Handled by `/api/auth/confirm`
3. **Account Activated** → User can login
4. **Welcome Email** → Sent via Resend after approval

**Email Examples:**

**From:** `SuburbMates <noreply@suburbmates.com.au>`
**Subject:** `Confirm Your SuburbMates Account 📧`
**Content:** Professional HTML template with:
- SuburbMates branding
- Clear confirmation button
- Helpful instructions
- Contact information
- Professional footer

---

## 🔍 **Testing the Setup**

### **Test Email Confirmation:**

1. **Sign up** with a test email
2. **Check email** - should come from `noreply@suburbmates.com.au`
3. **Verify branding** - should have SuburbMates styling
4. **Click confirmation** - should redirect properly
5. **Check logs** - should show Resend success messages

### **Verification Checklist:**

- [ ] Email comes from correct domain
- [ ] Professional SuburbMates branding
- [ ] Confirmation link works
- [ ] No Supabase default emails sent
- [ ] Proper redirect after confirmation
- [ ] Welcome email sent after approval

---

## 🚨 **Troubleshooting**

### **Issue: Still receiving Supabase emails**
**Solution:** Ensure Supabase email confirmations are disabled in dashboard

### **Issue: Resend emails not sending**
**Solution:** Check:
- RESEND_API_KEY is correct
- Domain is verified in Resend
- DNS records are properly configured

### **Issue: Emails going to spam**
**Solution:** 
- Verify SPF, DKIM, and DMARC records
- Use proper sender reputation
- Include unsubscribe links

### **Issue: Confirmation links not working**
**Solution:** Check:
- NEXT_PUBLIC_APP_URL is correct
- `/api/auth/confirm` endpoint is working
- Token generation is correct

---

## 📊 **Email Analytics**

**Resend provides analytics for:**
- Delivery rates
- Open rates
- Click rates
- Bounce rates
- Spam complaints

**Access:** https://resend.com/emails

---

## 🎉 **Expected Results**

**After proper configuration:**

✅ **Professional emails** from `noreply@suburbmates.com.au`
✅ **Branded templates** with SuburbMates styling
✅ **Better deliverability** and inbox placement
✅ **User trust** and brand consistency
✅ **Analytics** and email tracking
✅ **No more unprofessional** Supabase emails

---

## 💡 **Next Steps**

1. **Configure DNS records** for your domain
2. **Verify domain** in Resend dashboard
3. **Disable Supabase emails** (Option A)
4. **Test the flow** with a real signup
5. **Monitor analytics** in Resend dashboard

**Once configured, all confirmation emails will be professional, branded, and sent from your domain!** 🚀📧