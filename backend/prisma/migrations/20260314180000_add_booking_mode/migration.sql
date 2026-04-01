-- Add bookingMode to tenants (default: "both" allows payment or manual booking)
ALTER TABLE "tenants" ADD COLUMN "bookingMode" TEXT NOT NULL DEFAULT 'both';
