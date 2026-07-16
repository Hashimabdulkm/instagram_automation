/*
  Warnings:

  - You are about to drop the `Posts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Posts" DROP CONSTRAINT "Posts_automationId_fkey";

-- AlterTable
ALTER TABLE "Automations" ADD COLUMN     "postIds" TEXT[];

-- DropTable
DROP TABLE "public"."Posts";
