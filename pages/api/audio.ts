// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import piped from '@/components/piped'
import type { NextApiRequest, NextApiResponse } from 'next'
import https from 'https'

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    return new Promise<void>(async (resolve, reject) => {
        const notletters = /[^a-zA-Z0-9áóöőúüű]/g;

        const artist = req.query.a as string
        const title = req.query.t as string
        const query = `${artist} ${title}`.replace(notletters, ' ')
        const results = await piped.search({
            q: query,
            filter: 'videos',
        })
        if (!results.items[0]) {
            res.status(404).json({ error: 'No results found' })
            return
        }
        const streams = await piped.getStreams({
            id: results.items[0].url.split('?v=')[1],
        })
        // if no streams
        if (!streams.audioStreams[0]) {
            res.status(404).json({ error: 'No streams found' })
            return
        }
        const stream = streams.audioStreams[0].url

        res.setHeader('Content-Type', 'audio/mp4')
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
        res.setHeader('Content-Disposition', 'inline; filename="audio.mp4"')

        https.get(stream, (response) => {
            response.pipe(res)
        })
    })
}
