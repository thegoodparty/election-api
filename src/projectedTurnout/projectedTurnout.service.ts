import { Injectable } from '@nestjs/common'
import { createPrismaBase, MODELS } from 'src/prisma/util/prisma.util'
import { ProjectedTurnoutPostDTO } from './projectedTurnout.schema'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class ProjectedTurnoutService extends createPrismaBase(
  MODELS.ProjectedTurnout,
) {
  constructor() {
    super()
  }

  async getProjectedTurnout() {
    return null
  }

  async alterProjectedTurnout(dto: ProjectedTurnoutPostDTO) {
    await this.model.create({
      data: { id: uuidv4(), ...dto },
    })
  }
}
