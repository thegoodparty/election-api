import { Prisma } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'
import { STATE_CODES } from 'src/shared/constants/states'
import { z } from 'zod'

const raceColumns = Object.values(
  Prisma.RaceScalarFieldEnum,
) as (keyof typeof Prisma.RaceScalarFieldEnum)[]

const positionLevelEnum = z.enum([
  'CITY',
  'COUNTY',
  'FEDERAL',
  'LOCAL',
  'REGIONAL',
  'STATE',
  'TOWNSHIP',
])

const raceFilterSchema = z
  .object({
    state: z
      .string()
      .optional()
      .refine((val) => {
        if (!val) return true
        return STATE_CODES.includes(val.toUpperCase())
      }, 'Invalid state code'),
    placeSlug: z.string().optional(),
    positionLevel: positionLevelEnum.optional(),
    raceSlug: z.string().optional(),
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
    raceColumns: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true
          const columns = val.split(',').map((col) => col.trim())
          return columns.every((col) =>
            raceColumns.includes(
              col as keyof typeof Prisma.RaceScalarFieldEnum,
            ),
          )
        },
        {
          message: `Invalid race column provided. Allowed columns are: ${raceColumns.join(', ')}`,
        },
      ),
  })
  .strict()

export class RaceFilterDto extends createZodDto(raceFilterSchema) {}
