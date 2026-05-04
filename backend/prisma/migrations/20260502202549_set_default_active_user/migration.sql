/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `ReimbursementRequest` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "ReimbursementRequest" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "deletedAt",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;
