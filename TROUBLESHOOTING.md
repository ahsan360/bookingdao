# Backend & Frontend Not Working - Fix Guide

## Problem Identified

Your backend and frontend are running but **missing critical dependencies** that were added for the SSL Commerz integration. This is why creating sites or any operations aren't working.

## Issues Found

1. ❌ **ioredis** not installed (required for Redis slot locking)
2. ❌ **sslcommerz-lts** not installed (required for payments)
3. ❌ **uuid** not installed (required for idempotency)
4. ❌ **Database migrations** not run (new schema not applied)
5. ⚠️ **PowerShell execution policy** blocking npm commands

## Quick Fix (5 Steps)

### Step 1: Open Command Prompt (NOT PowerShell)

Press `Win + R`, type `cmd`, press Enter

### Step 2: Navigate to Backend Directory

```cmd
cd d:\Projects\Booking\backend
```

### Step 3: Install Missing Dependencies

```cmd
npm install ioredis sslcommerz-lts uuid
npm install --save-dev @types/uuid
```

### Step 4: Generate Encryption Key

```cmd
node generate-encryption-key.js
```

**Copy the generated key** and update line 22 in `.env` file:
```
ENCRYPTION_KEY=<paste_the_generated_key_here>
```

### Step 5: Run Database Migration

```cmd
npx prisma migrate dev --name ssl_commerz_integration
npx prisma generate
```

## Verify Installation

After completing the steps above, verify:

```cmd
npm list ioredis sslcommerz-lts uuid
```

You should see all three packages listed.

## Start the Backend

```cmd
npm run dev
```

You should see:
```
🚀 Server running on port 5000
📍 Environment: development
🔴 Redis: ✅ Connected (or ⏳ Connecting...)
```

## Common Errors & Solutions

### Error: "Cannot find module 'ioredis'"
**Solution**: Dependencies not installed. Repeat Step 3.

### Error: "Invalid `prisma.paymentGatewayConfig`"
**Solution**: Database not migrated. Repeat Step 5.

### Error: "Redis connection failed"
**Solution**: Start Redis Docker container:
```cmd
docker run -d --name my-redis -p 6379:6379 redis:latest
```

### Error: "Encryption key not set"
**Solution**: Update `.env` file with encryption key from Step 4.

## Alternative: Use the Batch Script

If you prefer, double-click `setup.bat` in the backend folder. It will:
1. Install all dependencies
2. Generate encryption key
3. Run migrations
4. Generate Prisma client

**Note**: You'll still need to manually update the `.env` file with the encryption key.

## Frontend Should Work After Backend Fix

The frontend is configured correctly. Once the backend is fixed:

1. Frontend will connect to `http://localhost:5000/api`
2. Registration/Login will work
3. Schedule creation will work
4. Toast notifications will show success/error messages

## Test After Fix

1. Go to `http://localhost:3000/register`
2. Create a new account
3. Login
4. Go to Schedules
5. Create a new schedule
6. You should see a **green success toast** notification!

## Still Having Issues?

Check browser console (F12) for errors and backend terminal for error messages. The toast notifications will now show you the actual error messages from the API.
