import { createZodDto } from 'nestjs-zod'
import { STATE_CODES } from 'src/shared/constants/states'
import { toUpper } from 'src/shared/util/strings.util'
import { z } from 'zod'

const getDistrictTypesSchema = z.object({
  state: z.preprocess(toUpper, z.string()).refine((val) => {
    if (!val) return true
    return STATE_CODES.includes(val)
  }, 'Invalid state code'),
})

export class GetDistrictTypesDTO extends createZodDto(getDistrictTypesSchema) {}
