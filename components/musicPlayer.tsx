import { useEffect, useMemo, useRef, useState } from "react";
import { Song } from "./lastFm";
import { useIsMobile } from "./isMobile";
import { useRouter } from "next/router";

export type MusicPlayer = {
    playing: boolean;
    audioLoading: boolean;
    currentSong: Song | null;
    volume: number;
    currentTime: number;
    duration: number;
    percentage: number;
    setVolume: (volume: number) => void;
    play: (song: Song) => void;
    pause: () => void;
    seek: (time: number) => void;
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
    const router = useRouter()
    const [audioLoading, setAudioLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const percentage = useMemo(() => {
        if (duration === 0) return 0;
        return currentTime / duration;
    }, [currentTime, duration])
    const audio = useMemo(() => {
        if (typeof window === 'undefined') return;
        return document.getElementById("music-player-global") as HTMLAudioElement;
    }, [])

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
        const onLoadStart = () => {
            setAudioLoading(true);
        }
        const onAudioLoaded = () => {
            setAudioLoading(false);
            audio.play();
        }
        const onProgress = () => {
            setCurrentTime(audio.currentTime);
            setDuration(audio.duration);
            setAudioLoading(false);
        }
        audio.addEventListener("play", onAudioStart);
        audio.addEventListener("pause", onAudioPause);
        audio.addEventListener("ended", onAudioEnd);
        audio.addEventListener("error", onAudioError);
        audio.addEventListener("loadstart", onLoadStart);
        audio.addEventListener("loadeddata", onAudioLoaded);
        audio.addEventListener("timeupdate", onProgress);
        audio.addEventListener("waiting", onLoadStart)
        return () => {
            audio.removeEventListener("play", onAudioStart);
            audio.removeEventListener("pause", onAudioPause);
            audio.removeEventListener("ended", onAudioEnd);
            audio.removeEventListener("error", onAudioError);
            audio.removeEventListener("loadstart", onLoadStart);
            audio.removeEventListener("loadeddata", onAudioLoaded);
            audio.removeEventListener("timeupdate", onProgress);
        }
    }, [audio])

    useEffect(() => {
        const ac = new AbortController();
        if (currentSong && audio) {
            audio.src = `/api/audio?a=${currentSong.artist}&t=${currentSong.name}`;
            setMediaSession(currentSong);
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

    const seek = (time: number) => {
        if (!audio) return;
        audio.currentTime = time;
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
        audioLoading,
        currentSong,
        volume,
        currentTime,
        duration,
        percentage,
        setVolume,
        play,
        pause,
        seek,
    }
}