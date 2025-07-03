import { Injectable } from '@nestjs/common'
import { createPrismaBase, MODELS } from 'src/prisma/util/prisma.util'
import { ProjectedTurnoutQueryDTO } from './projectedTurnout.schema'

@Injectable()
export class ProjectedTurnoutService extends createPrismaBase(
  MODELS.ProjectedTurnout,
) {
  constructor() {
    super()
  }

  async getProjectedTurnout(dto: ProjectedTurnoutQueryDTO) {
    const record = this.model.findUnique({
      where: { ...dto },
    })
    if (!record) {
      throw new NotFoundException(
        `Projected turnout not found for brPositionId ${brPositionId}`,
      )
    }
    return record
  }
}
