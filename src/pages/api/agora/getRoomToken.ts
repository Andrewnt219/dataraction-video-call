import { RtcRole, RtcTokenBuilder } from 'agora-access-token';
import {
  AGORA_APP_PRIMARY_CERTIFICATE,
  NEXT_PUBLIC_AGORA_APP_ID,
} from 'constants/agora';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { InvalidQuery, ResultError, ResultSuccess, ValidQuery } from '_common';
import { apiHanler, create400Response } from '_server/utils/api-utils';
import {
  createInvalidQuery,
  createResult,
  createValidQuery,
} from '_utils/create-utils';
import {
  isNonEmptyQueryString,
  isValidNumberQuery,
} from '_utils/validate-utils';

export type Query = {
  channelName: string;
  userUid?: number;
  role?: 'publisher' | 'subscriber';
  expireTime?: number;
};
export type Data = ResultSuccess<{ token: string }>;

const get: NextApiHandler<Data | ResultError> = (req, res) => {
  const { query } = req;
  const validatedQuery = validateQuery(query, res);

  if (validatedQuery.status === 'invalid') {
    return;
  }

  const {
    channelName,
    expireTime: queriedExpireTime,
    role: queriedRole,
    userUid: queriedUid,
  } = validatedQuery.query;

  const userUid: number = isValidNumberQuery(queriedUid) ? +queriedUid : 0;
  const role: Query['role'] =
    queriedRole === 'publisher' ? 'publisher' : 'subscriber';
  const expireTime: number = isValidNumberQuery(queriedExpireTime)
    ? +queriedExpireTime
    : 3600;

  // calculate privilege expire time
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;

  const rtcRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

  const token = RtcTokenBuilder.buildTokenWithUid(
    NEXT_PUBLIC_AGORA_APP_ID,
    AGORA_APP_PRIMARY_CERTIFICATE,
    channelName,
    userUid,
    rtcRole,
    privilegeExpireTime
  );

  return res.status(200).json(createResult({ token }));
};

function validateQuery(
  query: NextApiRequest['query'],
  res: NextApiResponse
): ValidQuery<Query> | InvalidQuery {
  const { channelName } = query;

  if (!isNonEmptyQueryString(channelName)) {
    create400Response(res, 'Channel name is missing or invalid');
    return createInvalidQuery();
  }

  return createValidQuery({ channelName });
}

export default apiHanler({ get });
