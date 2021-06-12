import { AxiosError } from 'axios';
import { ErrorMessage, ResultError } from '_common';

/**
 * @description extract error message from axios error response
 */
export function getErrorMessage(error?: AxiosError<ResultError>): ErrorMessage {
  if (!error) {
    return { message: 'Something went wrong' };
  }

  return error.response?.data.error ?? error;
}
