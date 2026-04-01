# URGENT: PowerShell Execution Policy Fix

## The Problem

Your PowerShell execution policy is blocking **ALL npm commands**. This is why you're getting:
```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled
```

## SOLUTION 1: Use Command Prompt (RECOMMENDED)

**DO NOT use PowerShell. Use Command Prompt instead.**

### How to Open Command Prompt:
1. Press `Win + R`
2. Type: `cmd`
3. Press Enter

### Then run these commands:

```cmd
cd d:\Projects\Booking\backend

REM Install dependencies
npm install ioredis sslcommerz-lts uuid
npm install --save-dev @types/uuid

REM Generate encryption key
node generate-encryption-key.js

REM Run migration (say 'y' when asked)
npx prisma migrate dev --name ssl_commerz_integration

REM Generate Prisma client
npx prisma generate

REM Start the server
npm run dev
```

## SOLUTION 2: Fix PowerShell Execution Policy

If you prefer to use PowerShell, run this **as Administrator**:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then close and reopen PowerShell.

## SOLUTION 3: Use the Batch File

Double-click `setup.bat` in the backend folder. It will run everything in Command Prompt automatically.

## What Each Command Does

1. **npm install ioredis sslcommerz-lts uuid** - Installs Redis, SSL Commerz, and UUID packages
2. **node generate-encryption-key.js** - Creates a secure encryption key (copy this!)
3. **npx prisma migrate dev** - Updates your database with new tables
4. **npx prisma generate** - Generates TypeScript types for database
5. **npm run dev** - Starts your backend server

## After Running Commands

1. **Copy the encryption key** from step 2
2. **Update `.env` file** line 22:
   ```
   ENCRYPTION_KEY=<paste_your_key_here>
   ```
3. **Restart the backend** if it's already running

## Verify It's Working

After setup, you should see:
```
🚀 Server running on port 5000
📍 Environment: development
🔴 Redis: ✅ Connected
```

## Still Getting Errors?

Make sure you're using **Command Prompt (cmd)**, NOT PowerShell!

To check which terminal you're using:
- Command Prompt shows: `C:\Users\...>`
- PowerShell shows: `PS C:\Users\...>`
