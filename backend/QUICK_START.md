# Installation Commands

## Step 1: Install Dependencies

Open **Command Prompt** (not PowerShell) and run:

```cmd
cd d:\Projects\Booking\backend
npm install ioredis sslcommerz-lts uuid
npm install --save-dev @types/uuid
```

## Step 2: Generate Encryption Key

```cmd
node generate-encryption-key.js
```

Copy the generated key and update `.env` file with it.

## Step 3: Run Database Migration

```cmd
npm run prisma:migrate
npm run prisma:generate
```

## Step 4: Start Server

```cmd
npm run dev
```

## Step 5: Verify

Check that Redis is connected in the console output.

Visit: http://localhost:5000/health

You should see:
```json
{
  "status": "ok",
  "timestamp": "...",
  "redis": "connected"
}
```

---

For detailed instructions, see [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)
