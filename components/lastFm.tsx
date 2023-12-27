const apiRoot = 'https://ws.audioscrobbler.com/2.0/';
const apiKey = "92c57e6f86e011f97de9e9714861cbe1";

export type Song = {
    name: string,
    artist: string,
    url: string,
}

const spaceRegex = /[\.\-\_\w]+/gi

export const querySongs = async (query: string, ac?: AbortController) => {
    // search for a song based on artist name and song name
    const response = await fetch(`${apiRoot}?method=track.search&track=${query}&api_key=${apiKey}&format=json`, {
        signal: ac?.signal,
    });
    let data = await response.json();
    const filteredTracks = await Promise.all(data.results.trackmatches.track.map(async (song: Song) => {
        // use fetch api to check if the song has artwork, only fetch status code
        const response = await fetch(`/api/artwork?artist=${song.artist}&title=${song.name}`, {
            method: 'HEAD',
            signal: ac?.signal,
        });
        return response.status === 200;
    }));

    data.results.trackmatches.track = data.results.trackmatches.track.filter((_: Song, i: number) => filteredTracks[i]);

    data.results.trackmatches.track = data.results.trackmatches.track.filter((song: Song, i: number) => {
        // remove duplicates
        return data.results.trackmatches.track.findIndex((s: Song) =>
            (s.name.toLowerCase() === song.name.toLowerCase()) && (song.artist.replace(spaceRegex, '_').toLowerCase().includes(s.artist.replace(spaceRegex, '_').toLowerCase()))
        ) === i;
    });

    return data;
};

const lastFm = {
    querySongs,
};

export default lastFm;