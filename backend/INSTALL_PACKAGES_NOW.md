# CRITICAL: Install Missing Packages NOW

## Your backend CANNOT start without these packages!

The packages `uuid`, `ioredis`, and `sslcommerz-lts` are **NOT INSTALLED**.

---

## STEP-BY-STEP INSTRUCTIONS

### Step 1: Close PowerShell (if open)
PowerShell is blocking npm commands. You MUST use Command Prompt.

### Step 2: Open Command Prompt
1. Press `Windows Key + R`
2. Type: `cmd`
3. Press Enter

You should see a black window with: `C:\Users\FC>`

### Step 3: Navigate to Backend Folder
Copy and paste this command:
```cmd
cd d:\Projects\Booking\backend
```
Press Enter.

### Step 4: Install Packages
Copy and paste this command:
```cmd
npm install ioredis sslcommerz-lts uuid
```
Press Enter and **wait** for it to complete (30-60 seconds).

You should see:
```
added 50 packages, and audited 200 packages in 30s
```

### Step 5: Install TypeScript Types
Copy and paste this command:
```cmd
npm install --save-dev @types/uuid
```
Press Enter.

### Step 6: Verify Installation
Copy and paste this command:
```cmd
dir node_modules\uuid
```
Press Enter.

You should see a folder listing (not an error).

### Step 7: Start Backend
Copy and paste this command:
```cmd
npm run dev
```
Press Enter.

You should see:
```
🚀 Server running on port 5000
📍 Environment: development
🔴 Redis: ✅ Connected
```

---

## If You See Errors

### "npm : File ... cannot be loaded"
❌ You're still in PowerShell!
✅ Close it and use Command Prompt (cmd)

### "npm ERR! code ENOENT"
❌ You're not in the backend folder
✅ Run: `cd d:\Projects\Booking\backend`

### Still not working?
Run the batch file:
```cmd
d:\Projects\Booking\backend\setup.bat
```

---

## After Successful Installation

1. Backend will start without errors
2. Go to `http://localhost:3000/dashboard/schedules`
3. Create a schedule
4. You'll see a **green success toast**! ✅
