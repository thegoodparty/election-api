import { Injectable } from '@nestjs/common'
import { createPrismaBase, MODELS } from 'src/prisma/util/prisma.util'

@Injectable()
export class CandidaciesService extends createPrismaBase(MODELS.Candidacy) {
  async getCandidacies() {
    return
  }
}
