-- AlterTable
ALTER TABLE "Jetton" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "network" INTEGER NOT NULL DEFAULT 0;
