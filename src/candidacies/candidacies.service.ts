import { Injectable } from '@nestjs/common'
import {
  buildColumnSelect,
  createPrismaBase,
  MODELS,
} from 'src/prisma/util/prisma.util'
import { CandidacyFilterDto } from './candidacies.schema'
import { Prisma } from '@prisma/client'

@Injectable()
export class CandidaciesService extends createPrismaBase(MODELS.Candidacy) {
  async getCandidacies(filterDto: CandidacyFilterDto) {
    const { slug, raceSlug, state, columns, includeStances } = filterDto

    const where: Prisma.CandidacyWhereInput = {
      ...(slug && { slug }),
      ...(state && { state }),
      ...(raceSlug && { Race: { slug: raceSlug } }),
    }

    const selectBase = columns
      ? (buildColumnSelect(columns) as Prisma.CandidacySelect)
      : undefined

    const select: Prisma.CandidacySelect = {
      ...selectBase,
      ...(includeStances && {
        Stances: {
          include: {
            Issue: true,
          },
        },
      }),
    }

    const candidacies = Object.keys(select).length
      ? this.model.findMany({ where, select })
      : this.model.findMany({ where })

    return candidacies
  }
}
