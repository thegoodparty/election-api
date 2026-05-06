import { Controller, Get, Query } from '@nestjs/common'
import { GetPositionsByZipQueryDTO } from './zipToPosition.schema'
import { ZipToPositionService } from './zipToPosition.service'
import { RaceListItem } from './zipToPosition.types'

@Controller('positions')
export class ZipToPositionController {
  constructor(private readonly zipToPosition: ZipToPositionService) {}

  @Get('by-zip')
  async byZip(
    @Query() query: GetPositionsByZipQueryDTO,
  ): Promise<RaceListItem[]> {
    return this.zipToPosition.findByZip({
      zip: query.zip,
      displayOfficeLevels: query.displayOfficeLevels,
      electionDateFrom: query.electionDateFrom,
      electionDateTo: query.electionDateTo,
    })
  }
}
