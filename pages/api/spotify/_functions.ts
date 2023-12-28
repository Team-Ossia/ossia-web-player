export async function getSpotifyAccessToken() {
    const clientId: string = process.env.SPOTIFY_CLIENT_ID as string;
    const clientSecret: string = process.env.SPOTIFY_CLIENT_SECRET as string;

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`,
    });

    if (!response.ok) {
        throw new Error(`Failed to obtain Spotify access token with status: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
}