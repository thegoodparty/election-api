export const toUpper = (val: unknown) =>
  typeof val === 'string' ? val.toUpperCase() : val
