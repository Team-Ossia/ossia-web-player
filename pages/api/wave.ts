// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { serverWave } from '@/components/wave'
import type { NextApiRequest, NextApiResponse } from 'next'
import { renderToStaticMarkup } from 'react-dom/server'

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    const wave = serverWave({ gradient: { start: req.query.start as string, stop: req.query.stop as string } })
    res.setHeader('Content-Type', 'image/svg+xml')
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.status(200).send(renderToStaticMarkup(wave))
}
