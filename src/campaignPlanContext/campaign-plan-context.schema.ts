import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

// Body sent by gp-api. The user fields are echoed back into the response
// alongside the looked-up race / candidate / projected-turnout data; the
// endpoint itself doesn't reach into the product DB.
const campaignPlanContextRequestSchema = z
  .object({
    brDatabaseId: z.coerce.number().int().positive(),
    user: z
      .object({
        id: z.number().int().nullable().optional(),
        email: z.string().nullable().optional(),
        firstName: z.string().nullable().optional(),
        lastName: z.string().nullable().optional(),
        fullName: z.string().nullable().optional(),
        phoneNumber: z.string().nullable().optional(),
        partyAffiliation: z.string().nullable().optional(),
        isIncumbent: z.boolean().nullable().optional(),
        createdAt: z.string().nullable().optional(),
      })
      .strict(),
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
  party: string | null
  is_user: boolean
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
  user_created_at: string | null
  user_email: string | null
  user_first_name: string | null
  user_full_name: string | null
  user_id: number | null
  user_is_incumbent: boolean | null
  user_last_name: string | null
  user_party_affiliation: string | null
  user_phone_number: string | null
  win_number_effective: number | null
  win_number_estimate: number | null
}
