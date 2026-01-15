# Telegram Groups Configuration
## District-Specific Chat IDs

---

## 📱 Bot Information

**Bot Name:** What Sikkimese Want
**Username:** @WhatSikkimeseWantBot
**Bot Token:** `8545832601:AAHz91jQtLC715sW0DCsv58nC_sWW9NF2-k`

---

## 🗺️ District Groups & Chat IDs

### 1. Gangtok District
- **Group Name:** Gangtok District Requests
- **Chat ID:** `-1003302615562`
- **Region:** East Sikkim (Capital)
- **Status:** ✅ Configured

### 2. Mangan District
- **Group Name:** Mangan District Requests
- **Chat ID:** `-5213366605`
- **Region:** North Sikkim
- **Status:** ✅ Configured

### 3. Namchi District
- **Group Name:** Namchi District Requests
- **Chat ID:** `-5043097343`
- **Region:** South Sikkim
- **Status:** ✅ Configured

### 4. Gyalshing District
- **Group Name:** Gyalshing District Requests
- **Chat ID:** `-5203380159`
- **Region:** West Sikkim
- **Status:** ✅ Configured

### 5. Pakyong District
- **Group Name:** Pakyong District Requests (note: typo in group name "Distrct")
- **Chat ID:** `-5288398570`
- **Region:** East Sikkim
- **Status:** ✅ Configured

### 6. Soreng District
- **Group Name:** Soreng District Request (note: singular)
- **Chat ID:** `-5062928127`
- **Region:** West Sikkim
- **Status:** ✅ Configured

---

## 📋 Summary Table

| District   | Region       | Chat ID          | Status |
|------------|--------------|------------------|--------|
| Gangtok    | East Sikkim  | -1003302615562   | ✅     |
| Mangan     | North Sikkim | -5213366605      | ✅     |
| Namchi     | South Sikkim | -5043097343      | ✅     |
| Gyalshing  | West Sikkim  | -5203380159      | ✅     |
| Pakyong    | East Sikkim  | -5288398570      | ✅     |
| Soreng     | West Sikkim  | -5062928127      | ✅     |

---

## ✅ Configuration Status

All 6 district groups have been:
- ✅ Created on Telegram
- ✅ Bot added as admin
- ✅ Chat IDs captured using `getChatIds.js`
- ✅ Configured in `.env` file
- ✅ Tested and verified

---

## 🔧 How Chat IDs Were Captured

**Script Used:** `getChatIds.js`

**Process:**
1. Bot token configured in script
2. Script started with `node getChatIds.js`
3. Test message sent in each group
4. Bot detected messages and logged Chat IDs
5. IDs copied to `.env` file

**Output from getChatIds.js:**
```
✅ Found Group Chat:
   Group Name: Soreng District Request
   Chat ID: -5062928127
   Message from: Elvangelion

✅ Found Group Chat:
   Group Name: Pakyong Distrct Requests
   Chat ID: -5288398570
   Message from: Elvangelion

✅ Found Group Chat:
   Group Name: Gyalshing District Requests
   Chat ID: -5203380159
   Message from: Elvangelion

✅ Found Group Chat:
   Group Name: Namchi District Requests
   Chat ID: -5043097343
   Message from: Elvangelion

✅ Found Group Chat:
   Group Name: Mangan District Requests
   Chat ID: -5213366605
   Message from: Elvangelion

✅ Found Group Chat:
   Group Name: Gangtok District Requests
   Chat ID: -1003302615562
   Message from: Elvangelion
```

---

## 💡 Understanding Chat IDs

**Format:**
- Negative numbers for groups
- Usually 10-13 digits
- Gangtok has different format (starts with -100) - this is normal for supergroups

**Types:**
- Regular Group: `-XXXXXXXXX` (9 digits)
- Supergroup: `-100XXXXXXXXXX` (13 digits)

**Notes:**
- Gangtok is a supergroup (more features, unlimited members)
- Other 5 are regular groups
- Both work the same for bot notifications

---

## 🎯 How Notifications Work

### Request Submitted for Gangtok:
```
User fills form → District: Gangtok
    ↓
Server looks up: districtGroups['Gangtok']
    ↓
Finds Chat ID: -1003302615562
    ↓
Bot sends message to: Gangtok District Requests group
```

### Mapping in Code:
```javascript
const districtGroups = {
    'Gangtok': '-1003302615562',
    'Mangan': '-5213366605',
    'Namchi': '-5043097343',
    'Gyalshing': '-5203380159',
    'Pakyong': '-5288398570',
    'Soreng': '-5062928127'
};
```

---

## 🔐 Security Notes

1. **Bot Token:**
   - Keep private
   - Already in `.env` (not committed to Git)
   - Can regenerate from @BotFather if compromised

2. **Chat IDs:**
   - Not sensitive (public if group is public)
   - Stored in `.env` for convenience
   - Can be changed if groups are recreated

3. **Bot Permissions:**
   - Must be admin to post messages
   - Already configured in all groups
   - Don't remove bot from groups!

---

## 📊 Group Management

### To Add Bot to New Group:
1. Create new group on Telegram
2. Add @WhatSikkimeseWantBot
3. Promote to admin
4. Run `getChatIds.js` to get Chat ID
5. Add to `.env` file
6. Restart server

### To Verify Bot Status:
```bash
# Check if bot is working
curl "https://api.telegram.org/bot8545832601:AAHz91jQtLC715sW0DCsv58nC_sWW9NF2-k/getMe"

# Should return:
{
  "ok": true,
  "result": {
    "id": 8545832601,
    "is_bot": true,
    "first_name": "What Sikkimese Want",
    "username": "WhatSikkimeseWantBot",
    "can_join_groups": true
  }
}
```

### To Test Notification:
```bash
# Send test message to Gangtok group
curl -X POST "https://api.telegram.org/bot8545832601:AAHz91jQtLC715sW0DCsv58nC_sWW9NF2-k/sendMessage" \
  -d "chat_id=-1003302615562" \
  -d "text=Test notification from portal"
```

---

## 🎨 Message Format

Messages sent to groups include:
- 🆕 Icon for new requests
- 📍 District and location
- 👤 Submitter name (first name only)
- 🏗️ Amenities requested
- 📝 Description
- ⚡ Priority (with emoji: 🔴 High, 🟡 Medium, 🟢 Low)
- 🔗 Reference ID
- ⏰ Timestamp
- Link to admin panel

---

## ✅ Verification Completed

Verified by submitting test messages:
- [x] All groups received test messages
- [x] Bot responded with Chat ID confirmation
- [x] Chat IDs captured correctly
- [x] Configured in `.env` file
- [x] Server initialization successful

---

## 📝 Notes

**Group Name Typos:**
- Pakyong: "Distrct" instead of "District"
- Soreng: "Request" (singular) instead of "Requests"

These are just cosmetic and don't affect functionality. You can:
- Keep as is (works fine)
- Rename groups in Telegram settings (Chat IDs stay the same)

**Chat ID Differences:**
- Gangtok has longer ID (supergroup format)
- Others have shorter IDs (regular group format)
- Both work identically for notifications

---

## 🚀 Ready to Use

All Telegram configuration is complete and ready for production use!

**Test by:**
1. Submit request for any district
2. Check respective Telegram group
3. Verify formatted message appears

**No additional setup needed for Telegram!** ✅
