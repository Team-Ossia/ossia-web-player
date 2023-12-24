// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import getColors from 'get-image-colors'
import { getArtwork } from './artwork'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    const title = req.query.title as string
    const artist = req.query.artist as string

    getColors(await getArtwork(title, artist)).then(colors => {
        res.status(200).json(colors.map(color => color.hex()))
    }).catch(err => {
        res.status(500).json({ error: err.message })
    })
}
