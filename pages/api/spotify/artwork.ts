import type { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';
import getColors from 'get-image-colors'
import { getSpotifyAccessToken } from './_functions';

export const getArtwork = async (title: string, artist: string) => {
    const accessToken = await getSpotifyAccessToken();

    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(`track:${title} artist:${artist}`)}&type=track&limit=1`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Spotify API request failed with status: ${response.status}`);
    }

    const responseJson = await response.json();
    const track = responseJson.tracks.items[0];

    let image: string

    if (!track) {
        throw new Error('No track found');
    } else {
        image = track.album.images[0]?.url;
    }

    if (!image) {
        throw new Error('No image URL found for the track');
    }

    return image

}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    try {
        const title = req.query.title as string
        const artist = req.query.artist as string

        const image = await getArtwork(title, artist)

        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'max-age=0, s-maxage=86400, stale-while-revalidate');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Access-Control-Max-Age', '86400');

        // Download image with https.get and store it 
        return new Promise<void>((resolve, reject) => {
            https.get(image, (response) => {
                const data: Uint8Array[] = [];
                response.on('data', (chunk) => {
                    data.push(chunk);
                });

                response.on('end', () => {
                    const buffer = Buffer.concat(data);
                    getColors(buffer, 'image/jpeg').then(colors => {
                        res.setHeader('X-Colors', colors.map(color => color.hex()).join(','));
                        res.status(200).send(buffer);
                    })
                });
            });
        })
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
