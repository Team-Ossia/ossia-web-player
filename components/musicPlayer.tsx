import { useEffect, useRef, useState } from "react";
import { Song } from "./lastFm";
import piped from "./piped";
import { useIsMobile } from "./isMobile";
import { useRouter } from "next/router";

export type MusicPlayer = {
    playing: boolean,
    currentSong: Song | null,
    volume: number,
    setVolume: (volume: number) => void,
    play: (song: Song) => void,
    pause: () => void,
}

export const findMusicAudio = async (artist: string, name: string, ac?: AbortController) => {
    const resultId = (await (piped.search({
        filter: 'videos',
        q: `${artist} ${name}`,
        ac,
    }))).items[0].url.split("?v=")[1]
    const streams = (await piped.getStreams({
        id: resultId,
        ac,
    }))
    return streams.audioStreams[0].url
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
    const [volume, setVolume] = useState(0.5);
    const isMobile = useIsMobile()
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const [pipeLoading, setPipeLoading] = useState(false);
    const router = useRouter()
    const [currentTime, setCurrentTimeState] = useState(0);

    useEffect(() => {
        if (isMobile) {
            setVolume(.6)
        }
    }, [isMobile])

    useEffect(() => {
        if (!audio) return;
        if (playing) {
            audio.play()
        } else {
            audio.pause()
        }
    }, [playing])

    useEffect(() => {
        if (typeof window === 'undefined' || !audio) return;
        const onAudioStart = () => {
            setPlaying(true);
        }
        const onAudioPause = () => {
            setPlaying(false);
        }
        const onAudioEnd = () => {
            if (router.pathname.startsWith("/player")) {
                router.push("/")
                setTimeout(() => {
                    setPlaying(false);
                    setCurrentSong(null);
                    audio.src = "";
                }, 450)
                return;
            };
            setPlaying(false);
            setCurrentSong(null);
            audio.src = "";
        }
        const onAudioError = (...e: any[]) => {
            console.error("Audio error", ...e)
            setPlaying(false);
        }
        const onAudioLoaded = () => {
            audio.play();
        }
        const onSongProgress = () => {
            setCurrentTimeState(audio.currentTime);
        }
        audio.addEventListener("play", onAudioStart);
        audio.addEventListener("pause", onAudioPause);
        audio.addEventListener("ended", onAudioEnd);
        audio.addEventListener("error", onAudioError);
        audio.addEventListener("loadeddata", onAudioLoaded);
        audio.addEventListener("timeupdate", onSongProgress);
        return () => {
            audio.removeEventListener("play", onAudioStart);
            audio.removeEventListener("pause", onAudioPause);
            audio.removeEventListener("ended", onAudioEnd);
            audio.removeEventListener("error", onAudioError);
            audio.removeEventListener("loadeddata", onAudioLoaded);
            audio.removeEventListener("timeupdate", onSongProgress);
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
            audio.volume = 0;
            setMediaSession();
            if (currentSong.pipedStream) {
                audio.src = currentSong.pipedStream;
                audio.volume = volume;
                setMediaSession(currentSong);
            } else {
                if (pipeLoading) return
                setPipeLoading(true)
                findMusicAudio(currentSong.artist, currentSong.name, ac)
                    .then((url) => {
                        audio.volume = volume;
                        audio.src = url;
                        setMediaSession(currentSong);
                    })
                    .catch(() => {
                        console.log("Aborted");
                    })
                    .finally(() => {
                        setPipeLoading(false)
                    });
            }
            return () => {
                ac.abort();
            };
        }
    }, [currentSong])

    useEffect(() => {
        if (!audio) return;
        audio.volume = volume;
    }, [volume])

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

    return {
        playing,
        currentSong,
        volume,
        setVolume,
        play,
        pause,
    }
}