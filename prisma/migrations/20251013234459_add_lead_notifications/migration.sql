-- CreateTable
CREATE TABLE "LeadNotifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID,
    "automationId" UUID,
    "leadName" TEXT,
    "leadId" TEXT NOT NULL,
    "triggerType" TEXT NOT NULL,
    "message" TEXT,
    "campaignName" TEXT NOT NULL,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadNotifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LeadNotifications" ADD CONSTRAINT "LeadNotifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadNotifications" ADD CONSTRAINT "LeadNotifications_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "Automations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
