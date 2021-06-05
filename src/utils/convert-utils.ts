import { AxiosError } from 'axios';
import { Error, ResultError } from '_common';

export function getErrorMessage(error?: AxiosError<ResultError>): Error {
  if (!error) {
    return { message: 'Something went wrong' };
  }

  return error.response?.data.error ?? error;
}
