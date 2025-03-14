import { LocationResult, LocationRow } from "../races.types";

export function extractLocation(
  row: LocationRow
): LocationResult | false {
  const { level, positionName } = row
  let locationName = ''
  let locationLevel = level
  const positionNameLower = positionName.toLowerCase().trim()

  switch (locationLevel) {
    case 'state':
      locationName = row.state
      break
    case 'county':
      locationName = extractCountyName(row)
      break
    case 'city':
    case 'local':
      locationName = extractCityName(row)
      locationLevel = positionNameLower.includes('village')
        ? 'village'
        : positionNameLower.includes('township')
        ? 'township'
        : positionNameLower.includes('town')
        ? 'town'
        : positionNameLower.includes('county multi-jurisdictional municipal judge')
        ? 'county'
        : ''
    default:
      locationName = positionName.split(' ')[0]
      break
  }

  return { name: locationName, level: locationLevel}
}

function extractCountyName(row: LocationRow): string {
  const { positionName, subAreaValue } = row
  const positionNameLower = positionName.toLowerCase().trim()
  const candidate = positionNameLower.includes('county')
    ? positionNameLower.split(' county')[0].trim()
    : subAreaValue.split(' ')[0].trim()

  // Remove any lingering 'county' suffix
  const name = candidate.replace(/ County$/, '')
  if (name) return name

  const specialCases = [
    'borough ',
    'municipal mayor',
    'court judge',
    'school board',
    'township justice of the peace',
    'village justice of the peace',
    'general sessions court judge',
    'justice of the peace',
    'city sheriff',
    'city circuit attorney',
    'city public administrator',
    'agricultural extension council',
    'city comptroller',
    'municipal assembly',
    'community council',
    'criminal district court magistrate judge',
    'district attorney',
    'attorney',
    'council chairman',
    'mayor',
    'auditor',
    'clerk',
    'president',
  ]

  const specialCase = specialCases.find((sc) => positionNameLower.includes(sc))
  if (specialCase) {
    return positionNameLower.split(` ${specialCase}`)[0].trim()
  }

  if (positionNameLower.includes('city')) {
    return extractCityName(row)
  }

  return name
}

function extractCityName(row: LocationRow): string {
  const { positionName, subAreaValue } = row
  const positionNameLower = positionName.toLowerCase().trim()

  const specialCases = [
    'Village',
    'Town',
    'County Multi-Jurisdictional Municipal Judge',
    'Borough ',
    'School Board',
    'Neighborhood Council',
    'Registrar of Voters',
    'Justice of the Peace',
    'Planning Area Board',
    'City ',
    'Municipal ',
    'Mayor',
    'Housing Authority Board',
    'Scholarship',
    'Board of ',
    'Trustee',
    'Library Board',
    'Parks and Recreation Commission',
    'Supervisor of the Checklist',
    'Charter Review Commission',
    'Commissioner',
  ]

  const specialCase = specialCases.find((sc) => positionNameLower.includes(sc))
  if (specialCase) {
    return positionName.split(` ${specialCase}`)[0].trim()
  }

  return subAreaValue
}

