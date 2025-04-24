import { Injectable } from '@nestjs/common'
import { buildColumnSelect, createPrismaBase, MODELS } from 'src/prisma/util/prisma.util'
import { CandidacyFilterDto } from './candidacies.schema'
import { Prisma } from '@prisma/client'

@Injectable()
export class CandidaciesService extends createPrismaBase(MODELS.Candidacy) {
  async getCandidacies(filterDto: CandidacyFilterDto) {
    const { slug, state, columns } = filterDto

    const where: Prisma.CandidacyWhereInput = {
      ...(slug ? { slug } : {}),
      ...(state ? { state } : {})
    }

    const select = columns ? buildColumnSelect(columns) : undefined

    const candidacies = select 
    ? this.model.findMany({ where, select }) 
    : this.model.findMany({ where })

    return candidacies
  }
}
