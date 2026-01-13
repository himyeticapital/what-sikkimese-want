# Deployment Guide - What Sikkimese Want!

## Quick Start (Local Network)

### 1. Find Your Local IP Address

**On Mac:**
```bash
ipconfig getifaddr en0
```
You'll get something like: `192.168.1.5`

**On Windows:**
```bash
ipconfig
```
Look for "IPv4 Address"

### 2. Update Server Configuration

Edit `server.js` to allow external connections:

```javascript
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Network access: http://YOUR_IP:${PORT}`);
});
```

### 3. Update Frontend API URL

Edit `script.js` and `admin-script.js`:

Replace:
```javascript
const API_URL = 'http://localhost:3000/api';
```

With your IP:
```javascript
const API_URL = 'http://192.168.1.5:3000/api';
```

### 4. Share the URLs

- **User Portal**: `http://YOUR_IP:3000`
- **Admin Dashboard**: `http://YOUR_IP:3000/admin`

**Note**: Users must be on the same WiFi network.

---

## Production Deployment

### Option 1: Deploy to Heroku (Free Tier Available)

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Create Heroku App**
   ```bash
   heroku login
   heroku create what-sikkimese-want
   ```

3. **Update server.js for production**
   ```javascript
   const PORT = process.env.PORT || 3000;
   ```

4. **Create Procfile**
   ```
   web: node server.js
   ```

5. **Deploy**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```

6. **Open your app**
   ```bash
   heroku open
   ```

### Option 2: Deploy to Railway (Recommended)

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Node.js and deploys
6. Get your public URL: `https://your-app.railway.app`

### Option 3: Deploy to Vercel + PlanetScale

**Backend** (Railway or Render):
- Deploy Node.js backend to Railway/Render
- Get API URL: `https://api.yourapp.com`

**Frontend** (Vercel):
1. Update API URLs in `script.js` and `admin-script.js`
2. Deploy to Vercel:
   ```bash
   npm install -g vercel
   vercel
   ```

**Database** (PlanetScale):
1. Migrate from SQLite to MySQL
2. Create PlanetScale account
3. Update connection strings

### Option 4: VPS Deployment (DigitalOcean/AWS/Linode)

1. **Get a VPS** (~$5-10/month)
   - DigitalOcean Droplet
   - AWS EC2
   - Linode

2. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone your project**
   ```bash
   git clone your-repo
   cd your-repo
   npm install
   ```

4. **Install PM2 (Process Manager)**
   ```bash
   sudo npm install -g pm2
   pm2 start server.js
   pm2 save
   pm2 startup
   ```

5. **Setup Nginx as reverse proxy**
   ```bash
   sudo apt install nginx
   ```

   Create `/etc/nginx/sites-available/whatsiikkimesewant`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **Enable site and restart Nginx**
   ```bash
   sudo ln -s /etc/nginx/sites-available/whatsikkimesewant /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

### Option 5: Quick & Easy - ngrok (Testing Only)

1. **Install ngrok**
   ```bash
   npm install -g ngrok
   ```

2. **Start your server**
   ```bash
   npm start
   ```

3. **In another terminal, start ngrok**
   ```bash
   ngrok http 3000
   ```

4. **Share the public URL**
   - ngrok provides: `https://abc123.ngrok.io`
   - Share this URL with anyone
   - Works worldwide (no same-network restriction)

**Note**: Free ngrok URLs change every time you restart. Not suitable for production.

---

## Environment Variables

Create `.env` file for production:

```env
PORT=3000
NODE_ENV=production
DATABASE_URL=your_database_url
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
SESSION_SECRET=your_random_secret_key
```

Update `server.js`:
```javascript
require('dotenv').config();
const PORT = process.env.PORT || 3000;
```

---

## Database Migration (SQLite → PostgreSQL)

For production, migrate from SQLite to PostgreSQL:

1. **Install PostgreSQL driver**
   ```bash
   npm install pg
   ```

2. **Update server.js** to use PostgreSQL instead of SQLite

3. **Use migration tool**
   ```bash
   npm install knex
   npx knex migrate:make initial_schema
   ```

---

## Security Checklist for Production

- [ ] Change default admin credentials
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS/SSL
- [ ] Add rate limiting
- [ ] Implement proper authentication (JWT)
- [ ] Hash passwords with bcrypt
- [ ] Add CSRF protection
- [ ] Sanitize all inputs
- [ ] Set up CORS properly
- [ ] Enable compression
- [ ] Set security headers
- [ ] Regular backups

---

## Monitoring & Analytics

Add monitoring services:
- **Uptime**: UptimeRobot (free)
- **Errors**: Sentry (free tier)
- **Analytics**: Google Analytics or Plausible
- **Logs**: Papertrail or Logtail

---

## Cost Comparison

| Platform | Cost | Best For |
|----------|------|----------|
| Heroku | $7/month | Simple deployment |
| Railway | $5/month | Modern apps |
| Vercel | Free | Frontend hosting |
| DigitalOcean | $6/month | Full control |
| AWS EC2 | $5-20/month | Scalability |
| ngrok | Free (testing) | Development |

---

## Quick Production Setup (Railway - 5 minutes)

1. Push code to GitHub
2. Go to railway.app
3. "New Project" → "Deploy from GitHub"
4. Railway auto-deploys
5. Get your URL
6. Done!

**Your app is now live worldwide! 🚀**
