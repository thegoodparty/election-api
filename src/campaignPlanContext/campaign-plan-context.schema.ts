import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

// Input is just the BR race id. User-side fields (user_id, user_email,
// etc.) live in the sign-up flow on the caller (gp-api); the
// election-api endpoint stays purely about election data.
const campaignPlanContextRequestSchema = z
  .object({
    brDatabaseId: z.coerce.number().int().positive(),
  })
  .strict()

export class CampaignPlanContextRequestDto extends createZodDto(
  campaignPlanContextRequestSchema,
) {}

export type CampaignPlanContextCandidate = {
  gp_candidate_id: string | null
  first_name: string
  last_name: string
  full_name: string
  email: string | null
  website_url: string | null
  party: string | null
  is_incumbent: boolean | null
}

export type CampaignPlanContextResponse = {
  candidate_count: number
  candidate_office: string | null
  candidates: CampaignPlanContextCandidate[]
  civics_win_number: number | null
  contacts_needed_estimate: number | null
  general_election_date: string | null
  number_of_seats: number | null
  office_level: string | null
  office_type: string | null
  official_office_name: string | null
  primary_election_date: string | null
  projected_turnout: number | null
  relevant_election_date: string | null
  state: string | null
  win_number_effective: number | null
  win_number_estimate: number | null
}
