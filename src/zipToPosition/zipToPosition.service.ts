import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { createPrismaBase, MODELS } from 'src/prisma/util/prisma.util'
import { RaceListItem } from './zipToPosition.types'

type FindByZipParams = {
  zip: string
  displayOfficeLevels?: string[]
  electionDateFrom?: string
  electionDateTo?: string
}

@Injectable()
export class ZipToPositionService extends createPrismaBase(
  MODELS.ZipToPosition,
) {
  constructor() {
    super()
  }

  async findByZip(params: FindByZipParams): Promise<RaceListItem[]> {
    const where: Prisma.ZipToPositionWhereInput = {
      zipCode: params.zip,
    }
    if (params.electionDateFrom || params.electionDateTo) {
      where.electionDate = {
        ...(params.electionDateFrom && {
          gte: new Date(params.electionDateFrom),
        }),
        ...(params.electionDateTo && { lte: new Date(params.electionDateTo) }),
      }
    }
    if (params.displayOfficeLevels && params.displayOfficeLevels.length > 0) {
      where.displayOfficeLevel = { in: params.displayOfficeLevels }
    }

    const rows = await this.model.findMany({
      where,
      include: { position: { include: { place: true } } },
      orderBy: [{ electionDate: 'asc' }, { name: 'asc' }],
    })

    return rows.map((row) => ({
      id: row.id,
      brPositionId: row.position.brPositionId,
      position: {
        name: row.name,
        level: row.displayOfficeLevel,
        state: row.state,
      },
      election: {
        electionDay: row.electionDate.toISOString().slice(0, 10),
      },
      city: row.position.place?.name ?? null,
      district: row.district === '' ? null : row.district,
    }))
  }
}
