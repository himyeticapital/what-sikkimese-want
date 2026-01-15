# Notification System Setup Guide
## Email & Telegram Notifications for What Sikkimese Want Portal

---

## Overview

This portal now includes two automated notification systems:

1. **Email Notifications** - Sends confirmation and status update emails to users
2. **Telegram Notifications** - Posts new requests to district-specific Telegram groups

---

## 🎉 What's Already Done

✅ All code has been implemented and integrated
✅ Telegram bot token is configured
✅ All 6 district group Chat IDs have been captured
✅ Services are ready to be activated

---

## 📧 Email Service Setup

You need to configure **one** of these email services:

### Option 1: Gmail SMTP (Recommended for MVP)

**Pros:**
- Free up to 500 emails/day
- Easy to set up
- No API key costs

**Setup Steps:**

1. **Enable 2-Factor Authentication on Gmail**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Sikkim Portal"
   - Copy the 16-character password

3. **Update .env file**
   - Open `.env` file
   - Set `EMAIL_SERVICE=gmail`
   - Set `EMAIL_USER=whatsikkimesewant@gmail.com`
   - Set `EMAIL_PASSWORD=` (paste the 16-character app password)

**Example:**
```bash
EMAIL_SERVICE=gmail
EMAIL_USER=whatsikkimesewant@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop  # Your actual app password
```

### Option 2: SendGrid (Better Deliverability)

**Pros:**
- Better email deliverability
- Free tier: 100 emails/day
- Email analytics

**Setup Steps:**

1. **Sign up for SendGrid**
   - Go to https://sendgrid.com
   - Create a free account

2. **Create API Key**
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Give it "Full Access" or "Mail Send" permission
   - Copy the API key (you'll only see it once!)

3. **Update .env file**
   ```bash
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

## 📱 Telegram Service Setup

### ✅ Already Completed

The following has already been set up:

1. ✅ Bot created: `@WhatSikkimeseWantBot`
2. ✅ Bot token configured: `8545832601:AAHz91jQtLC715sW0DCsv58nC_sWW9NF2-k`
3. ✅ Bot added to all 6 district groups
4. ✅ Chat IDs captured and configured in `.env`:
   - Gangtok: `-1003302615562`
   - Mangan: `-5213366605`
   - Namchi: `-5043097343`
   - Gyalshing: `-5203380159`
   - Pakyong: `-5288398570`
   - Soreng: `-5062928127`

### What the Bot Does

When someone submits a request:
- Bot automatically posts the request details to the appropriate district group
- Group members can see: location, amenities, priority, reference ID
- Admins can click the link to review in admin panel

---

## 🚀 Testing the System

### Test Email Notifications

1. **Start the server:**
   ```bash
   node server.js
   ```

2. **Submit a test request** through the website:
   - Fill out the request form
   - Use your real email address
   - Submit the form

3. **Check your email:**
   - You should receive a confirmation email within seconds
   - Email includes reference ID and tracking link

4. **Test status update email:**
   - Go to admin panel
   - Update the request status
   - Check email for status update notification

### Test Telegram Notifications

1. **Submit a request** for any district

2. **Check the district's Telegram group:**
   - You should see a formatted message with request details
   - Message includes amenities, location, priority, reference ID

3. **Verify all districts:**
   - Test with requests from different districts
   - Each should post to the correct group

---

## 🎯 Current Configuration

### From `.env` file:

```bash
# Database
DATABASE_URL=postgresql://sikkim_amenities_user:...

# Email (NEEDS SETUP)
EMAIL_SERVICE=gmail
EMAIL_USER=whatsikkimesewant@gmail.com
EMAIL_PASSWORD=your_gmail_app_password_here  # ⚠️ NEEDS YOUR APP PASSWORD

# Domain
DOMAIN=https://whatsikkimesewant.com

# Telegram (READY TO USE)
TELEGRAM_BOT_TOKEN=8545832601:AAHz91jQtLC715sW0DCsv58nC_sWW9NF2-k
TELEGRAM_GROUP_GANGTOK=-1003302615562
TELEGRAM_GROUP_MANGAN=-5213366605
TELEGRAM_GROUP_NAMCHI=-5043097343
TELEGRAM_GROUP_GYALSHING=-5203380159
TELEGRAM_GROUP_PAKYONG=-5288398570
TELEGRAM_GROUP_SORENG=-5062928127
```

---

## 📁 Files Added/Modified

### New Files Created:
1. **`services/emailService.js`** - Email notification logic
2. **`services/telegramService.js`** - Telegram notification logic
3. **`.env`** - Environment configuration with your settings
4. **`.env.example`** - Template for environment variables
5. **`getChatIds.js`** - Utility to get Telegram Chat IDs (already used)

### Modified Files:
1. **`server.js`** - Integrated both notification services
2. **`package.json`** - Added nodemailer and dotenv dependencies

---

## 🔧 How It Works

### When a User Submits a Request:

1. **Request saved to database** ✅
2. **User receives response** ✅
3. **Email confirmation sent** (if configured) 📧
   - Contains reference ID
   - Shows request details
   - Includes tracking link
4. **Telegram notification sent** ✅
   - Posted to district group
   - Formatted with emojis and details
   - Includes admin panel link

### When Admin Updates Status:

1. **Status updated in database** ✅
2. **Admin receives response** ✅
3. **Email notification sent to user** (if configured) 📧
   - Shows old status → new status
   - Includes admin notes
   - Provides guidance based on status

---

## ⚠️ Important Notes

### Email Service:

- Emails are sent **asynchronously** (won't block requests)
- If email fails, the request is still saved
- Check server logs for email sending status
- Without email configuration, portal works but emails won't send

### Telegram Service:

- Notifications are sent **asynchronously**
- Already fully configured and ready to use
- No additional setup needed
- Bot must remain admin in all groups

### Status Update Notifications:

- Email: **Enabled** ✅ (when email is configured)
- Telegram: **Disabled** by default (optional)
  - To enable Telegram status updates, uncomment lines 311-318 in `server.js`

---

## 🐛 Troubleshooting

### Emails Not Sending

**Check:**
1. Is `EMAIL_SERVICE` set in `.env`?
2. Is `EMAIL_PASSWORD` the App Password (not your Gmail password)?
3. Check server logs for error messages
4. Gmail: Make sure 2FA is enabled

**Test email credentials:**
```bash
# In Node.js console
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'whatsikkimesewant@gmail.com',
        pass: 'your_app_password'
    }
});
transporter.verify((error, success) => {
    if (error) console.log('Error:', error);
    else console.log('Email service ready!');
});
```

### Telegram Not Posting

**Check:**
1. Bot token is correct in `.env`
2. Bot is admin in all groups
3. Chat IDs are correct (negative numbers)
4. Check server logs for error messages

**Verify bot:**
```bash
curl "https://api.telegram.org/bot8545832601:AAHz91jQtLC715sW0DCsv58nC_sWW9NF2-k/getMe"
```

### Server Not Starting

**Check:**
1. All dependencies installed: `npm install`
2. `.env` file exists in root directory
3. Database URL is correct
4. Port 3000 is not in use

---

## 📊 Service Status on Startup

When you start the server, you'll see:

```
Server running on port 3000
Database initialized successfully

📧 Initializing notification services...
✅ Email service initialized: gmail
✅ Telegram bot initialized
✅ Notification services ready
```

If email is not configured:
```
⚠️  Email service not configured. Emails will not be sent.
   Set EMAIL_SERVICE in .env file to "gmail" or "sendgrid"
```

---

## 🎯 Next Steps

1. **Set up Gmail App Password** (5 minutes)
2. **Update EMAIL_PASSWORD in .env** (1 minute)
3. **Restart the server** (`node server.js`)
4. **Submit a test request** to verify everything works
5. **Monitor Telegram groups** to see notifications

---

## 📈 Monitoring

### Server Logs

Watch for these messages:
- `✅ Confirmation email sent to...`
- `✅ Telegram notification sent to...`
- `✅ Status update email sent to...`
- `❌ Error sending...` (if something fails)

### Email Logs

Check Gmail Sent folder to see confirmation emails

### Telegram

Check each district group to see new request notifications

---

## 💰 Cost

- **Telegram:** FREE (unlimited)
- **Gmail:** FREE (500 emails/day)
- **SendGrid:** FREE (100 emails/day), $15/month for more

**Current Usage Estimate:**
- Average: 10-20 requests/day
- Status updates: 5-10/day
- Total emails: 15-30/day
- **Gmail free tier is sufficient** ✅

---

## 🔐 Security Notes

1. **Never commit `.env` file to Git**
   - Already in `.gitignore`
   - Contains sensitive credentials

2. **App Password vs Regular Password**
   - Use App Password (16 characters)
   - More secure than regular password
   - Can be revoked if compromised

3. **Bot Token**
   - Keep it private
   - Don't share publicly
   - Can regenerate from @BotFather if leaked

---

## 📞 Support

If you encounter issues:

1. Check server logs for error messages
2. Verify `.env` configuration
3. Test email credentials separately
4. Check bot status with Telegram API

---

## ✅ Checklist

- [ ] Enable 2FA on Gmail
- [ ] Generate Gmail App Password
- [ ] Update EMAIL_PASSWORD in .env
- [ ] Restart server
- [ ] Submit test request
- [ ] Verify email received
- [ ] Check Telegram group notification
- [ ] Test status update email
- [ ] Monitor logs for errors

---

**Setup Time:** ~10 minutes
**Status:** Email needs Gmail App Password, Telegram is ready to use
**Next:** Configure Gmail and test the system!
