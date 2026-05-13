import { describe, expect, it } from 'vitest'
import { extractFilingFee } from './filingFee.util'

describe('extractFilingFee', () => {
  it('returns empty result when filingRequirements is null', () => {
    expect(extractFilingFee(null, '$100,000')).toEqual({
      filingFee: null,
      filingRequirementsText: null,
      extractionSource: null,
    })
  })

  it('returns empty result when filingRequirements is an empty string', () => {
    expect(extractFilingFee('', '$100,000')).toEqual({
      filingFee: null,
      filingRequirementsText: null,
      extractionSource: null,
    })
  })

  it('extracts a single dollar amount with commas', () => {
    const result = extractFilingFee('Filing fee is $1,250.00.', null)
    expect(result).toEqual({
      filingFee: 1250,
      filingRequirementsText: 'Filing fee is $1,250.00.',
      extractionSource: 'direct_dollar',
    })
  })

  it('extracts a single dollar amount without commas', () => {
    const result = extractFilingFee('A $50 fee is due at filing.', null)
    expect(result.filingFee).toBe(50)
    expect(result.extractionSource).toBe('direct_dollar')
  })

  it('returns multi_value when multiple dollar amounts are present', () => {
    const result = extractFilingFee(
      'Filing fee: $300 for D/R candidates, $50 for independents.',
      null,
    )
    expect(result).toEqual({
      filingFee: null,
      filingRequirementsText:
        'Filing fee: $300 for D/R candidates, $50 for independents.',
      extractionSource: 'multi_value',
    })
  })

  it('recognizes "no filing fee" copy as $0', () => {
    const result = extractFilingFee(
      'There is no filing fee for this office.',
      null,
    )
    expect(result.filingFee).toBe(0)
    expect(result.extractionSource).toBe('no_fee')
  })

  it('recognizes "no fee" copy case-insensitively', () => {
    const result = extractFilingFee('NO FEE required.', null)
    expect(result.filingFee).toBe(0)
    expect(result.extractionSource).toBe('no_fee')
  })

  it('computes percent of salary when salary contains a dollar amount', () => {
    const result = extractFilingFee(
      'Filing requires 2% of the annual salary.',
      '$60,000 per year',
    )
    expect(result.filingFee).toBe(1200)
    expect(result.extractionSource).toBe('pct_of_salary')
  })

  it('returns pct_of_salary_unresolvable when salary cannot be parsed', () => {
    const result = extractFilingFee(
      'Filing requires 1% of the annual salary.',
      'Varies by district',
    )
    expect(result.filingFee).toBeNull()
    expect(result.extractionSource).toBe('pct_of_salary_unresolvable')
  })

  it('falls through to no_match when no pattern fits', () => {
    const result = extractFilingFee('See the county clerk for details.', null)
    expect(result.filingFee).toBeNull()
    expect(result.extractionSource).toBe('no_match')
  })

  it('always preserves the raw filingRequirements text', () => {
    const inputs = [
      'Filing fee is $1,250.00.',
      'See the county clerk for details.',
      'Filing fee: $300 for D/R, $50 for independents.',
      'no filing fee',
    ]
    for (const input of inputs) {
      expect(extractFilingFee(input, null).filingRequirementsText).toBe(input)
    }
  })
})
