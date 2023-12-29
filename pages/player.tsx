import { ArrowDropDown, ArrowDropUp, ArrowRightAlt, Favorite, Mic, Pause, PlayArrow, Repeat, RepeatOne, RepeatOneOn, Shuffle, SkipNext, SkipPrevious } from "@mui/icons-material";
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Divider,
    IconButton,
    Slider,
    SliderThumb,
    Typography,
} from "@mui/material";
import type { NextPage } from "next";
import React, { useContext, useEffect, useState } from "react";
import { MusicPlayerContext, defaultShadow } from "./_app";
import { useIsMobile } from "@/components/isMobile";
import { useRouter } from "next/router";
import { dvh } from "@/components/units";
import { motion, AnimatePresence } from "framer-motion";
import { PlayableSong } from ".";

export const SelectableChip = ({
    label,
    selected,
    onClick,
}: {
    label: React.ReactNode;
    selected: boolean;
    onClick: () => void;
}) => {
    return (
        <Chip
            onClick={onClick}
            sx={{
                backgroundColor: selected ? "rgba(255,255,255,.2)" : "transparent",
                "&:hover": {
                    backgroundColor: "rgba(255,255,255,.2)",
                    cursor: "pointer",
                },
                "&:active": {
                    backgroundColor: "rgba(255,255,255,.4)",
                },
            }}
            label={<span style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '.2rem',
                fontSize: '.8rem',
            }}>{label}</span>}
        />
    );
}

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
    const [showDetails, setShowDetails] = useState(true)

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
            maxWidth: '45rem',
        }}>
            {player.currentSong !== null &&
                <Box sx={{
                    minHeight: `calc(${dvh(100)} - var(--bottom-nav-height) - var(--bottom-nav-space))`,
                    //start from center
                    paddingTop: `calc((${dvh(100)}) / 2 - 256px)`,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
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
                                }} alt="" src={player.currentSong ? `/api/spotify/artwork?artist=${player.currentSong?.artist}&title=${player.currentSong?.name}` : ""} width={256} height={256} />
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
                        <Box sx={{
                            textShadow: "2px 2px 5px rgba(0,0,0,.6)",
                        }}>
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
                            <IconButton onClick={() => {
                                player.setRepeat(!player.repeat)
                            }}>
                                {player.repeat ? <RepeatOne fontSize="large" /> : <Shuffle fontSize="large" />}
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
                            <IconButton onClick={() => player.next()}>
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
                    <Divider sx={{
                        width: '100%',
                        maxWidth: 470,
                        marginBottom: '1rem',
                    }}>
                        <Chip
                            onClick={() => {
                                setShowDetails(!showDetails)
                            }}
                            sx={{
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'flex-start',
                                alignItems: "flex-start",
                                '& span': {
                                    fontSize: '2rem',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%',
                                    padding: '0 1rem',
                                    overflow: 'hidden',
                                }
                            }} label={<motion.div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '1rem',
                                }}
                                animate={{
                                    transform: !showDetails ? 'translateY(-30%)' : 'translateY(30%)',
                                }}
                                transition={{
                                    duration: .2,
                                    type: 'keyframes',
                                }}
                            >
                                <ArrowDropUp fontSize="inherit" />
                                <ArrowDropDown fontSize="inherit" />
                            </motion.div>} />
                    </Divider>
                    <AnimatePresence>
                        {player.relatedTracks && showDetails &&
                            <motion.div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '.4rem',
                                    width: '100%',
                                    overflow: 'hidden',
                                }}
                                initial={{
                                    height: 0,
                                }}
                                animate={{
                                    height: 'auto',
                                }}
                                exit={{
                                    height: 0,
                                }}
                            >
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'flex-start',
                                    alignItems: 'center',
                                    marginBottom: '.5rem',
                                    padding: '.25rem',
                                    gap: '.5rem',
                                    borderRadius: '1.25rem',
                                    backgroundColor: 'rgba(255,255,255,.05)',
                                }}>
                                    <SelectableChip onClick={() => {
                                        player.setRelationProfile("track")
                                    }} selected={
                                        player.relationProfile === "track"
                                    } label={<>
                                        <Favorite fontSize="inherit" />
                                        <span>For You</span>
                                    </>} />
                                    <SelectableChip onClick={() => {
                                        player.setRelationProfile("artist")
                                    }} selected={
                                        player.relationProfile === "artist"
                                    } label={<>
                                        <Mic fontSize="inherit" />
                                        <span>More from {player.currentSong.artist}</span>
                                    </>} />
                                </Box>
                                {player.relatedTracks.map((song) => <PlayableSong key={song.spotify_id} song={song} />)}
                            </motion.div>}
                    </AnimatePresence>
                </Box>
            }
        </Container >
    </>)
}

export default Player;