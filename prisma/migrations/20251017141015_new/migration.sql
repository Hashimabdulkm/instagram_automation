-- DropIndex
DROP INDEX "public"."replyjob_status_nextattempt_idx";

-- DropIndex
DROP INDEX "public"."Subcategory_userId_idx";

-- AlterTable
ALTER TABLE "ReplyJob" ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "nextAttemptAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);
