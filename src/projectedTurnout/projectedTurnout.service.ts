import { Injectable } from '@nestjs/common'
import { createPrismaBase, MODELS } from 'src/prisma/util/prisma.util'
<<<<<<< HEAD
import { ProjectedTurnoutQueryDTO } from './projectedTurnout.schema'
=======
>>>>>>> DT-142

@Injectable()
export class ProjectedTurnoutService extends createPrismaBase(
  MODELS.ProjectedTurnout,
) {
  constructor() {
    super()
  }

<<<<<<< HEAD
  async getProjectedTurnout(dto: ProjectedTurnoutQueryDTO) {
    const record = this.model.findUnique({
      where: { ...dto },
    })

    return record
=======
  async getProjectedTurnout() {
    return null
>>>>>>> DT-142
  }
}
