import { Injectable, NotFoundException } from '@nestjs/common'
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

  async getProjectedTurnout(brPositionDatabaseId: string) {
    const record = this.model.findUnique({
      where: { brPositionDatabaseId },
    })
    if (!record) {
      throw new NotFoundException(
        `Projected turnout not found for brPositionId ${brPositionDatabaseId}`,
      )
    }
    return record
  }

  async alterProjectedTurnout(dto: ProjectedTurnoutPostDTO) {
    await this.model.create({
      data: { id: uuidv4(), ...dto },
    })
  }
}
