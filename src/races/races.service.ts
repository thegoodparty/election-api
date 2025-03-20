import { Injectable } from '@nestjs/common'
import { createPrismaBase, MODELS } from 'src/prisma/util/prisma.util';
import { RaceFilterDto } from './races.schema';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RacesService extends createPrismaBase(MODELS.Race) {
  constructor(private readonly prisma: PrismaService) { super() }

  async findRaces(filterDto: RaceFilterDto) {
    const { 
      includePlace, 
      state, 
      placeId, placeSlug, positionLevel, positionSlug, 
      electionDateStart, electionDateEnd, isPrimary, isRunoff 
    } = filterDto

    
  }

  async findRaceById(id: string, includePlace: boolean) {

    return this.model.findFirst({ where: { id } })
  }
  
//   async getStateRacesByState(dto: ByStateRaceDto) {
//     const { state } = dto
//     const uppercaseState = state.toUpperCase()

//     return this.model.findMany({
//       where: {
//         state: uppercaseState,
//         positionLevel: PositionLevel.STATE,
//         electionDate: {
//           lt: getStartOfTwoYearsFromNow(),
//           gt: new Date(),
//         }
//       },
//       orderBy: {
//         electionDate: 'asc'
//       },
//       distinct: ['positionSlug']
//     })
//   }

//   async getAllRacesByState(dto: ByStateRaceDto) {
//     const { state } = dto
//     const upperState = state.toUpperCase()

//     // Get all races regardless of positionLevel of the input state
//     return this.model.findMany({
//       where: {
//         state: upperState,
//         electionDate: {
//           lt: getStartOfTwoYearsFromNow(),
//           gt: new Date(),
//         },
//       },
//       orderBy: {
//         electionDate: 'asc'
//       },
//       distinct: ['positionSlug']
//     })
//   }

//   async getRacesByCounty(dto: ByCountyRaceDto) {
//     const { state, county } = dto
//     const upperState = state.toUpperCase()

//     const countySlug = `${slugify(upperState, {lower: true})}-${slugify(county, {lower: true})}`

//     const countyEntity = await this.prisma.county.findUnique({
//       where: { slug: countySlug}
//     })

//     if (!countyEntity) {
//       throw new NotFoundException(`County with slug ${countySlug} not found`)
//     }

//     return this.model.findMany({
//       where: {
//         countyId: countyEntity.id,
//         electionDate: {
//           lt: getStartOfTwoYearsFromNow(),
//           gt: new Date(),
//         },
//         positionLevel: PositionLevel.COUNTY
//       },
//       orderBy: {
//         electionDate: 'asc'
//       },
//       distinct: ['positionSlug'],
//       include: { county: true }
//     })
//   }

//   async getRacesByMunicipality(dto: ByMunicipalityRaceDto) {
//     const { state, county, municipality } = dto
//     const upperState = state.toUpperCase()

//     const municipalitySlug = `${slugify(upperState, { lower: true })}-${slugify(county, {
//       lower: true,
//     })}-${slugify(municipality, {
//       lower: true,
//     })}`

//     const municipalityEntity = await this.prisma.municipality.findUnique({
//       where: { slug: municipalitySlug },
//       include: { county: true }
//     })

//     if (!municipalityEntity) {
//       throw new NotFoundException(`Municipality with slug ${municipalitySlug} not found`)
//     }

//     const races = await this.model.findMany({
//       where: {
//         municipalityId: municipalityEntity.id,
//         electionDate: {
//           lt: getStartOfTwoYearsFromNow(),
//           gt: new Date(),
//         },
//       },
//       orderBy: {
//         electionDate: 'asc'
//       },
//       distinct: ['positionSlug'],
//       include: { municipality: { include: { county: true } } }
//     })

//     const shortCity = {
//       population: municipalityEntity.municipalityPopluation,
//       density: municipalityEntity.municipalityDensity,
//       incomeHouseholdMedian: municipalityEntity.municipalityIncomeHouseholdMedian,
//       unemploymentRate: municipalityEntity.municipalityUnemploymentRate,
//       homeValue: municipalityEntity.municipalityHomeValue,
//       countyName: municipalityEntity.county?.name
//     };
    
//     return {
//       races,
//       shortCity
//     }
//   }

//   async findRace(dto: RacesByRaceDto) {
//     const { state, county, municipality, positionSlug, id } = dto

//     if (id) {
//       const race = await this.model.findUnique({
//         where: { brHashId: id },
//         select: {
//           positionSlug: true,
//           positionName: true,
//           municipality: true,
//           county: true,
//           state: true,
//         }
//       })

//       if (!race) {
//         throw new NotFoundException(`Race with id ${id} not found`)
//       }

//       return { race }
//     }

//     let countyRecord: County | null = null
//     let municipalityRecord: Municipality | null = null

//     if (county && state) {
//       const countySlug = `${slugify(state, { lower: true })}-${slugify(county, { lower: true })}`
//       countyRecord = await this.prisma.county.findUnique({
//         where: { slug: countySlug }
//       })
//     }

//     if (municipality && countyRecord && state && county) {
//       const municipalitySlug = `${slugify(state, { lower: true })}-${slugify(county, { lower: true })}-${slugify(municipality, { lower: true })}`
//       municipalityRecord = await this.prisma.municipality.findUnique({
//         where: { slug: municipalitySlug}
//       })
//     }

//     const query: Prisma.RaceWhereInput = {
//       state: state?.toUpperCase(),
//       positionSlug,
//       electionDate: {
//         lt: getStartOfTwoYearsFromNow(),
//         gt: new Date()
//       }
//     }
//     if (municipalityRecord) {
//       query.municipalityId = municipalityRecord.id
//     } else if (countyRecord) {
//       query.countyId = countyRecord.id
//     }

//     const races = await this.model.findMany({
//       where: query,
//       orderBy: { electionDate: 'asc'},
//       include: { municipality: true, county: true}
//     })
//     if (races.length === 0) {
//       return { race: null}
//     }

//     // We're choosing the first race, is this the best way? Somewhat arbitary?
//     let race = races[0]
//     // Probably should look for more than just local
//     if (race.positionLevel === PositionLevel.LOCAL && !race.locationName) {
//       for (const r of races) {
//         if (r.locationName) {
//           race = r
//           break
//         }
//       }
    
//     const positions = races.map(r => r.positionName)

//     const rowResult = extractLocation({level: race.positionLevel, state: race.state, positionName: race.positionName, subAreaValue: race.subAreaValue})
//     if (!rowResult) return
//     const { name, level } = rowResult

//     // Find other races within the same municipality or county.
//     let otherRaces: Array<{ name: string; slug: string }> = [];
//     let fetchedOtherRaces: any[] = [];
//     if (race.municipality) {
//       fetchedOtherRaces = await this.model.findMany({
//         where: { municipalityId: race.municipality.id },
//       });
//     } else if (race.county) {
//       fetchedOtherRaces = await this.model.findMany({
//         where: { countyId: race.county.id },
//       });
//     }

//     const dedups: Record<string, boolean> = {};
//     otherRaces = fetchedOtherRaces
//       .map((otherRace) => {
//         if (!dedups[otherRace.positionSlug]) {
//           dedups[otherRace.positionSlug] = true;
//           return {
//             name: otherRace.data.normalized_position_name,
//             slug: otherRace.positionSlug,
//           };
//         }
//         return null;
//       })
//       .filter((r): r is { name: string; slug: string } => r !== null);

//     // Build the filtered race object.
//     const filtered = {
//       hashId: race.brHashId,
//       positionName: race.positionName,
//       locationName: name,
//       electionDate: race.electionDay,
//       state: race.state,
//       level: race.positionLevel,
//       partisanType: race.partisanType,
//       salary: race.salary,
//       employmentType: race.employmentType,
//       filingDateStart: race.filingDateStart,
//       filingDateEnd: race.filingDateEnd,
//       normalizedPositionName: race.normalizedPositionName,
//       positionDescription: race.positionDescription,
//       frequency: race.frequency,
//       subAreaName: race.subAreaName,
//       subAreaValue: race.subAreaValue,
//       filingOfficeAddress: race.filingOfficeAddress,
//       filingPhoneNumber: race.filingPhoneNumber,
//       paperworkInstructions: race.paperworkInstructions,
//       filingRequirements: race.filingRequirements,
//       eligibilityRequirements: race.eligibilityRequirements,
//       isRunoff: race.isRunoff,
//       isPrimary: race.isPrimary,
//       municipality: race.municipality
//         ? { name: race.municipality.name, slug: race.municipality.slug }
//         : null,
//       county: race.county
//         ? { name: race.county.name, slug: race.county.slug }
//         : null,
//     }

//     return {
//       race: filtered,
//       otherRaces,
//       positions,
//     };
//   }
// }
}