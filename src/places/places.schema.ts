import { createZodDto } from 'nestjs-zod'
import { STATE_CODES } from 'src/shared/constants/states'
import { z } from 'zod'

const placeFilterSchema = z.object({
  state: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true
      return STATE_CODES.includes(val.toUpperCase())
    }, 'Invalid state code'),
  name: z.string().optional(),
  slug: z.string().optional(),
  mtfcc: z.string().optional(),
  includeChildren: z.preprocess(
    (val) => val === 'true' || val === '1' || val === true,
    z.boolean().optional().default(false),
  ),
  includeParent: z.preprocess(
    (val) => val === 'true' || val === '1' || val === true,
    z.boolean().optional().default(false),
  ),
  includeRaces: z.preprocess(
    (val) => val === 'true' || val === '1' || val === true,
    z.boolean().optional().default(false),
  ),
  depth: z.preprocess(
    (val) => (val === undefined ? undefined : parseInt(String(val), 10)),
    z.number().optional().default(1),
  ),
  placeColumns: z.string().optional(),
  raceColumns: z.string().optional()
})

export class PlaceFilterDto extends createZodDto(placeFilterSchema) {}
