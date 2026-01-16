# SendGrid Setup Guide
## Email Service Configuration for What Sikkimese Want Portal

---

## 📧 Why Switch to SendGrid?

**Current Issue:**
- Gmail SMTP is timing out from Railway servers
- Gmail blocks connections from some cloud hosting providers

**SendGrid Benefits:**
- ✅ Designed for server-to-server email
- ✅ Better deliverability (99%+ delivery rate)
- ✅ **FREE tier: 100 emails/day** (perfect for your needs)
- ✅ Works reliably from Railway/cloud platforms
- ✅ Email analytics and tracking
- ✅ No 2FA or app passwords needed

---

## 🚀 Quick Setup (15 Minutes)

### Step 1: Create SendGrid Account (5 minutes)

1. **Go to SendGrid:** https://signup.sendgrid.com/

2. **Sign up with these details:**
   ```
   Email: whatsikkimesewant@tutamail.com (or your preferred email)
   Username: whatsikkimesewant (or any username)
   Password: [Create a strong password]
   ```

3. **Complete verification:**
   - Check your email inbox for verification link
   - Click the link to verify your account
   - You'll be redirected to SendGrid dashboard

4. **Skip or complete onboarding:**
   - They may ask about your use case
   - Select: "Transactional emails" or "Notifications"
   - Monthly volume: "Up to 1,000 emails"
   - Skip other optional steps

---

### Step 2: Verify Sender Email (5 minutes)

**IMPORTANT:** SendGrid requires you to verify the email address you'll send FROM.

1. **Navigate to Sender Authentication:**
   - Dashboard → Settings (left sidebar) → Sender Authentication
   - OR go directly: https://app.sendgrid.com/settings/sender_auth

2. **Choose Single Sender Verification** (easiest option):
   - Click "Get Started" under "Single Sender Verification"
   - This is FREE and takes 2 minutes

3. **Fill out sender details:**
   ```
   From Name: What Sikkimese Want
   From Email: whatsikkimesewant@tutamail.com
   Reply To: whatsikkimesewant@tutamail.com (same as From)
   Company Address: Gangtok, Sikkim
   City: Gangtok
   State: Sikkim
   Zip Code: 737101
   Country: India
   Nickname: Sikkim Portal (internal reference only)
   ```

4. **Verify the sender email:**
   - SendGrid will send a verification email to `whatsikkimesewant@tutamail.com`
   - Check your inbox
   - Click the verification link
   - You'll see "Verified" status in SendGrid dashboard

**Alternative: Domain Authentication (Advanced)**
- If you own the domain `whatsikkimesewant.com`, you can authenticate the entire domain
- This involves adding DNS records (TXT, CNAME)
- More complex but better for deliverability
- Skip this for now - Single Sender Verification is sufficient

---

### Step 3: Create API Key (3 minutes)

1. **Navigate to API Keys:**
   - Dashboard → Settings (left sidebar) → API Keys
   - OR go directly: https://app.sendgrid.com/settings/api_keys

2. **Click "Create API Key"**

3. **Configure the API Key:**
   ```
   API Key Name: Sikkim Portal Production
   API Key Permissions: Full Access
   ```

   **Note:** You can also choose "Restricted Access" and only enable "Mail Send" permission for better security.

4. **Copy the API Key:**
   - SendGrid will show you the API key ONCE
   - It looks like: `SG.xxxxxxxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy`
   - **IMPORTANT:** Copy it immediately and save it securely
   - You won't be able to see it again!

5. **Store the API Key safely:**
   - Keep it in a password manager or secure note
   - We'll add it to Railway in the next step

---

### Step 4: Update Railway Environment Variables (2 minutes)

1. **Go to Railway Dashboard:**
   - https://railway.app/
   - Select your project: "what-sikkimese-want"

2. **Navigate to Variables:**
   - Click on your service
   - Go to "Variables" tab

3. **Update these environment variables:**

   **Change EMAIL_SERVICE:**
   ```
   EMAIL_SERVICE = sendgrid
   ```
   (Change from `gmail` to `sendgrid`)

   **Add SENDGRID_API_KEY:**
   ```
   SENDGRID_API_KEY = SG.xxxxxxxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
   ```
   (Paste the API key you copied from SendGrid)

   **Keep EMAIL_USER:**
   ```
   EMAIL_USER = whatsikkimesewant@tutamail.com
   ```
   (This is the "From" email address - must match verified sender)

   **Remove EMAIL_PASSWORD** (optional):
   ```
   You can delete EMAIL_PASSWORD since it's not needed for SendGrid
   ```

4. **Save changes:**
   - Railway will automatically redeploy your app

---

## 🧪 Testing SendGrid (5 minutes)

### Test 1: Submit a Request on Your Website

1. Go to: https://whatsikkimesewant.com
2. Fill out the amenity request form
3. Submit the request
4. **Check your email inbox** (the email you used in the form)
5. You should receive a confirmation email within seconds

**Expected Email:**
```
Subject: Request Received - Ref: SKM123456789

Dear [Your Name],

Thank you for submitting your amenity request for [District]!

Your Reference ID: SKM123456789
...
```

### Test 2: Update Status in Admin Panel

1. Go to: https://whatsikkimesewant.com/admin.html
2. Login with admin credentials
3. Find the test request you just submitted
4. Change status from "Pending" to "In Progress"
5. Add admin notes (optional)
6. Save changes
7. **Check your email inbox**
8. You should receive a status update email

**Expected Email:**
```
Subject: [Status Update] Your Request - Ref: SKM123456789

Dear [Your Name],

Your request status has been updated:

Previous Status: Pending
New Status: In Progress
...
```

### Test 3: Check SendGrid Dashboard

1. Go to: https://app.sendgrid.com/
2. Navigate to "Activity" in left sidebar
3. You should see your test emails listed
4. Check delivery status (should say "Delivered")

---

## 🔍 Troubleshooting

### Issue 1: Email Not Received

**Check SendGrid Activity Feed:**
1. Go to: https://app.sendgrid.com/email_activity
2. Look for your test email
3. Check the status:
   - ✅ **Delivered** - Email sent successfully
   - ⚠️ **Processed** - Email is being sent
   - ❌ **Dropped** - Email was blocked (see reason)
   - ❌ **Bounced** - Recipient email invalid

**Common Reasons for Dropped/Bounced:**
- Sender email not verified in SendGrid
- Recipient email address invalid
- Spam filters blocking the email

**Solutions:**
- Verify sender email in SendGrid (Step 2)
- Check spam/junk folder
- Try different recipient email address

### Issue 2: "Unauthorized sender" Error

**Error Message:**
```
Error: The from address does not match a verified Sender Identity
```

**Solution:**
1. Go to: https://app.sendgrid.com/settings/sender_auth
2. Verify that `whatsikkimesewant@tutamail.com` is listed and shows "Verified"
3. If not verified, complete sender verification (Step 2)
4. Make sure `EMAIL_USER` in Railway matches exactly

### Issue 3: "Invalid API Key" Error

**Error Message:**
```
Error: Unauthorized (401)
```

**Solution:**
1. API key is incorrect or expired
2. Create a new API key in SendGrid (Step 3)
3. Update `SENDGRID_API_KEY` in Railway
4. Restart the server (Railway auto-restarts on env change)

### Issue 4: Emails Go to Spam

**Solutions:**
1. **Domain Authentication (Recommended):**
   - Go to: https://app.sendgrid.com/settings/sender_auth
   - Complete domain authentication (adds DNS records)
   - This significantly improves deliverability

2. **Warm up your sender reputation:**
   - SendGrid gives new accounts a "warm-up" period
   - Start with low volume (10-20 emails/day)
   - Gradually increase over 2 weeks
   - This builds sender reputation

3. **Improve email content:**
   - Avoid spam trigger words ("Free", "Click here", etc.)
   - Include unsubscribe link (optional for transactional emails)
   - Use proper HTML formatting (already done)

### Issue 5: Railway Environment Variables Not Working

**Check:**
1. Go to Railway → Variables tab
2. Verify all variables are set correctly:
   ```
   EMAIL_SERVICE = sendgrid
   SENDGRID_API_KEY = SG.xxx...
   EMAIL_USER = whatsikkimesewant@tutamail.com
   ```
3. Click "Redeploy" manually if auto-deploy didn't trigger
4. Check Railway logs for errors:
   ```
   ✅ Email service initialized: sendgrid
   ```

---

## 📊 SendGrid Free Tier Limits

| Feature | Free Tier | Your Expected Usage |
|---------|-----------|---------------------|
| **Emails per day** | 100 | ~10-30 |
| **Emails per month** | 3,000 | ~300-900 |
| **Price** | **FREE** | **$0** |
| **Sender verification** | Required | ✅ |
| **API access** | ✅ | ✅ |
| **Email analytics** | ✅ | ✅ |
| **Support** | Community | ✅ |

**You're well within the free tier limits!**

---

## 🔐 Security Best Practices

### Protect Your API Key

**DO:**
- ✅ Store API key in Railway environment variables
- ✅ Never commit API key to Git
- ✅ Use "Restricted Access" when creating key (only Mail Send permission)
- ✅ Rotate API key if compromised

**DON'T:**
- ❌ Share API key publicly
- ❌ Commit to GitHub
- ❌ Include in client-side code
- ❌ Email or message the key

### Rotate API Key (If Compromised)

1. Go to: https://app.sendgrid.com/settings/api_keys
2. Click "Delete" on old API key
3. Create new API key (Step 3)
4. Update Railway environment variable
5. Server will auto-restart with new key

---

## 📈 Monitoring Email Delivery

### SendGrid Activity Feed

**View all emails:**
1. Go to: https://app.sendgrid.com/email_activity
2. Filter by:
   - Date range
   - Email address
   - Status (delivered, bounced, dropped)

**What to monitor:**
- Delivery rate (should be >95%)
- Bounce rate (should be <5%)
- Spam reports (should be 0)

### Railway Server Logs

**Check email sending status:**
1. Go to Railway → Deployments → Logs
2. Look for:
   ```
   ✅ Confirmation email sent to user@example.com (Ref: SKM123456789)
   ✅ Status update email sent to user@example.com (Ref: SKM123456789, Status: Approved)
   ```
3. Errors will show:
   ```
   ❌ Error sending confirmation email: [error details]
   ```

---

## 🎯 Configuration Summary

### Environment Variables (Railway)

```bash
# SendGrid Configuration
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
EMAIL_USER=whatsikkimesewant@tutamail.com

# Application Domain
DOMAIN=https://whatsikkimesewant.com

# Other variables (Telegram, Database, etc.)
# ... keep existing variables ...
```

### SendGrid Settings

```
Verified Sender: whatsikkimesewant@tutamail.com
API Key Name: Sikkim Portal Production
API Key Permission: Full Access (or Restricted: Mail Send only)
Plan: Free (100 emails/day)
```

---

## 📚 Additional Resources

**SendGrid Documentation:**
- Getting Started: https://docs.sendgrid.com/for-developers/sending-email/quickstart-nodejs
- API Reference: https://docs.sendgrid.com/api-reference/mail-send/mail-send
- Sender Authentication: https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication

**SendGrid Dashboard:**
- Activity Feed: https://app.sendgrid.com/email_activity
- API Keys: https://app.sendgrid.com/settings/api_keys
- Sender Authentication: https://app.sendgrid.com/settings/sender_auth
- Analytics: https://app.sendgrid.com/stats

**Your Portal:**
- Website: https://whatsikkimesewant.com
- Admin Panel: https://whatsikkimesewant.com/admin.html
- Railway Dashboard: https://railway.app/

---

## ✅ Setup Checklist

### SendGrid Account Setup
- [ ] Create SendGrid account
- [ ] Verify email address
- [ ] Complete sender verification for `whatsikkimesewant@tutamail.com`
- [ ] Create API key
- [ ] Copy and save API key securely

### Railway Configuration
- [ ] Update `EMAIL_SERVICE` to `sendgrid`
- [ ] Add `SENDGRID_API_KEY` with your API key
- [ ] Verify `EMAIL_USER` matches verified sender
- [ ] Wait for Railway auto-redeploy (1-2 minutes)

### Testing
- [ ] Submit test request on website
- [ ] Check inbox for confirmation email
- [ ] Update request status in admin panel
- [ ] Check inbox for status update email
- [ ] Verify emails in SendGrid activity feed
- [ ] Check Railway logs for success messages

### Monitoring
- [ ] Bookmark SendGrid activity feed
- [ ] Monitor delivery rates
- [ ] Check Railway logs regularly
- [ ] Watch for error messages

---

## 🚀 Ready to Go Live?

Once you've completed all steps:

1. ✅ SendGrid account created and verified
2. ✅ Sender email verified (`whatsikkimesewant@tutamail.com`)
3. ✅ API key created and added to Railway
4. ✅ Railway environment variables updated
5. ✅ Test emails sent successfully

**Your email notifications are now powered by SendGrid!**

Users will receive:
- ✅ Confirmation emails when submitting requests
- ✅ Status update emails when you change request status
- ✅ Professional, reliable email delivery
- ✅ 99%+ delivery rate

---

## 💰 Cost Breakdown

| Service | Plan | Cost | Your Usage |
|---------|------|------|------------|
| SendGrid | Free Tier | **$0/month** | 10-30 emails/day |
| Telegram | Free | **$0/month** | Unlimited |
| **Total** | - | **$0/month** | ✅ |

**No monthly costs - completely free!**

---

## 🎉 Success Criteria

**How to know it's working:**

1. **Server logs show:**
   ```
   ✅ Email service initialized: sendgrid
   ✅ Confirmation email sent to user@example.com
   ```

2. **Users receive emails within 30 seconds**

3. **SendGrid activity shows "Delivered"**

4. **No errors in Railway logs**

5. **Delivery rate >95% in SendGrid dashboard**

---

**Questions?** Check SendGrid docs or Railway logs for detailed error messages.

**Last Updated:** January 2026
**Version:** 1.0 - SendGrid Setup Guide
