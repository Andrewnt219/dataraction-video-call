import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { ResultError } from '_common';
import { createResultError } from '../../utils/create-utils';

/* -------------------------------------------------------------------------- */
/*                                     API                                    */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
export function errorHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  error: unknown
) {
  console.log(error);

  const response: ResultError = createResultError('Something went wrong');

  if (error instanceof Error) {
    response.error = error;
  }

  return res.status(500).json(response);
}

/* -------------------------------------------------------------------------- */

const handlerKeys = [
  'get',
  'post',
  'update',
  'delete',
  'patch',
  'head',
  'connect',
  'options',
  'trace',
] as const;
export type Handler = typeof handlerKeys[number];

export function isValidHttpMethod(method: any): method is Handler {
  return handlerKeys.includes(method.toLowerCase());
}

/**
 * Wrap handler in try catch and check if the incoming request is allowed. I'm proud of this.
 *
 * @example
 * const get:NextApiHandler<Result<string>> = (req, res) => {...}
 * export default apiHandler({ get });
 */
export const apiHanler =
  (supportedHandlers: Partial<Record<Handler, NextApiHandler>>) =>
  (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const method = req.method?.toLowerCase();
      if (!isValidHttpMethod(method)) {
        return res
          .status(400)
          .json(createResultError('Unexpected HTTP method'));
      }

      const handler = supportedHandlers[method];
      if (!handler) {
        return res.status(405).json(createResultError('Method Not Allowed'));
      }

      return handler(req, res);
    } catch (error) {
      return errorHandler(req, res, error);
    }
  };

/* -------------------------------------------------------------------------- */
/*                               CREATE RESPONSE                              */
/* -------------------------------------------------------------------------- */
export const createErrorResponse =
  (statusCode: number, messagePrefix = '') =>
  (res: NextApiResponse, message: string | null) =>
    res
      .status(statusCode)
      .json(createResultError(messagePrefix + (message ?? '')));

/* -------------------------------------------------------------------------- */

export const create500Response = createErrorResponse(
  500,
  'Internal Server Error'
);

export const create404Response = createErrorResponse(404, ' not found');

export const create400Response = createErrorResponse(400);

export const create401Response = createErrorResponse(401, 'Not logged in');

export const create403Response = createErrorResponse(403, 'Not authorized');

/* -------------------------------------------------------------------------- */
/*                                 MIDDLEWARES                                */
/* -------------------------------------------------------------------------- */

export function noCache(res: NextApiResponse) {
  res.setHeader(
    'Cache-Control',
    'private, no-cache, no-store, must-revalidate'
  );
  res.setHeader('Expires', '-1');
  res.setHeader('Pragma', 'no-cache');
}
