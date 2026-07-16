-- CreateEnum
CREATE TYPE "SUBSCRIPTION" AS ENUM ('FREE', 'PRO');

-- CreateEnum
CREATE TYPE "INTEGRATIONS" AS ENUM ('INSTAGRAM');

-- CreateEnum
CREATE TYPE "LISTENERS" AS ENUM ('MESSAGE', 'SMARTAI');

-- CreateEnum
CREATE TYPE "MEDIATYPE" AS ENUM ('IMAGE', 'VIDEO', 'CAROUSEL_ALBUM');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "credentialID" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "additionalEmail" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID,
    "plan" "SUBSCRIPTION" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Automations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL DEFAULT 'Untitled',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "userId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Automations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integrations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" "INTEGRATIONS" NOT NULL DEFAULT 'INSTAGRAM',
    "userId" UUID,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "instagramId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trigger" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,
    "automationId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trigger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listener" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,
    "automationId" UUID,
    "listener" "LISTENERS" NOT NULL DEFAULT 'MESSAGE',
    "prompt" TEXT NOT NULL,
    "commendReply" TEXT,
    "dmContent" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "commentReply" TEXT,

    CONSTRAINT "Listener_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dms" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "automationId" UUID,
    "senderId" TEXT,
    "reciever" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Posts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "postId" TEXT NOT NULL,
    "caption" TEXT,
    "media" TEXT NOT NULL,
    "mediaType" "MEDIATYPE" NOT NULL DEFAULT 'IMAGE',
    "automationId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Keywords" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "word" TEXT NOT NULL,
    "automationId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Keywords_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_credentialID_key" ON "User"("credentialID");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Integrations_token_key" ON "Integrations"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Integrations_instagramId_key" ON "Integrations"("instagramId");

-- CreateIndex
CREATE UNIQUE INDEX "Keywords_automationId_word_key" ON "Keywords"("automationId", "word");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Automations" ADD CONSTRAINT "Automations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integrations" ADD CONSTRAINT "Integrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trigger" ADD CONSTRAINT "Trigger_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "Automations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listener" ADD CONSTRAINT "Listener_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "Automations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dms" ADD CONSTRAINT "Dms_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "Automations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Posts" ADD CONSTRAINT "Posts_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "Automations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Keywords" ADD CONSTRAINT "Keywords_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "Automations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

