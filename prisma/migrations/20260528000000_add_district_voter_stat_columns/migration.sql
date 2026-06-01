-- Add L2-derived voter-aggregate columns directly to District (DATA-1937).
--
-- Three nullable Int columns at District grain. The dbt mart
-- m_election_api__district will populate them on the next mart load
-- after the corresponding mart changes ship. Kept nullable so a District
-- without an L2 aggregation row (small set — turnout-only districts)
-- doesn't block the upsert.

ALTER TABLE "District"
  ADD COLUMN "registered_voters" INTEGER,
  ADD COLUMN "unique_cellphones" INTEGER,
  ADD COLUMN "unique_landlines" INTEGER;
