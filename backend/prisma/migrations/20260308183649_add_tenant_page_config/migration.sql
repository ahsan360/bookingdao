-- CreateTable
CREATE TABLE "tenant_page_configs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "headline" TEXT,
    "description" TEXT,
    "aboutText" TEXT,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "galleryUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "primaryColor" TEXT DEFAULT '#4F46E5',
    "phone" TEXT,
    "address" TEXT,
    "socialFacebook" TEXT,
    "socialInstagram" TEXT,
    "socialWhatsapp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_page_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_page_configs_tenantId_key" ON "tenant_page_configs"("tenantId");

-- CreateIndex
CREATE INDEX "tenant_page_configs_tenantId_idx" ON "tenant_page_configs"("tenantId");

-- AddForeignKey
ALTER TABLE "tenant_page_configs" ADD CONSTRAINT "tenant_page_configs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
