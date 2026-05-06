// election-api/src/zipToPosition/zipToPosition.schema.ts
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const DISPLAY_OFFICE_LEVELS = [
  'City',
  'County',
  'Federal',
  'Judicial',
  'Local',
  'Regional',
  'State',
  'Township',
] as const

export const GetPositionsByZipQuerySchema = z.object({
  zip: z.string().regex(/^\d{5}$/, 'zip must be 5 digits'),
  displayOfficeLevels: z
    .union([
      z.enum(DISPLAY_OFFICE_LEVELS),
      z.array(z.enum(DISPLAY_OFFICE_LEVELS)),
    ])
    .optional()
    .transform((v) =>
      v === undefined ? undefined : Array.isArray(v) ? v : [v],
    ),
  electionDateFrom: z.string().date().optional(),
  electionDateTo: z.string().date().optional(),
})

export class GetPositionsByZipQueryDTO extends createZodDto(
  GetPositionsByZipQuerySchema,
) {}
