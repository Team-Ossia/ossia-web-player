import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Song } from "./lastFm";
import { useIsMobile } from "./isMobile";
import { useRouter } from "next/router";
import { useCookies } from "react-cookie";
import { MusicPlayerContext } from "@/pages/_app";
import spotify, { TrackFeatures } from "./spotify";

export type MusicPlayer = {
    playing: boolean;
    audioLoading: boolean;
    currentSong: Song | null;
    relatedSongs: Song[] | null;
    colors: string[];
    volume: number;
    currentTime: number;
    duration: number;
    percentage: number;
    trackFeatures: TrackFeatures | null;
    setVolume: (volume: number) => void;
    play: (song: Song) => void;
    pause: () => void;
    seek: (time: number) => void;
    context: AudioContext | null;
    analyser: AnalyserNode | null;
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
                { src: `/api/spotify/artwork?artist=${song.artist}&title=${song.name}`, sizes: '600x600', type: 'image/jpg' },
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
    const [colors, setColors] = useState<string[]>([]);

    const percentage = useMemo(() => {
        if (duration === 0) return 0;
        return currentTime / duration;
    }, [currentTime, duration])

    const relatedSongs = useMemo(() => {
        if (!currentSong) return null;
        return spotify.getRecommendations([currentSong.spotify_id]).then((data) => {
            return data.tracks.map((track: any) => ({
                name: track.name,
                artist: track.artists[0].name,
                spotify_id: track.id,
            }))
        }).catch(() => null);
    }, [currentSong])

    const trackFeatures = useMemo(() => {
        if (!currentSong) return null;
        return spotify.getTrackFeatures(currentSong.spotify_id).catch(() => null);
    }, [currentSong])

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!currentSong) {
            return;
        };
        fetch(`/api/spotify/artwork?artist=${encodeURIComponent(currentSong.artist)}&title=${encodeURIComponent(currentSong.name)}`, {
            method: "HEAD",
        }).then(resp => {
            setColors(resp.headers.get("X-Colors")?.split(",") || []);
        })
    }, [currentSong])

    const gainNode = useRef<GainNode | null>(null);
    const analyser = useRef<AnalyserNode | null>(null);

    const audio = useMemo(() => {
        if (typeof window === 'undefined') return null;
        return new Audio();
    }, [])
    const context = useMemo(() => {
        if (typeof window === 'undefined' || !audio) return null;
        const aucon = new AudioContext();
        const source = aucon.createMediaElementSource(audio);
        gainNode.current = aucon.createGain();
        analyser.current = aucon.createAnalyser();
        source.connect(gainNode.current);
        gainNode.current.connect(analyser.current);
        analyser.current.connect(aucon.destination);
        return aucon;
    }, [audio, gainNode, analyser])

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
        if (typeof window === 'undefined') return;
        if (currentSong && context && audio) {
            audio.src = `/api/audio?artist=${currentSong.artist}&title=${currentSong.name}`;
            audio.load();
            setMediaSession(currentSong);
        } else {
            setMediaSession();
        }
    }, [currentSong])

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!context || !gainNode.current) return;
        gainNode.current.gain.value = volume;
    }, [volume, context, gainNode])

    const play = (song: Song) => {
        setCurrentSong(song);
        setPlaying(true);
    }

    const seek = (time: number) => {
        if (!audio) return;
        audio.currentTime = time;
    }

    const pause = () => {
        if (!audio) return;
        if (playing) {
            audio.pause();
            return;
        } else if (currentSong) {
            audio.play();
            return;
        }
    }

    return {
        playing,
        audioLoading,
        currentSong,
        relatedSongs,
        colors,
        volume,
        currentTime,
        duration,
        percentage,
        trackFeatures,
        setVolume,
        play,
        pause,
        seek,
        context,
        analyser: analyser.current,
    }
}