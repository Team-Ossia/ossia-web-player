import { ArtworkWaves, MusicPlayerContext, NowPlayingWidgetBottom, SongBG, defaultShadow } from "@/pages/_app";
import Player, { VolumeThumbComponent } from "@/pages/player";
import { Monitor, MonitorOutlined, SkipPrevious, Pause, PlayArrow, SkipNext, Close, PhoneAndroid, Search, ArrowDropDown, ArrowDropUp, Phone } from "@mui/icons-material";
import { IconButton, Slider, Typography, CircularProgress, Button, Box, BottomNavigation, TextField, BottomNavigationAction } from "@mui/material";
import { useRouter } from "next/router";
import { useContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import PiPWindow, { usePiPWindow } from "./pip";
import { AnimatePresence, motion } from 'framer-motion';
import lastFm from "./lastFm";
import { GlobalContextMenu } from "./contextMenu";

export const QuickMenu = () => {
    const player = useContext(MusicPlayerContext);
    const { closePipWindow, pipWindow } = usePiPWindow();
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!pipWindow) return;
        //shortcuts
        const handler = (e: KeyboardEvent) => {
            if (pipWindow.document.activeElement?.tagName === 'INPUT') return;
            //space
            if (e.key === ' ') {
                player.pause();
            }
            //esc
            if (e.key === 'Escape') {
                closePipWindow();
            }
            //ctrl + k or s
            if ((e.ctrlKey && e.key === 'k') || e.key === 's') {
                setTimeout(() => {
                    setFocused(true);
                }, 100)
            }
        }
        pipWindow.addEventListener('keydown', handler)
        return () => {
            pipWindow.removeEventListener('keydown', handler)
        }
    }, [pipWindow, player, closePipWindow])

    useEffect(() => {
        if (!inputRef.current) return;
        if (focused) {
            inputRef.current.querySelector('input')!.focus();
        } else {
            inputRef.current.querySelector('input')!.blur();
            inputRef.current.querySelector('input')!.value = '';
        }
    }, [focused])

    return (<>
        <Box sx={(theme) => ({
            position: 'relative',
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            gap: '.4rem',
            '& .robo-wrapper': {
                display: 'none',
            }
        })}>
            <motion.div
                animate={{
                    scaleY: focused ? 1 : 0,
                }}
                transition={{
                    duration: 0.2,
                    type: 'keyframes',
                }}
                style={{
                    overflow: 'hidden',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    width: '100vw',
                }}>
                <iframe name="hidden" style={{ display: 'none' }} />
                <form action="#" target='hidden' onSubmit={(e) => {
                    e.preventDefault()
                    const query = inputRef.current?.querySelector('input')?.value;
                    if (query) {
                        lastFm.querySongs(query).then((resp) => {
                            player.play(resp.results.trackmatches.track[0])
                        })
                    }
                    setFocused(false);
                    inputRef.current!.querySelector('input')!.value = '';
                    return false
                }}>
                    <TextField name="query" ref={inputRef} onFocus={() => {
                        setFocused(true)
                    }} onBlur={() => {
                        setFocused(false);
                    }} variant="standard" label="" sx={{ width: '100%' }} />
                </form>
            </motion.div>
            <AnimatePresence>
                {player.currentSong && <motion.div
                    key={player.currentSong?.url}
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                    }}
                    exit={{
                        opacity: 0,
                    }}
                    transition={{
                        duration: 0.2,
                        type: 'keyframes',
                    }}
                >
                    <img src={`/api/artwork?artist=${player.currentSong?.artist}&title=${player.currentSong?.name}`} alt="" className="bg" style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        objectFit: 'cover',
                        filter: 'blur(10px)',
                        zIndex: -1,
                        opacity: 0.1,
                    }} />
                </motion.div>
                }
            </AnimatePresence>
            <Box sx={(theme) => ({
                backgroundColor: theme.palette.background.paper,
                zIndex: -1,
            })} />
            <Box>
                <ArtworkWaves />
            </Box>
            <AnimatePresence>
                {player.currentSong &&
                    <motion.img
                        initial={{
                            height: 0,
                        }}
                        animate={{
                            height: 128,
                        }}
                        exit={{
                            height: 0,
                        }}
                        transition={{
                            duration: 0.2,
                            type: 'keyframes',
                        }}
                        style={{
                            backgroundColor: "white",
                            borderRadius: '0.4rem',
                            width: 128,
                            height: 128,
                            overflow: 'hidden',
                            minWidth: 128,
                        }} alt={player.currentSong?.name} src={`/api/artwork?artist=${player.currentSong?.artist}&title=${player.currentSong?.name}`} width={128} height={128} />
                }
            </AnimatePresence>
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                textAlign: 'center',
                textShadow: "0px 0px 10px rgba(0,0,0,0.8)",
            }}>
                <Typography variant="h4" sx={{
                    fontWeight: 'bold',
                }}>
                    {player.currentSong?.name}
                </Typography>
                <Typography variant="h5" sx={{
                }}>
                    {player.currentSong?.artist}
                </Typography>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '1rem',
                }}>
                    <IconButton onClick={() => {
                        // player.previous();
                    }}>
                        <SkipPrevious fontSize="large" />
                    </IconButton>
                    <Button onClick={(e) => {
                        player.pause()
                    }} variant="contained" sx={{
                        borderRadius: '100%',
                        minWidth: 'unset',
                        width: '3rem',
                        height: '3rem',
                        overflow: 'hidden',
                    }}>
                        {player.playing ? <Pause fontSize="large" /> : <PlayArrow fontSize="large" />}
                    </Button>
                    <IconButton onClick={() => {
                        // player.next();
                    }}>
                        <SkipNext fontSize="large" />
                    </IconButton>
                </Box>
            </Box>
            <BottomNavigation sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 3,
            }}>
                <IconButton onClick={() => {
                    closePipWindow()
                }}>
                    <Close fontSize="large" />
                </IconButton>
                <IconButton onClick={() => {
                    setFocused(true)
                }}>
                    <Search fontSize="large" />
                </IconButton>
            </BottomNavigation >
        </Box>
    </>)
}

export const PiPInner = () => {
    const player = useContext(MusicPlayerContext);
    const router = useRouter();
    const [contextMenuPos, setContextMenuPos] = useState({ x: -1, y: -1 });

    const { isSupported, requestPipWindow, pipWindow, closePipWindow } =
        usePiPWindow();

    useEffect(() => {
        window.oncontextmenu = (e) => {
            e.preventDefault();
            setContextMenuPos({ x: e.clientX, y: e.clientY })
        }
    }, [])

    return (<>
        <GlobalContextMenu x={contextMenuPos.x} y={contextMenuPos.y} />
        {pipWindow && <PiPWindow pipWindow={pipWindow}>
            <QuickMenu />
        </PiPWindow>
        }
    </>)
}