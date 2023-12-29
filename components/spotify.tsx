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
    // {track:string, artist:string}
    return {
        track: song.id,
        artist: song.artists[0].id,
    };
}

export const getRecommendations = async (props: {
    seed_tracks?: string[],
    seed_artists?: string[],
}, ac?: AbortController) => {
    if (!props.seed_tracks && !props.seed_artists) throw new Error('No seeds provided');
    const response = await axios.get(`${apiroot}/recommendations`, {
        params: {
            seed_tracks: props.seed_tracks?.join(','),
            seed_artists: props.seed_artists?.join(','),
            limit: 25,
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
                id: string,
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
            'Authorization': `Bearer ${await getAccessToken()}`,
        },
        signal: ac?.signal,
    });
    return response.data as TrackFeatures;
}

export const getArtistTopTracks = async (id: string, ac?: AbortController) => {
    const response = await axios.get(`${apiroot}/artists/${id}/top-tracks`, {
        params: {
            country: 'US',
            limit: 25,
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
                id: string,
            }[],
            id: string,
            [key: string]: any,
        }[]
        [key: string]: any,
    };
}

const spotify = {
    getArtworkURL,
    getTrackSpotifyId,
    getRecommendations,
    getTrackFeatures,
    getArtistTopTracks,
};

export default spotify;