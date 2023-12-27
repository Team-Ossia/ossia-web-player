import { Pause, PlayArrow, SkipNext, SkipPrevious } from "@mui/icons-material";
import {
    Box,
    Button,
    CircularProgress,
    Container,
    IconButton,
    Slider,
    SliderThumb,
    Typography,
} from "@mui/material";
import type { NextPage } from "next";
import { useContext, useEffect, useState } from "react";
import { MusicPlayerContext, defaultShadow } from "./_app";
import { useIsMobile } from "@/components/isMobile";
import { useRouter } from "next/router";
import { dvh } from "@/components/units";

export const VolumeThumbComponent = (props: any) => {
    const { children, ...other } = props;
    other.style = {
        ...other.style,
        opacity: 0,
    } as CSSStyleDeclaration
    return (
        <SliderThumb {...other}>
            {children}
        </SliderThumb>
    )
}

const Player: NextPage = () => {
    const player = useContext(MusicPlayerContext);
    const isMobile = useIsMobile()
    const router = useRouter()
    const [seekbar, setSeekbar] = useState(0)
    const [seeking, setSeeking] = useState(false)

    useEffect(() => {
        if (!player.currentSong) router.push("/")
    }, [player, router])

    useEffect(() => {
        setSeeking(player.audioLoading)
    }, [player.audioLoading])

    useEffect(() => {
        if (!seeking) {
            setSeekbar(player.currentTime)
        }
    }, [player.currentTime, seeking])

    return (<>
        <Container sx={{
            maxWidth: '45rem'
        }}>
            {player.currentSong !== null &&
                <Box sx={{
                    minHeight: `calc(${dvh(100)} - var(--bottom-nav-height) - var(--bottom-nav-space))`,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <Box sx={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '1rem',
                        width: '100%',
                    }}>
                        <Box sx={{
                            position: 'relative',
                            display: 'flex',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}>
                            <Box sx={{
                                position: 'relative',
                                maxWidth: '100%',
                                '& .innerText': {
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                },
                            }}>
                                <img draggable={false} style={{
                                    borderRadius: '0 0 .4rem .4rem',
                                    boxShadow: `${defaultShadow[0]} ${defaultShadow[1]} ${defaultShadow[2]} rgba(0,0,0,.4)`,
                                    overflow: 'hidden',
                                    maxWidth: '50vmin',
                                    transition: 'transform .2s ease-in-out',
                                    transform: player.currentSong ? 'scaleY(1)' : 'scaleY(0)',
                                    height: 'auto',
                                }} alt="" src={player.currentSong ? `/api/artwork?artist=${player.currentSong?.artist}&title=${player.currentSong?.name}` : ""} width={256} height={256} />
                                {!isMobile &&
                                    <Slider slots={{
                                        thumb: VolumeThumbComponent
                                    }} onChange={(e, v) => {
                                        player.setVolume(v as number / 100)
                                    }} step={1} size="medium" min={0} max={100} value={player.volume * 100} sx={{
                                        height: "100%",
                                        position: 'absolute',
                                        boxShadow: '-2px -2px 5px rgba(0,0,0,.4)',
                                        right: 0,
                                        borderRadius: '0 .4rem .4rem 0',
                                        zIndex: 1,
                                        top: 0,
                                        width: 4,
                                        padding: 0,
                                        transition: 'width .2s ease-in-out',
                                        '&:after': {
                                            width: '1rem',
                                            content: '""',
                                            height: '100%',
                                            display: 'block',
                                            position: 'absolute',
                                            right: 0,
                                            top: 0,
                                        },
                                        '& *': {
                                            padding: 0,
                                        },
                                        '& > span.MuiSlider-track': {
                                            transition: "unset",
                                            borderRadius: "unset",
                                        },
                                        '&:active, &:hover': {
                                            width: '1rem',
                                            zIndex: 2,
                                        },
                                    }} orientation="vertical" />
                                }
                            </Box>
                        </Box>
                        <Box>
                            <Typography sx={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                textAlign: 'center',
                            }} variant="h5">{player.currentSong?.name}</Typography>
                            <Typography sx={{
                                fontSize: '1rem',
                                textAlign: 'center',
                            }} variant="body1">{player.currentSong?.artist}</Typography>
                        </Box>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '1rem',
                        }}>
                            <IconButton>
                                <SkipPrevious fontSize="large" />
                            </IconButton>
                            {player.audioLoading ?
                                <Box sx={(theme) => ({
                                    borderRadius: '100%',
                                    minWidth: 'unset',
                                    width: '3rem',
                                    height: '3rem',
                                    overflow: 'hidden',
                                    backgroundColor: theme.palette.primary.main,
                                    filter: `drop-shadow(${defaultShadow.join(' ')})`,
                                    fill: 'white',
                                    color: 'white',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                })}>
                                    <CircularProgress size={30} color="inherit" />
                                </Box>
                                :
                                <Button onClick={(e) => {
                                    e.stopPropagation()
                                    player.pause()
                                }} variant="contained" sx={{
                                    borderRadius: '100%',
                                    minWidth: 'unset',
                                    width: '3rem',
                                    height: '3rem',
                                    overflow: 'hidden',
                                    filter: `drop-shadow(${defaultShadow.join(' ')})`,
                                }}>
                                    {player.playing ? <Pause fontSize="large" /> : <PlayArrow fontSize="large" />}
                                </Button>
                            }
                            <IconButton>
                                <SkipNext fontSize="large" />
                            </IconButton>
                        </Box>
                    </Box>
                    <div style={{
                        width: '100%',
                        maxWidth: 470,
                    }} onTouchStart={() => {
                        setSeeking(true)
                    }} onTouchEnd={() => {
                        player.seek(seekbar)
                    }}>
                        <Slider onChange={(e, v) => {
                            setSeekbar(v as number)
                        }} onMouseDown={() => {
                            setSeeking(true)
                        }} onMouseUp={() => {
                            player.seek(seekbar)
                        }} step={.1} size="medium" min={0} max={player.duration || 100} value={seeking ? seekbar : player.currentTime} sx={{
                            width: '100%',
                            marginTop: '.5rem',
                            '& > span.MuiSlider-thumb': {
                                transition: 'transform .2s ease-in-out',
                            },
                            '& > span.MuiSlider-track': {
                                transition: 'background-color .2s ease-in-out',
                                backgroundColor: seeking ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.4)',
                            },
                            '& > span.MuiSlider-rail': {
                                transition: 'background-color .2s ease-in-out',
                                backgroundColor: seeking ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.4)',
                            },
                        }} />
                    </div>
                </Box>
            }
        </Container>
    </>)
}

export default Player;