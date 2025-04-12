import { Prisma } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'
import { STATE_CODES } from 'src/shared/constants/states'
import { z, ZodEnum } from 'zod'

const placeColumns = Object.values(Prisma.PlaceScalarFieldEnum) as (keyof typeof Prisma.PlaceScalarFieldEnum)[]
const raceColumns = Object.values(Prisma.RaceScalarFieldEnum) as (keyof typeof Prisma.RaceScalarFieldEnum)[]

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
  placeColumns: z.string().optional().refine(
    val => {
      if (!val) return true
      const columns = val.split(',').map(col => col.trim())
      return columns.every(col => placeColumns.includes(col as keyof typeof Prisma.PlaceScalarFieldEnum))
    },
    { message: `Invalid place column provided. Allowed columns are: ${placeColumns.join(', ')}` }
  ),
  raceColumns: z.string().optional().refine(
    val => {
      if (!val) return true
      const columns = val.split(',').map(col => col.trim())
      return columns.every(col => raceColumns.includes(col as keyof typeof Prisma.RaceScalarFieldEnum))
    },
    { message: `Invalid race column provided. Allowed columns are: ${raceColumns.join(', ')}`}
  )
})

export class PlaceFilterDto extends createZodDto(placeFilterSchema) {}
