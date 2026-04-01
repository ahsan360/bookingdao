# Quick Fix for "Cannot find module 'uuid'" Error

## The Problem
Your backend is crashing because the `uuid` package (and likely `ioredis` and `sslcommerz-lts`) are not installed.

## Solution

**Open Command Prompt (cmd) and run:**

```cmd
cd d:\Projects\Booking\backend
npm install ioredis sslcommerz-lts uuid
npm install --save-dev @types/uuid
```

Wait for installation to complete, then restart your backend:

```cmd
npm run dev
```

## What These Packages Do

- **uuid** - Generates unique IDs for payments and idempotency
- **ioredis** - Redis client for slot locking
- **sslcommerz-lts** - SSL Commerz payment gateway SDK

## After Installation

Your backend should start successfully and show:
```
🚀 Server running on port 5000
📍 Environment: development
🔴 Redis: ✅ Connected
```

Then you can create schedules without errors!
