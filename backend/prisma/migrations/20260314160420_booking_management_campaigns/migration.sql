-- Step 1: Add new columns to users as nullable first
ALTER TABLE "users" ADD COLUMN "firstName" TEXT;
ALTER TABLE "users" ADD COLUMN "lastName" TEXT;
ALTER TABLE "users" ADD COLUMN "phone" TEXT;
ALTER TABLE "users" ADD COLUMN "phoneVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;

-- Step 2: Migrate existing name data to firstName/lastName
UPDATE "users" SET
    "firstName" = SPLIT_PART("name", ' ', 1),
    "lastName" = CASE
        WHEN POSITION(' ' IN "name") > 0
        THEN SUBSTRING("name" FROM POSITION(' ' IN "name") + 1)
        ELSE ''
    END
WHERE "name" IS NOT NULL;

-- Step 3: Set defaults for any remaining nulls
UPDATE "users" SET "firstName" = 'User' WHERE "firstName" IS NULL;
UPDATE "users" SET "lastName" = '' WHERE "lastName" IS NULL;

-- Step 4: Make firstName/lastName required, drop name
ALTER TABLE "users" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "lastName" SET NOT NULL;
ALTER TABLE "users" DROP COLUMN "name";

-- Step 5: Make email optional, tenantId optional
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "users" ALTER COLUMN "tenantId" DROP NOT NULL;

-- Step 6: Add unique constraint on phone
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- Step 7: Make tenant email optional
ALTER TABLE "tenants" ALTER COLUMN "email" DROP NOT NULL;

-- Step 8: Make audit log userEmail optional
ALTER TABLE "audit_logs" ALTER COLUMN "userEmail" DROP NOT NULL;

-- Step 9: Add completedAt to appointments
ALTER TABLE "appointments" ADD COLUMN "completedAt" TIMESTAMP(3);

-- Step 10: Create OTP verifications table
CREATE TABLE "otp_verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_verifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "otp_verifications_identifier_type_idx" ON "otp_verifications"("identifier", "type");

-- Step 11: Create campaigns table
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "failCount" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "campaigns_tenantId_idx" ON "campaigns"("tenantId");
CREATE INDEX "campaigns_tenantId_createdAt_idx" ON "campaigns"("tenantId", "createdAt");

ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
