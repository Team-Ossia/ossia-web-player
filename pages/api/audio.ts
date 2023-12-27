// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import piped from '@/components/piped'
import type { NextApiRequest, NextApiResponse } from 'next'
import https from 'https'

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    return new Promise<void>(async (resolve, reject) => {
        const notletters = /[^a-zA-Z0-9\-éáóöőúüű]/gi;

        const artist = req.query.artist as string
        const title = req.query.title as string
        const query = `${artist} ${title}`.replace(notletters, ' ').replace(/\s+/g, ' ').trim()

        const results = await piped.search({
            q: query,
            filter: 'videos',
        })
        if (!results.items[0]) {
            res.status(404).json({ error: 'No results found' })
            return
        }
        const videoID = results.items[0].url.split('?v=')[1]

        const streams = await piped.getStreams({
            id: results.items[0].url.split('?v=')[1],
        })
        // if no streams
        if (!streams.audioStreams[0]) {
            res.status(404).json({ error: 'No streams found' })
            return
        }

        const stream = streams.audioStreams.sort((a, b) => {
            // get highest bitrate
            if (a.bitrate && b.bitrate) {
                return b.bitrate - a.bitrate
            }
            if (a.contentLength && b.contentLength) {
                return a.contentLength - b.contentLength
            }
            return 0
        })[0]

        res.setHeader('Content-Type', 'audio/mp4');
        res.setHeader('Cache-Control', 'max-age=0, s-maxage=86400, stale-while-revalidate');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Access-Control-Max-Age', '86400');
        res.setHeader('X-VideoID', videoID);
        res.setHeader('X-Query', query);
        if (stream.contentLength) {
            res.setHeader('Content-Length', stream.contentLength);
            res.setHeader('Accept-Ranges', 'bytes');
            res.setHeader('Content-Range', `bytes 0-${stream.contentLength - 1}/${stream.contentLength}`);
        }

        await new Promise((resolve, reject) => {
            https.get(stream.url, (response) => {
                response.pipe(res);
                response.on('end', resolve);
                response.on('error', reject);
            });
        });
    })
}
