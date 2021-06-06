import { AxiosError } from 'axios';
import { ErrorMessage, ResultError } from '_common';

export function getErrorMessage(error?: AxiosError<ResultError>): ErrorMessage {
  if (!error) {
    return { message: 'Something went wrong' };
  }

  return error.response?.data.error ?? error;
}
