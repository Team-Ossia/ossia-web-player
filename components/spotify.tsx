import axios from "axios";

const apiroot = 'https://api.spotify.com/v1';

export const getAccessToken = async () => {
    return (await axios.get('/api/spotify/accessToken')).data;
}

export const getArtworkURL = (artist: string, title: string) => {
    return `/api/spotify/artwork?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`
}

export const getTrackSpotifyId = async (artist: string, title: string, ac?: AbortController) => {
    // https://api.spotify.com/v1/search
    const response = await axios.get(`${apiroot}/search`, {
        params: {
            q: `track:${title} artist:${artist}`,
            type: 'track',
            limit: 1,
        },
        headers: {
            'Authorization': `Bearer ${await getAccessToken()}`
        },
        signal: ac?.signal,
    });
    const song = response.data.tracks.items[0];
    if (!song) throw new Error('Song not found');
    if (song.artists[0].name.toLowerCase() !== artist.toLowerCase()) throw new Error('Song not found');
    if (song.name.toLowerCase() !== title.toLowerCase()) throw new Error('Song not found');
    return response.data.tracks.items[0].id;
}

export const getRecommendations = async (seed_tracks: string[], ac?: AbortController) => {
    const response = await axios.get(`${apiroot}/recommendations`, {
        params: {
            seed_tracks: seed_tracks.join(','),
            limit: 10,
        },
        headers: {
            'Authorization': `Bearer ${await getAccessToken()}`
        },
        signal: ac?.signal,
    });
    return response.data as {
        tracks: {
            name: string,
            artists: {
                name: string,
            }[],
            id: string,
            [key: string]: any,
        }[]
        [key: string]: any,
    };
}

export type TrackFeatures = {
    acousticness: number,
    analysis_url: string,
    danceability: number,
    duration_ms: number,
    energy: number,
    id: string,
    instrumentalness: number,
    key: number,
    liveness: number,
    loudness: number,
    mode: number,
    speechiness: number,
    tempo: number,
    time_signature: number,
    track_href: string,
    type: string,
    uri: string,
    valence: number,
}

export const getTrackFeatures = async (id: string, ac?: AbortController) => {
    const response = await axios.get(`${apiroot}/audio-features/${id}`, {
        headers: {
            'Authorization': `Bearer ${await getAccessToken()}`
        },
        signal: ac?.signal,
    });
    return response.data as TrackFeatures;
}

const spotify = {
    getArtworkURL,
    getTrackSpotifyId,
    getRecommendations,
    getTrackFeatures,
};

export default spotify;