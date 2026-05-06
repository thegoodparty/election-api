import { Controller, Get, Query } from '@nestjs/common'
import { SearchPositionsQueryDTO } from './zipToPosition.schema'
import { ZipToPositionService } from './zipToPosition.service'
import { RaceListItem } from './zipToPosition.types'

@Controller('positions')
export class ZipToPositionController {
  constructor(private readonly zipToPosition: ZipToPositionService) {}

  @Get('search')
  async search(
    @Query() query: SearchPositionsQueryDTO,
  ): Promise<RaceListItem[]> {
    return this.zipToPosition.search({
      zip: query.zip,
      name: query.name,
      officeType: query.officeType,
      displayOfficeLevels: query.displayOfficeLevels,
      electionDateFrom: query.electionDateFrom,
      electionDateTo: query.electionDateTo,
    })
  }
}
