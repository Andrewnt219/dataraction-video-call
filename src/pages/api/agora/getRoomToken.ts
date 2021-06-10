import { RtcRole, RtcTokenBuilder } from 'agora-access-token';
import {
  AGORA_APP_PRIMARY_CERTIFICATE,
  NEXT_PUBLIC_AGORA_APP_ID,
} from 'constants/agora';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { uid } from 'uid';
import { InvalidQuery, ResultError, ResultSuccess, ValidQuery } from '_common';
import { apiHanler } from '_server/utils/api-utils';
import { createResult, createValidQuery } from '_utils/create-utils';
import { isValidNumberQuery } from '_utils/validate-utils';

export type Query = {
  channelName?: string;
  userUid?: number;
  role?: 'publisher' | 'subscriber';
  expireTime?: number;
};
export type Data = ResultSuccess<{ token: string; channelName: string }>;

const get: NextApiHandler<Data | ResultError> = (req, res) => {
  const { query } = req;
  const validatedQuery = validateQuery(query, res);

  if (validatedQuery.status === 'invalid') {
    return;
  }

  const { query: validQuery } = validatedQuery;

  const channelName = validQuery.channelName ? validQuery.channelName : uid(8);
  const userUid: number = isValidNumberQuery(validQuery.userUid)
    ? +validQuery.userUid
    : 0;
  const role: Query['role'] =
    validQuery.role === 'publisher' ? 'publisher' : 'subscriber';
  const expireTime: number = isValidNumberQuery(validQuery.expireTime)
    ? +validQuery.expireTime
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

  return res.status(200).json(createResult({ token, channelName }));
};

function validateQuery(
  query: NextApiRequest['query'],
  res: NextApiResponse
): ValidQuery<Query> | InvalidQuery {
  return createValidQuery({});
}

export default apiHanler({ get });
