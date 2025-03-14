/**
 * Using object as enum
 * as typescript does not allow
 * using enum with regex value.
 */
export const ValidationRegex = Object.freeze({
  NUMBER_STRING: /^\d+$/,
});
