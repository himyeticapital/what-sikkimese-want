# Admin Dashboard Guide - What Sikkimese Want!

## Accessing the Dashboard

1. **Start the server**
   ```bash
   npm start
   ```

2. **Navigate to admin page**
   - URL: `http://localhost:3000/admin`
   - Or click "Admin" link if you add one to the main site

3. **Login Credentials**
   - Username: `admin`
   - Password: `admin123`

   **⚠️ IMPORTANT**: Change these in production!

---

## Dashboard Overview

### Statistics Cards

At the top of the dashboard, you'll see:

1. **Total Requests** - All submissions ever made
2. **Pending** - Requests awaiting review (Yellow)
3. **Approved** - Requests that were approved (Green)
4. **Rejected** - Requests that were rejected (Red)

---

## Filtering Requests

Use the filter section to find specific requests:

### Filter by Status
- **All Status** - Show everything
- **Pending** - New submissions needing review
- **Approved** - Approved requests
- **Rejected** - Rejected requests
- **In Progress** - Currently being worked on

### Filter by District
- Gangtok
- Mangan
- Namchi
- Gyalshing
- Pakyong
- Soreng

### Filter by Priority
- Low
- Medium
- High
- Urgent

**How to use filters:**
1. Select your filters
2. Click "Apply Filters"
3. Click "Clear" to reset

---

## Viewing Request Details

### Request Table Columns

- **Ref ID** - Unique reference number (e.g., SKM123456789)
- **Name** - Citizen's name
- **District** - Which district
- **Amenities** - What they requested (shows first 2)
- **Priority** - Low, Medium, High, or Urgent
- **Status** - Current status with color badge
- **Date** - When submitted
- **Actions** - "View" button

### Viewing Full Details

1. Click the **"View"** button on any request
2. A modal opens showing:

   **Personal Information:**
   - Full name
   - Email address
   - Phone number

   **Location Details:**
   - District
   - Specific location/area

   **Request Details:**
   - All amenities requested
   - Other amenity (if specified)
   - Full description
   - Population benefiting (if provided)
   - Priority level

   **Status Information:**
   - Current status
   - Submission date/time
   - Last updated date/time
   - Previous admin notes (if any)

---

## Managing Requests

### Updating Request Status

In the request details modal:

1. **Select New Status** from dropdown:
   - **Pending** - Initial state
   - **In Progress** - You're working on it
   - **Approved** - Request accepted
   - **Rejected** - Request denied

2. **Add Admin Notes** (optional):
   - Explain your decision
   - Add follow-up information
   - Leave instructions for team

3. **Click "Save Changes"**
   - Status updates immediately
   - Statistics refresh
   - User can be notified (future feature)

### Deleting Requests

⚠️ **Use with caution** - This cannot be undone!

1. Open request details
2. Click "Delete Request" button
3. Confirm deletion
4. Request is permanently removed

**When to delete:**
- Duplicate submissions
- Test entries
- Spam requests
- Invalid data

**When NOT to delete:**
- Legitimate requests (mark as Rejected instead)
- Requests you disagree with
- Low priority items

---

## Best Practices

### Status Workflow

Recommended flow:

```
Pending → In Progress → Approved/Rejected
```

1. **New requests arrive as "Pending"**
   - Review details
   - Check validity
   - Assess priority

2. **Mark as "In Progress" when you start working**
   - Shows team it's being handled
   - Add notes about what you're doing

3. **Approve or Reject when done**
   - Add notes explaining the decision
   - Approve: Request will be fulfilled
   - Reject: Request cannot be fulfilled (explain why)

### Adding Good Admin Notes

**Good notes example:**
```
Approved - Gym request for Gangtok Main Market.
Budget allocated: ₹15 lakhs
Expected completion: March 2026
Contact: Public Works Dept
```

**Poor notes example:**
```
ok
```

**Notes for rejections:**
```
Rejected - Similar facility already exists 2km away at
Central Park. Citizens can use that facility.
```

### Priority Handling

**Urgent (Red):**
- Review within 24 hours
- These are critical needs
- Examples: public toilets, healthcare

**High (Orange):**
- Review within 3 days
- Important but not critical

**Medium (Yellow):**
- Review within 1 week
- Standard requests

**Low (Blue):**
- Review when possible
- Nice-to-have items

---

## Exporting Data (Manual)

Currently, to export data:

1. Open browser console (F12)
2. Run this command:
   ```javascript
   fetch('/api/requests')
     .then(r => r.json())
     .then(data => {
       const json = JSON.stringify(data.requests, null, 2);
       console.log(json);
       // Copy and save to file
     });
   ```

Or check the SQLite database directly:
```bash
sqlite3 amenities.db "SELECT * FROM requests;"
```

---

## Keyboard Shortcuts

- **Esc** - Close modal
- **F5** - Refresh page to see new submissions

---

## Database Location

All data is stored in:
```
/Users/milann.eth/Desktop/Vibecodin 1/amenities.db
```

**Backup regularly!**
```bash
cp amenities.db amenities_backup_$(date +%Y%m%d).db
```

---

## Troubleshooting

### Can't login
- Check username: `admin`
- Check password: `admin123`
- Make sure server is running

### No requests showing
- Make sure users submitted requests
- Check filters - clear them
- Refresh the page

### Request details won't load
- Check browser console for errors
- Make sure server is running
- Try refreshing the page

### Changes not saving
- Check network connection
- Check browser console for errors
- Make sure you clicked "Save Changes"

---

## Changing Admin Password

Edit `server.js` around line 42:

```javascript
// Change these values:
insertAdmin.run('your-username', 'your-secure-password');
```

Then restart the server:
```bash
# Stop server (Ctrl+C)
# Delete old database to reset
rm amenities.db
# Start server again
npm start
```

**For production, implement proper password hashing!**

---

## Security Tips

1. **Change default password immediately**
2. **Never share admin credentials**
3. **Use strong passwords in production**
4. **Enable HTTPS for production**
5. **Regular backups of database**
6. **Monitor suspicious activity**
7. **Limit admin access to trusted staff**

---

## Future Enhancements

Features we can add:

- [ ] Email notifications when status changes
- [ ] Export to CSV/Excel
- [ ] Bulk actions (approve multiple)
- [ ] User management (multiple admins)
- [ ] Activity logs
- [ ] Advanced analytics
- [ ] Map view of requests
- [ ] File attachments
- [ ] Auto-assignment to departments
- [ ] Mobile app for admins

---

## Support

For technical issues:
1. Check browser console (F12 → Console tab)
2. Check server logs in terminal
3. Review database: `sqlite3 amenities.db`

---

**Remember**: The admin dashboard is powerful - use it responsibly! Every action you take affects real citizens and their communities.
