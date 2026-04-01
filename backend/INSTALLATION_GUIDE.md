# SSL Commerz Payment Integration - Installation Guide

## Prerequisites

1. **Redis** - Already running via Docker ✅
   ```bash
   docker run -d --name my-redis -p 6379:6379 redis:latest
   ```

2. **Node.js** - Already installed

## Installation Steps

### Step 1: Install Dependencies

Due to PowerShell execution policy, you need to install npm packages using one of these methods:

**Option A: Use CMD instead of PowerShell**
```cmd
cd d:\Projects\Booking\backend
npm install ioredis sslcommerz-lts uuid
npm install --save-dev @types/uuid
```

**Option B: Temporarily allow PowerShell scripts**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
cd d:\Projects\Booking\backend
npm install ioredis sslcommerz-lts uuid
npm install --save-dev @types/uuid
```

**Option C: Use npx**
```powershell
cd d:\Projects\Booking\backend
npx npm install ioredis sslcommerz-lts uuid
npx npm install --save-dev @types/uuid
```

### Step 2: Update Environment Variables

Update your `.env` file with the following:

```env
# Add these new variables to your existing .env file
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# SSL Commerz Configuration (use sandbox for testing)
SSLCOMMERZ_STORE_ID=your_store_id_here
SSLCOMMERZ_STORE_PASSWORD=your_store_password_here
SSLCOMMERZ_IS_SANDBOX=true

# Slot Lock Configuration
SLOT_LOCK_TTL_SECONDS=600

# Encryption Key (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_KEY=generate_a_random_32_byte_hex_string

# Frontend URL (for payment redirects)
FRONTEND_URL=http://localhost:3000

# Backend URL (for payment callbacks)
BACKEND_URL=http://localhost:5000
```

### Step 3: Generate Encryption Key

Run this command to generate a secure encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as the `ENCRYPTION_KEY` value in your `.env` file.

### Step 4: Run Database Migration

```bash
cd d:\Projects\Booking\backend
npm run prisma:migrate
```

This will create a new migration for:
- PaymentGatewayConfig model
- Updated Payment model (SSL Commerz fields)
- Updated Appointment model (lockedUntil field)

### Step 5: Generate Prisma Client

```bash
npm run prisma:generate
```

This will regenerate the Prisma client with the new models and fields, fixing all TypeScript errors.

### Step 6: Verify Redis Connection

Make sure Redis is running:

```bash
docker ps
```

You should see `my-redis` in the list.

### Step 7: Start the Server

```bash
npm run dev
```

Check the console output for:
- ✅ Redis connected
- 🚀 Server running on port 5000

### Step 8: Test the Health Endpoint

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-06T08:17:00.000Z",
  "redis": "connected"
}
```

## SSL Commerz Credentials

### For Testing (Sandbox)

1. Visit: https://developer.sslcommerz.com/registration/
2. Register for a sandbox account
3. Get your Store ID and Store Password from the dashboard
4. Update `.env` with these credentials

### For Production

1. Contact SSL Commerz for production credentials
2. Set `SSLCOMMERZ_IS_SANDBOX=false` in `.env`
3. Update Store ID and Password with production values

## Next Steps

1. Configure payment gateway in admin panel:
   - POST `/api/admin/payment-config` with SSL Commerz credentials
   
2. Test the payment flow:
   - Create an appointment (slot gets locked in Redis)
   - Initialize payment
   - Complete payment via SSL Commerz
   - Verify appointment is confirmed

## Troubleshooting

### Redis Connection Issues

If Redis fails to connect:
```bash
# Check if Redis is running
docker ps

# Restart Redis
docker restart my-redis

# Check Redis logs
docker logs my-redis
```

### TypeScript Errors

If you see TypeScript errors about missing types:
```bash
npm run prisma:generate
```

### Migration Errors

If migration fails:
```bash
# Reset database (WARNING: This deletes all data)
npx prisma migrate reset

# Or create a new migration
npx prisma migrate dev --name ssl_commerz_integration
```

## Testing Payment Flow

1. **Create Appointment** (locks slot for 10 minutes):
   ```bash
   POST /api/appointments
   {
     "customerName": "John Doe",
     "customerPhone": "01712345678",
     "customerEmail": "john@example.com",
     "appointmentDate": "2026-02-10",
     "startTime": "10:00"
   }
   ```

2. **Initialize Payment**:
   ```bash
   POST /api/payments/init
   {
     "appointmentId": "appointment_id_from_step_1",
     "amount": 1000
   }
   ```

3. **Complete Payment**:
   - Visit the `gatewayPageURL` returned from step 2
   - Use SSL Commerz sandbox test cards
   - Complete payment

4. **Verify Appointment**:
   ```bash
   GET /api/appointments/{appointmentId}
   ```
   Status should be "confirmed"

## Important Notes

- Slot locks expire after 10 minutes (configurable via `SLOT_LOCK_TTL_SECONDS`)
- Failed/cancelled payments automatically release the slot
- Idempotency keys prevent duplicate payments
- All payment callbacks are handled automatically
