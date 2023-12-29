const apiRoot = 'https://ws.audioscrobbler.com/2.0/';
const apiKey = "92c57e6f86e011f97de9e9714861cbe1";

import { getTrackSpotifyId } from "./spotify";

export type Song = {
    name: string,
    artist: string,
    spotify_id: string,
    spotify_artist_id: string,
}

const spaceRegex = /[\.\-\_\w]+/gi

export const querySongs = async (query: string, ac?: AbortController) => {
    // search for a song based on artist name and song name
    const response = await fetch(`${apiRoot}?method=track.search&track=${query}&api_key=${apiKey}&format=json`, {
        signal: ac?.signal,
    });
    let data = await response.json();

    // remove duplicates by name
    data.results.trackmatches.track = data.results.trackmatches.track.filter((song: Song, i: number) => {
        return data.results.trackmatches.track.findIndex((s: Song) =>
            (s.name.toLowerCase() === song.name.toLowerCase()) && (song.artist.replace(spaceRegex, '_').toLowerCase().includes(s.artist.replace(spaceRegex, '_').toLowerCase()))
        ) === i;
    });

    // get spotify id for each song, if not found, remove it
    data.results.trackmatches.track = (await Promise.all(data.results.trackmatches.track.map((song: Song) => {
        return getTrackSpotifyId(song.artist, song.name, ac).then((id) => {
            song.spotify_id = id.track;
            song.spotify_artist_id = id.artist;
            return song;
        }).catch(() => null);
    }))).filter((song: Song | null) => song !== null);

    // remove duplicate spotify ids
    data.results.trackmatches.track = data.results.trackmatches.track.filter((song: Song, i: number) => {
        return data.results.trackmatches.track.findIndex((s: Song) => s.spotify_id === song.spotify_id) === i;
    });

    return data;
};

const lastFm = {
    querySongs,
};

export default lastFm;