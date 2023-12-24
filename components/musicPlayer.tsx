import { useEffect, useRef, useState } from "react";
import { Song } from "./lastFm";
import piped from "./piped";

export type MusicPlayer = {
    playing: boolean,
    currentSong: Song | null,
    queue: Song[],
    history: Song[],
    position: number,
    volume: number,
    setVolume: (volume: number) => void,
    play: (song?: Song) => void,
    pause: () => void,
    next: () => void,
    previous: () => void,
    addToQueue: (song: Song) => void,
    addToHistory: (song: Song) => void,
    clearQueue: () => void,
    clearHistory: () => void,
    setQueuePosition: (position: number) => void,
}

export const findMusicAudio = async (artist: string, name: string) => {
    const resultId = (await (piped.search({
        filter: 'videos',
        q: `${artist} ${name}`,
    }))).items[0].url.split("?v=")[1]
    const stream = (await piped.getStreams({
        id: resultId,
    })).audioStreams[0].url
    return stream
}

findMusicAudio("Kanye West", "Runaway").then(console.log)

export const useMusicPlayer = () => {
    const [playing, setPlaying] = useState(false);
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [queue, setQueue] = useState<Song[]>([]);
    const [history, setHistory] = useState<Song[]>([]);
    const [position, setPosition] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const audio = document.getElementById("music-player-global") as HTMLAudioElement;
        setAudio(audio);
    }, [])

    useEffect(() => {
        if (playing && currentSong && audio) {
            findMusicAudio(currentSong.artist, currentSong.name).then((url) => {
                audio.src = url;
                audio.play();
            })
        }
    }, [currentSong, playing, volume, audio])

    useEffect(() => {
        if (queue.length === 0) {
            setCurrentSong(null);
            setPosition(0);
            return
        }
        if (!queue[position]) {
            setPosition(queue.length - 1)
            return;
        }
        setCurrentSong(queue[position]);
    }, [position])

    const play = (song?: Song) => {
        if (!song) {
            setPlaying(true);
            return;
        }
        setCurrentSong(song);
        setPlaying(true);
    }

    const pause = () => {
        setPlaying(false);
    }

    const next = () => {
        if (position === queue.length - 1) {
            setPlaying(false);
            return;
        }
        setPosition(position + 1);
        setCurrentSong(queue[position + 1]);
    }

    const previous = () => {
        if (position === 0) return;
        setPosition(position - 1);
    }

    const addToQueue = (song: Song) => {
        setQueue([...queue, song]);
    }

    const addToHistory = (song: Song) => {
        setHistory([...history, song]);
    }

    const clearQueue = () => {
        setQueue([]);
    }

    const clearHistory = () => {
        setHistory([]);
    }

    const setQueuePosition = (position: number) => {
        setPosition(position);
    }

    return {
        playing,
        currentSong,
        queue,
        history,
        position,
        volume,
        setVolume,
        play,
        pause,
        next,
        previous,
        addToQueue,
        addToHistory,
        clearQueue,
        clearHistory,
        setQueuePosition,
    }
}