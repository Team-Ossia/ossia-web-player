import { useEffect, useRef, useState } from "react";
import { Song } from "./lastFm";
import piped from "./piped";
import { useIsMobile } from "./isMobile";

export type MusicPlayer = {
    playing: boolean,
    currentSong: Song | null,
    queue: Song[],
    history: Song[],
    position: number,
    volume: number,
    setVolume: (volume: number) => void,
    play: (song: Song) => void,
    pause: () => void,
    next: () => void,
    previous: () => void,
    addToQueue: (song: Song) => void,
    addToHistory: (song: Song) => void,
    clearQueue: () => void,
    clearHistory: () => void,
    setQueuePosition: (position: number) => void,
}

export const findMusicAudio = async (artist: string, name: string, ac?: AbortController) => {
    const resultId = (await (piped.search({
        filter: 'videos',
        q: `${artist} ${name}`,
        ac,
    }))).items[0].url.split("?v=")[1]
    const stream = (await piped.getStreams({
        id: resultId,
        ac,
    })).audioStreams[0].url
    return stream
}

export const setMediaSession = (song?: Song) => {
    if (typeof window === 'undefined') return;
    if ('mediaSession' in navigator) {
        if (!song) {
            navigator.mediaSession.metadata = null;
            return;
        };
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.name,
            artist: song.artist,
            artwork: [
                { src: `/api/artwork?artist=${song.artist}&title=${song.name}`, sizes: '600x600', type: 'image/jpg' },
            ]
        });
    }
}

export const useMusicPlayer = () => {
    const [playing, setPlaying] = useState(false);
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [queue, setQueue] = useState<Song[]>([]);
    const [history, setHistory] = useState<Song[]>([]);
    const [position, setPosition] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const isMobile = useIsMobile()
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (isMobile) {
            setVolume(1)
        }
    }, [isMobile])

    useEffect(() => {
        if (typeof window === 'undefined' || !audio) return;
        const onAudioStart = () => {
            setPlaying(true);
        }
        const onAudioPause = () => {
            setPlaying(false);
        }
        const onAudioEnd = () => {
            setPlaying(false);
            setCurrentSong(null);
            audio.src = "";
            next();
        }
        const onAudioError = () => {
            setPlaying(false);
            next();
        }
        const onAudioLoaded = () => {
            audio.play();
        }
        const onLoadStart = () => {
            audio.pause();
        }
        audio.addEventListener("play", onAudioStart);
        audio.addEventListener("pause", onAudioPause);
        audio.addEventListener("ended", onAudioEnd);
        audio.addEventListener("error", onAudioError);
        audio.addEventListener("loadeddata", onAudioLoaded);
        audio.addEventListener("loadstart", onLoadStart);
        return () => {
            audio.removeEventListener("play", onAudioStart);
            audio.removeEventListener("pause", onAudioPause);
            audio.removeEventListener("ended", onAudioEnd);
            audio.removeEventListener("error", onAudioError);
            audio.removeEventListener("loadeddata", onAudioLoaded);
            audio.removeEventListener("loadstart", onLoadStart);
        }
    }, [audio])

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const audio = document.getElementById("music-player-global") as HTMLAudioElement;
        setAudio(audio);
    }, [])

    useEffect(() => {
        const ac = new AbortController();
        if (currentSong && audio) {
            audio.volume = 0
            setMediaSession()
            findMusicAudio(currentSong.artist, currentSong.name, ac).then((url) => {
                audio.volume = volume;
                audio.src = url;
            }).catch(() => {
                console.log("Aborted")
            })
            setMediaSession(currentSong);
            return () => {
                ac.abort();
            }
        }
    }, [currentSong, audio])

    useEffect(() => {
        if (!audio) return;
        audio.volume = volume;
    }, [audio, volume])

    useEffect(() => {
        if (!audio) return;
        if (playing) {
            audio.play()
        } else {
            audio.pause()
        }
    }, [playing, audio])

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

    const play = (song: Song) => {
        setCurrentSong(song);
        setPlaying(true);
    }

    const pause = () => {
        // toggle
        if (playing) {
            setPlaying(false);
            return;
        } else if (currentSong) {
            setPlaying(true);
        }
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