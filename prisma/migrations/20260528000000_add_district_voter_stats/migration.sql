-- Add DistrictVoterStats table for DATA-1937.
--
-- 1:1 with District (unique districtId FK). Carries the three voter-count
-- aggregates the campaign-strategy / Race response surfaces via
-- Race -> Position -> District -> DistrictVoterStats. All count columns are
-- nullable; dbt mart will populate them once int__l2_district_aggregations
-- is full-refreshed with the new phone-presence counts.

CREATE TABLE "DistrictVoterStats" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "district_id" UUID NOT NULL,
    "registered_voters" INTEGER,
    "unique_cellphones" INTEGER,
    "unique_landlines" INTEGER,

    CONSTRAINT "DistrictVoterStats_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DistrictVoterStats_district_id_key"
    ON "DistrictVoterStats"("district_id");

ALTER TABLE "DistrictVoterStats" ADD CONSTRAINT "DistrictVoterStats_district_id_fkey"
    FOREIGN KEY ("district_id") REFERENCES "District"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
