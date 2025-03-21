import { createZodDto } from 'nestjs-zod'
import { STATE_CODES } from 'src/shared/constants/states'
import { z } from 'zod'

const positionLevelEnum = z.enum([
  'CITY',
  'COUNTY',
  'FEDERAL',
  'LOCAL',
  'REGIONAL',
  'STATE',
  'TOWNSHIP',
])

const raceFilterSchema = z.object({
  state: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true
      return STATE_CODES.includes(val.toUpperCase())
    }, 'Invalid state code'),
  placeId: z.string().uuid().optional(),
  placeSlug: z.string().optional(),
  positionLevel: positionLevelEnum.optional(),
  positionSlug: z.string().optional(),
  electionDateStart: z.string().optional(),
  electionDateEnd: z.string().optional(),
  includePlace: z.preprocess(
    (val) => val === 'true' || val === '1' || val === true,
    z.boolean().optional().default(false),
  ),
  isPrimary: z.preprocess(
    (val) => val === 'true' || val === '1' || val === true,
    z.boolean().optional(),
  ),
  isRunoff: z.preprocess(
    (val) => val === 'true' || val === '1' || val === true,
    z.boolean().optional(),
  ),
})

export class RaceFilterDto extends createZodDto(raceFilterSchema) {}
