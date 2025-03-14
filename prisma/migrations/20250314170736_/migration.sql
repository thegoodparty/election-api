/*
  Warnings:

  - You are about to drop the column `city_largest` on the `Race` table. All the data in the column will be lost.
  - You are about to drop the column `county_density` on the `Race` table. All the data in the column will be lost.
  - You are about to drop the column `county_home_value` on the `Race` table. All the data in the column will be lost.
  - You are about to drop the column `county_income_household_median` on the `Race` table. All the data in the column will be lost.
  - You are about to drop the column `county_name` on the `Race` table. All the data in the column will be lost.
  - You are about to drop the column `county_population` on the `Race` table. All the data in the column will be lost.
  - You are about to drop the column `county_slug` on the `Race` table. All the data in the column will be lost.
  - You are about to drop the column `county_unemployment_rate` on the `Race` table. All the data in the column will be lost.
  - You are about to drop the column `municipality_density` on the `Race` table. All the data in the column will be lost.
  - You are about to drop the column `municipality_home_value` on the `Race` table. All the data in the column will be lost.
  - You are about to drop the column `municipality_income_household_median` on the `Race` table. All the data in the column will be lost.
  - You are about to drop the column `municipality_name` on the `Race` table. All the data in the column will be lost.
  - You are about to drop the column `municipality_popluation` on the `Race` table. All the data in the column will be lost.
  - You are about to drop the column `municipality_slug` on the `Race` table. All the data in the column will be lost.
  - You are about to drop the column `municipality_unemployment_rate` on the `Race` table. All the data in the column will be lost.
  - You are about to alter the column `state` on the `Race` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(2)`.

*/
-- AlterTable
ALTER TABLE "Race" DROP COLUMN "city_largest",
DROP COLUMN "county_density",
DROP COLUMN "county_home_value",
DROP COLUMN "county_income_household_median",
DROP COLUMN "county_name",
DROP COLUMN "county_population",
DROP COLUMN "county_slug",
DROP COLUMN "county_unemployment_rate",
DROP COLUMN "municipality_density",
DROP COLUMN "municipality_home_value",
DROP COLUMN "municipality_income_household_median",
DROP COLUMN "municipality_name",
DROP COLUMN "municipality_popluation",
DROP COLUMN "municipality_slug",
DROP COLUMN "municipality_unemployment_rate",
ADD COLUMN     "countyId" UUID,
ADD COLUMN     "municipalityId" UUID,
ADD COLUMN     "sub_area_name" TEXT,
ADD COLUMN     "sub_area_value" TEXT,
ALTER COLUMN "state" SET DATA TYPE CHAR(2);

-- AlterTable
ALTER TABLE "county" ADD COLUMN     "city_largest" TEXT,
ADD COLUMN     "county_density" DOUBLE PRECISION,
ADD COLUMN     "county_home_value" INTEGER,
ADD COLUMN     "county_income_household_median" INTEGER,
ADD COLUMN     "county_name" TEXT,
ADD COLUMN     "county_population" INTEGER,
ADD COLUMN     "county_unemployment_rate" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "municipality" ADD COLUMN     "municipality_density" DOUBLE PRECISION,
ADD COLUMN     "municipality_home_value" INTEGER,
ADD COLUMN     "municipality_income_household_median" INTEGER,
ADD COLUMN     "municipality_popluation" INTEGER,
ADD COLUMN     "municipality_unemployment_rate" DOUBLE PRECISION;

-- AddForeignKey
ALTER TABLE "Race" ADD CONSTRAINT "Race_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "county"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Race" ADD CONSTRAINT "Race_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "municipality"("id") ON DELETE SET NULL ON UPDATE CASCADE;
