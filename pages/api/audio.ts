// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import piped from '@/components/piped'
import type { NextApiRequest, NextApiResponse } from 'next'
import https from 'https'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    const search = req.query.s // base64 encoded search query
    const query = Buffer.from(search as string, 'base64').toString('ascii')
    const results = await piped.search({
        q: query,
        filter: 'videos',
    })
    const streams = await piped.getStreams({
        id: results.items[0].url.split('?v=')[1],
    })
    const stream = streams.audioStreams[0].url

    res.setHeader('Content-Type', 'audio/mp4')
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.setHeader('Content-Disposition', 'inline; filename="audio.mp4"')

    https.get(stream, (response) => {
        response.pipe(res)
    })
}
