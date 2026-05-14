-- AlterTable
ALTER TABLE "DistrictTopIssue" ADD COLUMN     "is_local" BOOLEAN,
ADD COLUMN     "is_regional" BOOLEAN,
ADD COLUMN     "is_state" BOOLEAN,
ADD COLUMN     "is_federal" BOOLEAN;
