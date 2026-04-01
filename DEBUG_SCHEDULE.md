# Schedule Creation Debugging Guide

## Quick Checks

### 1. Check if Backend is Running
Open browser and go to: `http://localhost:5000/health`

You should see:
```json
{
  "status": "ok",
  "timestamp": "...",
  "redis": "connected"
}
```

### 2. Check Browser Console
1. Open browser (F12)
2. Go to Console tab
3. Try to create a schedule
4. Look for error messages

### 3. Check Network Tab
1. Open browser (F12)
2. Go to Network tab
3. Try to create a schedule
4. Click on the failed request
5. Check the Response tab for error details

## Common Errors & Solutions

### Error: "Failed to create schedule" (500)

**Possible causes:**
1. Database not migrated
2. Missing tenantId
3. Invalid data format

**Solution:**
```cmd
cd d:\Projects\Booking\backend
npx prisma migrate dev
npx prisma generate
```

### Error: "Unauthorized" (401)

**Cause:** Not logged in or token expired

**Solution:**
1. Logout
2. Login again
3. Try creating schedule

### Error: "Validation failed" (400)

**Cause:** Invalid form data

**Check:**
- Schedule name is not empty
- Day of week is 0-6
- Times are in HH:mm format (e.g., 09:00)
- Slot duration is 15, 30, or 60

### Error: Network request failed

**Cause:** Backend not running or wrong URL

**Solution:**
1. Check backend is running on port 5000
2. Check `.env.local` has: `NEXT_PUBLIC_API_URL=http://localhost:5000/api`

## Manual Test

### Using Browser Console

1. Open browser console (F12)
2. Paste this code:

```javascript
// Get your token from localStorage
const token = localStorage.getItem('token');

// Try to create a schedule
fetch('http://localhost:5000/api/schedules', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Test Schedule',
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30
  })
})
.then(res => res.json())
.then(data => console.log('Success:', data))
.catch(err => console.error('Error:', err));
```

3. Check the console output

## Check Backend Logs

Look at your backend terminal for error messages. Common errors:

### "Cannot find module 'ioredis'"
**Solution:** Run `npm install ioredis sslcommerz-lts uuid`

### "Invalid `prisma.schedule.create()`"
**Solution:** Run `npx prisma generate`

### "Redis connection failed"
**Solution:** Start Redis: `docker run -d --name my-redis -p 6379:6379 redis:latest`

## What Information to Provide

If still not working, please provide:

1. **Error message from toast notification**
2. **Browser console errors** (F12 → Console tab)
3. **Network request details** (F12 → Network tab → Click failed request → Response)
4. **Backend terminal output** (any error messages)

This will help identify the exact issue!
