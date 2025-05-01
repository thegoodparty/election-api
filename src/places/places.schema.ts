import { Prisma } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'
import { STATE_CODES } from 'src/shared/constants/states'
import { z } from 'zod'

const placeColumns = Object.values(
  Prisma.PlaceScalarFieldEnum,
) as (keyof typeof Prisma.PlaceScalarFieldEnum)[]
const raceColumns = Object.values(
  Prisma.RaceScalarFieldEnum,
) as (keyof typeof Prisma.RaceScalarFieldEnum)[]

const toUpper = (val: unknown) =>
  typeof val === 'string' ? val.toUpperCase() : val

const placeFilterSchema = z
  .object({
    state: z
      .preprocess(toUpper, z.string())
      .optional()
      .refine((val) => {
        if (!val) return true
        return STATE_CODES.includes(val)
      }, 'Invalid state code'),
    name: z.string().optional(),
    slug: z.string().optional(),
    mtfcc: z.string().optional(),
    includeChildren: z.preprocess(
      (val) => val === 'true' || val === '1' || val === true,
      z.boolean().optional().default(false),
    ),
    includeChildRaces: z.preprocess(
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
    categorizeChildren: z.preprocess(
      (val) => val === 'true' || val === '1' || val === true,
      z.boolean().optional().default(false),
    ),
    placeColumns: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true
          const columns = val.split(',').map((col) => col.trim())
          return columns.every((col) =>
            placeColumns.includes(
              col as keyof typeof Prisma.PlaceScalarFieldEnum,
            ),
          )
        },
        {
          message: `Invalid place column provided. Allowed columns are: ${placeColumns.join(', ')}`,
        },
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

const mostElectionsSchema = z.object({
  count: z
    .string()
    .transform(Number)
    .refine((n) => Number.isInteger(n) && n > 0, {
      message: 'count must be a positive integer',
    }),
})

export class PlaceFilterDto extends createZodDto(placeFilterSchema) {}
export class MostElectionsDto extends createZodDto(mostElectionsSchema) {}
