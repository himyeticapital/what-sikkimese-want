# Quick Start Guide
## Get Your Notification System Running in 10 Minutes

---

## ✅ What's Already Done

- ✅ All code implemented
- ✅ Telegram bot created and configured
- ✅ All 6 district Chat IDs captured
- ✅ Dependencies installed
- ✅ Server tested and working

---

## ⚡ Quick Setup (10 Minutes)

### Step 1: Configure Gmail (5 minutes)

1. **Go to Gmail 2FA Settings**
   - Visit: https://myaccount.google.com/security
   - Enable "2-Step Verification" if not already enabled

2. **Generate App Password**
   - Visit: https://myaccount.google.com/apppasswords
   - Select App: **Mail**
   - Select Device: **Other (Custom name)**
   - Name it: **Sikkim Portal**
   - Click **Generate**
   - Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)

3. **Update .env File**
   ```bash
   # Open .env file in your editor
   # Find this line:
   EMAIL_PASSWORD=your_gmail_app_password_here

   # Replace with your actual app password:
   EMAIL_PASSWORD=abcd efgh ijkl mnop
   ```

   **Important:** Remove spaces between characters, so it becomes:
   ```bash
   EMAIL_PASSWORD=abcdefghijklmnop
   ```

### Step 2: Start Server (1 minute)

```bash
cd "/Users/milann.eth/Desktop/Vibecodin 1"
node server.js
```

**Expected Output:**
```
Server running on port 3000
Database initialized successfully

📧 Initializing notification services...
✅ Email service initialized: gmail
✅ Telegram bot initialized
✅ Notification services ready
```

### Step 3: Test It (4 minutes)

1. **Open your website** in browser: `http://localhost:3000`

2. **Submit a test request:**
   - Fill in your personal email
   - Choose any district (e.g., Gangtok)
   - Add some amenities
   - Submit

3. **Check your email inbox** (should arrive within 10 seconds)
   - Look for: "Request Received - Ref: SKMXXXXXXX"
   - Open and verify it looks good

4. **Check Telegram group** for the district you selected
   - You should see a formatted message with request details

5. **Test status update:**
   - Go to admin panel: `http://localhost:3000/admin.html`
   - Login (username: `admin`, password: `admin123`)
   - Find your test request
   - Change status to "In Progress"
   - Add admin notes
   - Save
   - Check your email for status update

---

## 🎯 What You'll See

### In Email:
- **Confirmation Email:**
  - Subject: "Request Received - Ref: SKMXXXXXX"
  - Beautiful branded template
  - Your reference ID
  - Request details
  - Tracking link

- **Status Update Email:**
  - Subject: "[Status Update] Your Request - Ref: SKMXXXXXX"
  - Shows status change (Pending → In Progress)
  - Includes admin notes
  - Guidance on next steps

### In Telegram:
- **New Request Message:**
  ```
  🆕 New Amenity Request

  📍 District: Gangtok
  🏘️ Location: Your location
  👤 Submitted by: Your name

  🏗️ Amenities Requested:
    • Public Toilet
    • Street Lighting

  🔗 Reference ID: SKMXXXXXX
  ⏰ Submitted: [timestamp]
  ```

---

## 🐛 Troubleshooting

### "Email service not configured" warning?
- Check `EMAIL_SERVICE=gmail` in `.env`
- Check `EMAIL_PASSWORD` is set (no spaces)
- Restart server

### Email not received?
- Check spam folder
- Verify Gmail App Password is correct (16 chars, no spaces)
- Check server logs for error messages
- Make sure 2FA is enabled on Gmail

### Telegram not posting?
- Already configured, should work automatically
- Check server logs for errors
- Verify bot is still admin in groups

### Server won't start?
```bash
# Check if dependencies are installed
npm install

# Check if .env file exists
ls -la .env

# Check for port conflicts
lsof -i :3000
```

---

## 📊 Verification Checklist

- [ ] Gmail App Password generated
- [ ] `.env` file updated with password
- [ ] Server starts without errors
- [ ] See "✅ Email service initialized: gmail"
- [ ] See "✅ Telegram bot initialized"
- [ ] Submit test request
- [ ] Receive confirmation email
- [ ] See Telegram notification in group
- [ ] Update status in admin panel
- [ ] Receive status update email

---

## 🚀 Deploy to Production

When ready to deploy:

1. **Update DOMAIN in .env:**
   ```bash
   DOMAIN=https://your-actual-domain.com
   ```

2. **Commit code to Git:**
   ```bash
   git add .
   git commit -m "Add email and Telegram notification features"
   git push
   ```

3. **Set environment variables on hosting platform:**
   - Copy all values from `.env`
   - Set them in your hosting dashboard (Railway/Render/etc.)
   - Don't commit `.env` to Git!

4. **Deploy and test:**
   - Deploy to your hosting platform
   - Submit test request on live site
   - Verify emails and Telegram work

---

## 📞 Support

**Documentation:**
- `NOTIFICATION_SETUP.md` - Detailed setup guide
- `IMPLEMENTATION_SUMMARY.md` - What was built
- `.env.example` - Configuration template

**Server Logs:**
- Watch logs while testing: `node server.js`
- Look for ✅ success messages
- Look for ❌ error messages

**Common Issues:**
- Email not sending → Check Gmail App Password
- Telegram not posting → Check bot is admin
- Server errors → Check `.env` configuration

---

## ✨ You're Done!

Once you complete these 3 steps, your notification system is fully operational:

1. ✅ Gmail App Password → EMAIL notifications
2. ✅ Server running → System active
3. ✅ Test request → Verify it works

**Time:** ~10 minutes
**Difficulty:** Easy
**Cost:** FREE

Enjoy your automated notification system! 🎉
