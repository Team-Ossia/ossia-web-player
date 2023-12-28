// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSpotifyAccessToken } from './_functions';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<string>
) {
    res.status(200).json(await getSpotifyAccessToken());
}
