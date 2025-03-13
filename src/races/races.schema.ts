import { createZodDto } from 'nestjs-zod'
import { z} from 'zod'
import { STATE_CODES } from 'src/shared/constants/states'

const RaceInputSchema = z
  .object({
    state: z.string()
      .refine((val) => {
        return STATE_CODES.includes(val.toUpperCase())
      }, "Invalid state code")
  })