import { createPrismaBase, MODELS } from 'src/prisma/util/prisma.util'

export class DistrictsService extends createPrismaBase(MODELS.District) {
  constructor() {
    super()
  }

  async getDistrictTypes(state: string) {
    this.model.findMany({
      where: { state },
    })
  }
}
