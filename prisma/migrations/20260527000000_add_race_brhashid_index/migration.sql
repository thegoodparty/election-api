-- Add a btree index on Race.br_hash_id.
--
-- `findFilingFeeByBrHashId` (in RacesService) issues `WHERE br_hash_id = ?`
-- on every filing-fee lookup. The Race table covers BallotReady's full US
-- dataset, so without an index this is a sequential scan on every campaign
-- read that triggers the enrichment path. Adds the missing index to match
-- the @@index([brHashId]) declared in prisma/schema/race.prisma.

CREATE INDEX "Race_br_hash_id_idx" ON "Race"("br_hash_id");
