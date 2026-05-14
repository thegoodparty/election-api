/**
 * Extracts the filing fee for a race from BallotReady's free-text
 * `filing_requirements` column. Mirrors the dbt staging query the data team
 * uses against `stg_airbyte_source__ballotready_s3_recruitment_v1`, but with
 * one pragmatic deviation: rows containing multiple dollar amounts are nulled
 * out (returned as `multi_value`) instead of picking the first one. Per the
 * data team, ~8% of rows fall here — typically separate fees per party — and
 * the first-match heuristic silently lies. Returning null with the raw text
 * lets the UI render a "fee varies — see BallotReady" affordance instead.
 *
 * The raw `filingRequirements` text is ALWAYS passed through, even when no
 * fee was extracted, so downstream callers can always show "click for full
 * text from BallotReady."
 */

export type FilingFeeExtractionSource =
  | 'direct_dollar'
  | 'no_fee'
  | 'pct_of_salary'
  | 'pct_of_salary_unresolvable'
  | 'multi_value'
  | 'no_match'

export interface FilingFeeResult {
  filingFee: number | null
  filingRequirementsText: string | null
  extractionSource: FilingFeeExtractionSource | null
}

const DOLLAR_PATTERN = /\$([0-9]+(?:,[0-9]{3})*(?:\.[0-9]+)?)/g
const NO_FEE_PATTERN = /no filing fee|no fee/i
const PCT_OF_SALARY_PATTERN =
  /([0-9]+(?:\.[0-9]+)?)\s*(?:%|percent)[^.;]*?salary/i

const parseDollarString = (raw: string): number =>
  Number(raw.replace(/,/g, ''))

const EMPTY_RESULT: FilingFeeResult = {
  filingFee: null,
  filingRequirementsText: null,
  extractionSource: null,
}

export const extractFilingFee = (
  filingRequirements: string | null | undefined,
  salary: string | null | undefined,
): FilingFeeResult => {
  if (!filingRequirements || filingRequirements.trim() === '') {
    return EMPTY_RESULT
  }

  const filingRequirementsText = filingRequirements

  const dollarMatches = Array.from(filingRequirements.matchAll(DOLLAR_PATTERN))

  if (dollarMatches.length > 1) {
    return {
      filingFee: null,
      filingRequirementsText,
      extractionSource: 'multi_value',
    }
  }

  if (dollarMatches.length === 1) {
    const raw = dollarMatches[0]?.[1] ?? ''
    const value = parseDollarString(raw)
    if (Number.isFinite(value)) {
      return {
        filingFee: value,
        filingRequirementsText,
        extractionSource: 'direct_dollar',
      }
    }
  }

  if (NO_FEE_PATTERN.test(filingRequirements)) {
    return {
      filingFee: 0,
      filingRequirementsText,
      extractionSource: 'no_fee',
    }
  }

  const pctMatch = PCT_OF_SALARY_PATTERN.exec(filingRequirements)
  if (pctMatch) {
    const pct = Number(pctMatch[1])
    const salaryDollarMatch = salary
      ? new RegExp(DOLLAR_PATTERN.source).exec(salary)
      : null
    if (salaryDollarMatch && Number.isFinite(pct)) {
      const salaryDollars = parseDollarString(salaryDollarMatch[1] ?? '')
      if (Number.isFinite(salaryDollars)) {
        const fee = (pct / 100) * salaryDollars
        return {
          filingFee: Math.round(fee * 100) / 100,
          filingRequirementsText,
          extractionSource: 'pct_of_salary',
        }
      }
    }
    return {
      filingFee: null,
      filingRequirementsText,
      extractionSource: 'pct_of_salary_unresolvable',
    }
  }

  return {
    filingFee: null,
    filingRequirementsText,
    extractionSource: 'no_match',
  }
}
