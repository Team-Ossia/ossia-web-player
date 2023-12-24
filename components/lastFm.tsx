const apiRoot = 'https://ws.audioscrobbler.com/2.0/';
const apiKey = "92c57e6f86e011f97de9e9714861cbe1";

export type Song = {
    name: string,
    artist: string,
    url: string,
    streamable: string,
    listeners: string,
    image: {
        "#text": string,
        size: string,
    }[],
    mbid: string,
}

export const querySongs = async (query: string) => {
    // search for a song based on artist name and song name
    const response = await fetch(`${apiRoot}?method=track.search&track=${query}&api_key=${apiKey}&format=json`);
    const data = await response.json();
    return data;
};

const lastFm = {
    querySongs,
};

export default lastFm;