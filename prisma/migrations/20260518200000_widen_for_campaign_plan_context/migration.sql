-- Widen Race and Candidacy further for the campaign-plan-context endpoint (DATA-1922).
-- All new columns are nullable; the dbt writer (write__election_api_db.py) will
-- populate them on the next mart load after the corresponding mart changes ship.
--
-- Re-adds gp_candidate_id to Candidacy. The column was added by
-- 20260518180000_widen_race_candidacy_for_onboarding and then dropped by
-- 20260518190000_drop_gp_candidate_id_from_candidacy after that scope was pulled.
-- Now that the campaign-plan-context endpoint has a concrete use case for the
-- canonical civics candidate ID, it comes back.

ALTER TABLE "Candidacy"
  ADD COLUMN     "email" TEXT,
  ADD COLUMN     "website_url" TEXT,
  ADD COLUMN     "gp_candidate_id" TEXT;

ALTER TABLE "Race"
  ADD COLUMN     "office_level" TEXT;
