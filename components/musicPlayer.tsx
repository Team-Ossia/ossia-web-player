import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Song } from "./lastFm";
import { useIsMobile } from "./isMobile";
import { useRouter } from "next/router";
import { useCookies } from "react-cookie";
import { MusicPlayerContext } from "@/pages/_app";
import spotify, { TrackFeatures } from "./spotify";

export type MusicPlayer = {
    playing: boolean;
    repeat: boolean;
    audioLoading: boolean;
    currentSong: Song | null;
    relatedTracks: Song[] | null;
    colors: string[];
    volume: number;
    currentTime: number;
    duration: number;
    percentage: number;
    trackFeatures: TrackFeatures | null;
    setVolume: (volume: number) => void;
    setRepeat: (repeat: boolean) => void;
    play: (song: Song) => void;
    pause: () => void;
    seek: (time: number) => void;
    next: () => void;
    drop: () => void;
    context: AudioContext | null;
    analyser: AnalyserNode | null;
    relationProfile: RelationProfile;
    setRelationProfile: (profile: RelationProfile) => void;
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

export type RelationProfile = "track" | "artist"

export const useMusicPlayer = () => {
    const [playing, setPlaying] = useState(false);
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [volume, setVolume] = useState(0.5);
    const isMobile = useIsMobile()
    const [audioLoading, setAudioLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [colors, setColors] = useState<string[]>([]);
    const [allRelatedTracks, setAllRelatedTracks] = useState<{
        [key in RelationProfile]: Song[];
    } | null>(null);
    const [queue, setQueue] = useState<Song[]>([]);
    const [repeat, setRepeat] = useState(false);

    const [trackFeatures, setTrackFeatures] = useState<TrackFeatures | null>(null);
    const [relationProfile, setRelationProfile] = useState<RelationProfile>("track");

    const relatedTracks = useMemo(() => {
        if (!allRelatedTracks) return null;
        return allRelatedTracks[relationProfile];
    }, [allRelatedTracks, relationProfile])

    const getNextSong = useCallback(() => {
        if (!currentSong) return null;
        if (repeat) {
            return currentSong;
        }
        if (queue.length) {
            const song = queue[0];
            setQueue(queue.slice(1));
            return song;
        } else if (allRelatedTracks?.track?.length) {
            return allRelatedTracks.track[Math.floor(Math.random() * allRelatedTracks.track.length)];
        }
        return null;
    }, [queue, allRelatedTracks, repeat])

    const percentage = useMemo(() => {
        if (duration === 0) return 0;
        return currentTime / duration;
    }, [currentTime, duration])

    useEffect(() => {
        const ac = new AbortController();
        setTrackFeatures(null);
        if (!currentSong) {
            return;
        };
        spotify.getTrackFeatures(currentSong.spotify_id, ac).then((data) => {
            setTrackFeatures(data);
        }).catch(() => null);
        return () => {
            ac.abort();
        }
    }, [currentSong])

    useEffect(() => {
        setAllRelatedTracks(null);
        if (!currentSong) {
            return;
        };
        const ac = new AbortController();
        const artistTracks = spotify.getArtistTopTracks(currentSong.spotify_artist_id, ac);
        const trackTracks = spotify.getRecommendations({
            seed_tracks: [currentSong.spotify_id],
            seed_artists: [currentSong.spotify_artist_id],
        }, ac);
        Promise.all([artistTracks, trackTracks]).then(([artistTracks, trackTracks]) => {
            setAllRelatedTracks({
                artist: artistTracks.tracks.map((track) => ({
                    name: track.name,
                    artist: track.artists[0].name,
                    spotify_id: track.id,
                    spotify_artist_id: track.artists[0].id,
                })),
                track: trackTracks.tracks.map((track) => ({
                    name: track.name,
                    artist: track.artists[0].name,
                    spotify_id: track.id,
                    spotify_artist_id: track.artists[0].id,
                })),
            })
        }).catch(() => null);
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
            next();
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

    const next = () => {
        const song = getNextSong();
        if (!song) return;
        play(song);
    }

    const drop = () => {
        setQueue([]);
        setPlaying(false);
        setCurrentSong(null);
    }

    return {
        playing,
        repeat,
        setRepeat,
        drop,
        audioLoading,
        currentSong,
        relatedTracks,
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
        next,
        context,
        analyser: analyser.current,
        relationProfile,
        setRelationProfile
    }
}