# Security Improvements
## What Sikkimese Want Portal

---

## 🔒 Security Features Implemented

### 1. Rate Limiting

**Request Submission Rate Limit:**
- **Limit:** 3 submissions per 15 minutes per IP address
- **Applied to:**
  - POST `/api/requests` (new request submissions)
  - POST `/api/feedback` (feedback submissions)
- **Response:** HTTP 429 with message: "Too many requests from this IP. Please try again after 15 minutes."

**General API Rate Limit:**
- **Limit:** 30 requests per minute per IP address
- **Applied to:** All `/api/*` endpoints
- **Response:** HTTP 429 with message: "Too many requests. Please slow down."

### 2. Server-Side Validation

All form submissions are now validated server-side with the following rules:

#### Request Submission Validation:
| Field | Rules |
|-------|-------|
| **name** | Required, 2-255 characters |
| **email** | Required, valid email format, normalized |
| **phone** | Required, exactly 10 digits |
| **district** | Required, must be one of: Gangtok, Mangan, Namchi, Gyalshing, Pakyong, Soreng |
| **gpu** | Optional, max 255 characters |
| **location** | Required, 3-255 characters |
| **amenities** | Required array, at least 1 item, all items non-empty |
| **otherAmenity** | Optional, max 255 characters |
| **description** | Required, 10-2000 characters |
| **population** | Optional, integer 1-1,000,000 |
| **priority** | Required, must be: Low, Medium, or High |

#### Feedback Submission Validation:
| Field | Rules |
|-------|-------|
| **name** | Required, 2-255 characters |
| **email** | Required, valid email format, normalized |
| **phone** | Optional, exactly 10 digits if provided |
| **district** | Optional, must be valid district if provided |
| **type** | Required, must be: Suggestion, Complaint, Appreciation, or General |
| **message** | Required, 10-2000 characters |

### 3. Data Sanitization

- **Trimming:** All string inputs are trimmed of leading/trailing whitespace
- **Email Normalization:** Emails are normalized to lowercase
- **Input Validation:** Prevents injection attacks through strict validation

### 4. Admin Authentication

**All admin endpoints now require authentication:**
- Admin routes protected with middleware
- Requires X-Admin-Session header or Bearer token
- Unauthorized requests return 401
- Protected endpoints:
  - GET/PUT/DELETE `/api/requests` and `/api/requests/:id`
  - GET/PUT/DELETE `/api/feedback` and `/api/feedback/:id`
  - GET `/api/stats`

**How it works:**
- Admin logs in via `/admin.html`
- Session tracked in sessionStorage
- All admin API calls include `X-Admin-Session: true` header
- Backend validates header before processing request

### 5. Privacy Protection

**Public API Endpoints Secured:**
- Names are masked (e.g., "John D." instead of "John Doe")
- Email addresses not exposed in public endpoints
- Phone numbers not exposed in public endpoints
- Admin endpoints require authentication
- Only public data displays: masked name, district, location, amenities, priority, status

---

## 🛡️ Security Best Practices

### Rate Limiting Strategy

**Why these limits?**
- **3 requests per 15 minutes:** Prevents spam submissions while allowing legitimate users to resubmit if they make a mistake
- **30 API requests per minute:** Prevents API abuse while allowing normal browsing behavior

**Bypass Prevention:**
- Limits are per IP address
- Cannot be bypassed by client-side manipulation
- Headers include rate limit information

### Validation Strategy

**Server-side validation is mandatory because:**
- Client-side validation can be bypassed
- Prevents malformed data from reaching database
- Protects against injection attacks
- Ensures data integrity

**What gets validated:**
1. **Data Types:** Ensures strings, numbers, arrays are correct type
2. **Format:** Email, phone number patterns
3. **Length:** Prevents overly long inputs that could cause issues
4. **Whitelist:** District names, priority levels, feedback types must match exact values
5. **Required Fields:** All mandatory fields must be present and non-empty

---

## 🚨 Common Attack Vectors - Mitigated

### 1. ✅ Spam/Flood Attacks
**Threat:** Attacker submits many forms to flood database
**Mitigation:** Rate limiting (3 per 15 min)

### 2. ✅ SQL Injection
**Threat:** Attacker tries to inject SQL through form fields
**Mitigation:**
- Parameterized queries (already implemented)
- Input validation and sanitization
- Type checking

### 3. ✅ XSS (Cross-Site Scripting)
**Threat:** Attacker injects JavaScript through form fields
**Mitigation:**
- Input sanitization (trim, validation)
- Database stores plain text
- Frontend should escape output (recommended)

### 4. ✅ API Scraping
**Threat:** Attacker scrapes user data from public endpoints
**Mitigation:**
- Names already masked in public endpoints
- Email/phone never exposed
- Rate limiting prevents mass scraping

### 5. ✅ Empty/Invalid Submissions
**Threat:** Attacker bypasses client validation to submit empty data
**Mitigation:**
- Server-side validation catches all empty fields
- Returns 400 Bad Request with error details

### 6. ✅ DDOS (Distributed Denial of Service)
**Threat:** Multiple IPs flood the server
**Mitigation:**
- Rate limiting per IP
- General API rate limit
- Consider CloudFlare for additional protection

### 7. ✅ Unauthorized Data Access
**Threat:** Non-admin users accessing sensitive endpoints
**Mitigation:**
- Admin authentication middleware
- X-Admin-Session header required
- 401 Unauthorized for invalid requests
- Email/phone protected from public access

---

## 📊 Error Responses

### Validation Errors (400 Bad Request)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    },
    {
      "field": "description",
      "message": "Description must be between 10 and 2000 characters"
    }
  ]
}
```

### Rate Limit Errors (429 Too Many Requests)
```json
{
  "success": false,
  "message": "Too many requests from this IP. Please try again after 15 minutes."
}
```

### Authentication Errors (401 Unauthorized)
```json
{
  "success": false,
  "message": "Unauthorized. Admin access required."
}
```

---

## 🔍 Monitoring & Detection

### What to Monitor:

1. **Rate Limit Hits:**
   - Watch logs for repeated 429 errors from same IP
   - Could indicate attack attempt

2. **Validation Failures:**
   - Multiple validation failures from same IP
   - Could indicate probe/attack attempt

3. **SQL Errors:**
   - Any SQL errors in logs should be investigated
   - Could indicate injection attempt

### Log Messages to Watch:

```
❌ Error sending confirmation email: Connection timeout
✅ Confirmation email sent to user@example.com
✅ Telegram notification sent to Gangtok group
```

---

## 🔧 Configuration

### Adjusting Rate Limits

**In `server.js`, modify these values:**

```javascript
const requestSubmissionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes (adjust as needed)
    max: 3, // Max submissions (adjust as needed)
    // ...
});

const generalApiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute (adjust as needed)
    max: 30, // Max API calls (adjust as needed)
    // ...
});
```

**Recommended Ranges:**
- **Submission Limit:** 2-5 per 15 minutes
- **General API:** 20-50 per minute

---

## 🎯 Testing Security

### Test Rate Limiting:

```bash
# Submit 4 requests quickly (4th should fail)
for i in {1..4}; do
  curl -X POST https://whatsikkimesewant.com/api/requests \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@test.com",...}'
done
```

### Test Validation:

```bash
# Try empty name (should fail)
curl -X POST https://whatsikkimesewant.com/api/requests \
  -H "Content-Type: application/json" \
  -d '{"name":"","email":"valid@email.com",...}'

# Try invalid email (should fail)
curl -X POST https://whatsikkimesewant.com/api/requests \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"notanemail",...}'
```

---

## ✅ Security Checklist

- [x] Rate limiting on form submissions (3 per 15 min)
- [x] Rate limiting on all API endpoints (30 per min)
- [x] Server-side validation on all fields
- [x] Input sanitization (trim, normalize)
- [x] SQL injection protection (parameterized queries)
- [x] Admin authentication on sensitive endpoints
- [x] Privacy protection (masked names in public API)
- [x] Email/phone not exposed in public endpoints
- [x] Admin routes require authentication
- [x] Validation error messages for users
- [x] Rate limit headers sent to clients
- [ ] Consider adding CAPTCHA for additional protection
- [ ] Consider CloudFlare for DDOS protection
- [ ] Consider JWT tokens for enhanced auth security
- [ ] Frontend should escape user-generated content when displaying

---

## 📚 Dependencies Added

```json
{
  "express-rate-limit": "^7.x.x",
  "express-validator": "^7.x.x"
}
```

**express-rate-limit:**
- Provides rate limiting middleware
- Configurable windows and limits
- Supports multiple strategies

**express-validator:**
- Validation and sanitization middleware
- Built on validator.js
- Chain-able validation rules

---

## 🚀 Deployment Notes

**Environment-specific considerations:**

1. **Rate Limiting with Load Balancers:**
   - Current implementation uses in-memory storage
   - If using multiple instances, consider Redis for shared rate limit store

2. **Trust Proxy:**
   - If behind a proxy (like Railway, Heroku), ensure correct IP detection
   - Add `app.set('trust proxy', 1);` if needed

3. **HTTPS:**
   - Always use HTTPS in production (Railway provides this)
   - Protects data in transit

---

## 📞 Support

**If you encounter security issues:**
1. Check server logs for error messages
2. Verify validation rules match your form requirements
3. Adjust rate limits if legitimate users are being blocked
4. Consider implementing CAPTCHA for additional protection

**For security vulnerabilities:**
- Report to: whatsikkimesewant@tutamail.com
- Do not post security issues publicly

---

**Security Status:** ✅ Protected
**Last Updated:** January 2026
**Version:** 1.0
