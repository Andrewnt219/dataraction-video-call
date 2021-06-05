export function isNullOrEmptyString(str: string | null | undefined) {
  return !str || str.trim().length === 0;
}

export function isString(string: any): string is string {
  return typeof string === 'string';
}

export const isNonEmptyQueryString = (query: any): query is string =>
  isString(query) && !isNullOrEmptyString(query);

export const isValidNumberQuery = (query: any): query is string =>
  isNonEmptyQueryString(query) && !isNaN(+query);
