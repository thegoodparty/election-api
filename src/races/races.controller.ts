import { Controller, Get, Param, Query } from '@nestjs/common'
import { FilingDetailsByBrHashResult, RacesService } from './races.service'
import { GetRaceByBrHashIdParamsDTO, RaceFilterDto } from './races.schema'

@Controller('races')
export class RacesController {
  constructor(private readonly racesService: RacesService) {}

  @Get()
  async getRaces(@Query() filterDto: RaceFilterDto) {
    return this.racesService.findRaces(filterDto)
  }

  /**
   * Filing-fee lookup keyed on the BallotReady race hash (`Race.br_hash_id`).
   * gp-api persists this hash on `campaign.details.raceId` for every
   * onboarded candidate; this route lets it resolve filing fees without
   * going through Position, which depends on a denormalized `place_id`
   * that isn't currently populated.
   */
  @Get('by-br-hash-id/:brHashId/filing-fee')
  async getFilingFeeByBrHashId(
    @Param() params: GetRaceByBrHashIdParamsDTO,
  ): Promise<FilingDetailsByBrHashResult> {
    return this.racesService.findFilingFeeByBrHashId(params.brHashId)
  }
}
