import { createZodDto } from 'nestjs-zod'
import { z} from 'zod'
import { STATE_CODES } from 'src/shared/constants/states'

const positionLevelEnum = z.enum([
  'CITY', 'COUNTY', 'FEDERAL', 'LOCAL', 'REGIONAL', 'STATE', 'TOWNSHIP'
])

const placeFilterSchema = z.object({
  state: z.string().optional()
      .refine((val) => {
        if (!val) return true
        return STATE_CODES.includes(val.toUpperCase())
      }, "Invalid state code"),
  name: z.string().optional(),
  mtfcc: z.string().optional(),
  includeChildren: z.preprocess(
    (val) => val === 'true' || val === '1' || val === true,
    z.boolean().optional().default(false)
  ),
  includeParent: z.preprocess(
    (val) => val === 'true' || val === '1' || val === true,
    z.boolean().optional().default(false)
  ),
  includeRaces: z.preprocess(
    (val) => val === 'true' || val === '1' || val === true, 
    z.boolean().optional().default(false)
  ),
  depth: z.preprocess(
    (val) => val === undefined ? undefined : parseInt(String(val), 10),
    z.number().optional().default(1)
  ),
})

const raceFilterSchema = z.object({
  state: z.string().length(2).optional(),
  placeId: z.string().uuid().optional(),
  placeSlug: z.string().optional(),
  positionLevel: positionLevelEnum.optional(),
  positionSlug: z.string().optional(),
  electionDateStart: z.string().optional(),
  electionDateEnd: z.string().optional(),
  includePlace: z.preprocess(
    (val) => val === 'true' || val === '1' || val === true,
    z.boolean().optional().default(false)
  ),
  isPrimary: z.preprocess(
    (val) => val === 'true' || val === '1' || val === true,
    z.boolean().optional()
  ),
  isRunoff: z.preprocess(
    (val) => val === 'true' || val === '1' || val === true,
    z.boolean().optional()
  ),
});

export class PlaceFilterDto extends createZodDto(placeFilterSchema) {}
export class RaceFilterDto extends createZodDto(raceFilterSchema) {}
