-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "proUntil" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false;
