import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const getPositionByBrIdParamsSchema = z.object({
  brPositionId: z.string().min(1, 'BallotReady Position ID is required'),
})

export const getPositionByBrIdQuerySchema = z
  .object({
    includeDistrict: z.coerce.boolean().optional(),
    electionDate: z.string().refine((val) => !isNaN(new Date(val).getTime()), {
      message: 'Invalid date string',
    }),
  })
  .refine(
    (data) => {
      if (data.includeDistrict === true) {
        return data.electionDate !== undefined
      }
      return true
    },
    {
      message: 'When includeDistrict is true, electionDate has to be provided',
      path: ['electionDate'],
    },
  )

export const getPositionByBrIdRequestSchema = z.object({
  params: getPositionByBrIdParamsSchema,
  query: getPositionByBrIdQuerySchema,
})

export class GetPositionByBrIdQueryDTO extends createZodDto(
  getPositionByBrIdQuerySchema,
) {}
export class GetPositionByBrIdParamsDTO extends createZodDto(
  getPositionByBrIdParamsSchema,
) {}
