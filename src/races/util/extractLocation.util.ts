import { LocationResult, LocationRow } from "../races.types";

export function extractLocation(
  row: LocationRow
): LocationResult {
  const { level, positionName } = row
  let locationName = ''
  let locationLevel = level
  const positionNameLower = positionName.toLowerCase().trim()

  switch (locationLevel) {
    case 'state':
      locationName = row.state || ''
      break
    case 'county':
      locationName = extractCountyName(positionName, row.subAreaValue)
      break
    case 'city':
    case 'local':
      locationName = extractCityName(positionName, row.subAreaValue)
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

function extractCountyName(
  positionName: string,
  subAreaValue: string = ''
): string {
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
    return extractCityName(positionName, subAreaValue)
  }

  return name
}

function extractCityName(
  positionName: string,
  subAreaValue: string = ''
): string {
  const positionNameLower = positionName.toLowerCase().trim()

  const specialCases = [
    'village',
    'town',
    'county multi-jurisdictional municipal judge',
    'borough ',
    'school board',
    'neighborhood council',
    'registrar of voters',
    'justice of the peace',
    'planning area board',
    'city ',
    'municipal ',
    'mayor',
    'housing authority board',
    'scholarship',
    'board of ',
    'trustee',
    'library board',
    'parks and recreation commission',
    'supervisor of the checklist',
    'charter review commission',
    'commissioner',
  ]

  const specialCase = specialCases.find((sc) => positionNameLower.includes(sc))
  if (specialCase) {
    return positionNameLower.split(` ${specialCase}`)[0].trim()
  }

  return subAreaValue
}

