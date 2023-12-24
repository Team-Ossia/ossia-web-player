import { Pause, PlayArrow, SkipNext, SkipPrevious, VolumeDown, VolumeMute, VolumeUp } from "@mui/icons-material";
import { Box, Button, ButtonGroup, IconButton, Slider, SliderThumb, Typography } from "@mui/material";
import type { NextPage } from "next";
import { createElement, useContext } from "react";
import { MusicPlayerContext } from "./_app";
import { useIsMobile } from "@/components/isMobile";

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

    return (<>
        <Box sx={{
            minHeight: 'calc(100vh - var(--bottom-nav-height) - var(--bottom-nav-space))',
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
                    alignItems: 'center',
                    flexDirection: 'row',
                }}>
                    <Box sx={{
                        position: 'relative',
                        maxWidth: '100%',
                        '& .innerText': {
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                        },
                        '&:after': {
                            // bottom line 4px white
                            content: '""',
                            position: 'absolute',
                            width: '100%',
                            height: '4px',
                            bottom: 0,
                            left: 0,
                            backgroundColor: '#fff',
                            boxShadow: '2px 2px 2px rgba(0,0,0,0.2)',
                            zIndex: 4,
                            pointerEvents: 'none',
                        }
                    }}>
                        <img draggable={false} style={{
                            borderRadius: '.4rem .4rem 0 0',
                            boxShadow: '2px 2px 2px rgba(0,0,0.2)',
                            overflow: 'hidden',
                            maxWidth: '50vmin',
                            transition: 'transform .2s ease-in-out',
                            transform: player.currentSong ? 'scaleY(1)' : 'scaleY(0)',
                            height: 'auto',
                        }} alt="" src={player.currentSong ? `/api/artwork?artist=${player.currentSong?.artist}&title=${player.currentSong?.name}` : ""} width={256} height={256} />
                        <Box className="innerText" sx={{
                            display: 'flex',
                            paddingRight: '1rem',
                            borderRadius: '0 .6rem 0 0',
                            overflow: 'hidden',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            gap: 0,
                            paddingLeft: '1rem',
                            zIndex: 2,
                            pointerEvents: 'none',
                            paddingBottom: '.2rem',
                            textShadow: '2px 2px 2px rgba(0,0,0,0.5)',
                            backdropFilter: 'brightness(.9) blur(4px) saturate(.5)',
                            '&:before': {
                                content: '""',
                                position: 'absolute',
                                width: '4px',
                                height: '100%',
                                top: 0,
                                left: 0,
                                backgroundColor: '#fff',
                                borderRadius: '0 0.4rem 0 0',
                                boxShadow: '2px 2px 2px rgba(0,0,0,0.2)',
                            }
                        }}>
                            <Typography style={{
                            }} variant="h5">{player.currentSong?.name || "Resting..."}</Typography>
                            <Typography style={{
                            }} variant="subtitle1">{player.currentSong?.artist}</Typography>
                        </Box>
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
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '1rem',
                }}>
                    <IconButton>
                        <SkipPrevious fontSize="large" />
                    </IconButton>
                    <Button variant="contained" sx={{
                        borderRadius: '100%',
                        minWidth: 'unset',
                        width: '3rem',
                        height: '3rem',
                        overflow: 'hidden',
                    }} onClick={() => {
                        player.pause()
                    }}>
                        {player.playing ? <Pause fontSize="large" /> : <PlayArrow fontSize="large" />}
                    </Button>
                    <IconButton>
                        <SkipNext fontSize="large" />
                    </IconButton>
                </Box>
            </Box>
        </Box>
    </>)
}

export default Player;