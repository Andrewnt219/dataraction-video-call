import {
  InvalidQuery,
  Result,
  ResultError,
  ResultSuccess,
  ValidQuery,
} from '_common';

export const createResultError = <T = any>(
  message: string,
  initialData?: T
): ResultError<T> => {
  return {
    type: 'error',
    data: initialData ?? null,
    error: { message },
  };
};

export const createResultPending = <T = any>(initialData?: T): Result<T> => {
  return {
    type: 'pending',
    data: initialData ?? null,
    error: null,
  };
};

export const createResult = <T = any>(data: T): ResultSuccess<T> => {
  return {
    type: 'success',
    data: data,
    error: null,
  };
};

export const createValidQuery = <Query = any>(
  query: Query
): ValidQuery<Query> => {
  return { query, status: 'valid' };
};

export const createInvalidQuery = (): InvalidQuery => {
  return { query: null, status: 'invalid' };
};
