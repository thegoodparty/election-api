import { createZodDto } from 'nestjs-zod'
import { z} from 'zod'
import { STATE_CODES } from 'src/shared/constants/states'

const baseRaceInputSchema = z
  .object({
    state: z.string()
      .refine((val) => {
        return STATE_CODES.includes(val.toUpperCase())
      }, "Invalid state code"),
    county: z.string(),
    municipality: z.string(),
    positionSlug: z.string(),
  }
)

export const byStateRaceSchema = baseRaceInputSchema.pick({state: true})
export const byCountyRaceSchema = baseRaceInputSchema.pick({state: true, county: true})
export const byMunicipalityRaceSchema = baseRaceInputSchema.omit({positionSlug: true})
export const racesByRaceSchema = baseRaceInputSchema.partial()

export class ByStateRaceDto extends createZodDto(byStateRaceSchema) {}
export class ByCountyRaceDto extends createZodDto(byCountyRaceSchema) {}
export class ByMunicipalityRaceDto extends createZodDto(byMunicipalityRaceSchema) {}
export class RacesByRaceDto extends createZodDto(racesByRaceSchema) {}
