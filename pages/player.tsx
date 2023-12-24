import { Pause, SkipNext, SkipPrevious } from "@mui/icons-material";
import { Box, Button, ButtonGroup, IconButton, Typography } from "@mui/material";
import type { NextPage } from "next";
import { useContext } from "react";
import { MusicPlayerContext } from "./_app";

const Player: NextPage = () => {
    const player = useContext(MusicPlayerContext);
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
                    maxWidth: '100%',
                    '& .innerText': {
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                    }
                }}>
                    <img draggable={false} style={{
                        borderRadius: '.4rem .4rem .4rem 0',
                        overflow: 'hidden',
                        maxWidth: '100%',
                        height: 'auto',
                    }} alt="" src={player.currentSong ? `/api/artwork?artist=${player.currentSong?.artist}&title=${player.currentSong?.name}` : ""} width={256} height={256} />
                    <Box className="innerText" sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        gap: 0,
                        paddingLeft: '1rem',
                        paddingBottom: '.2rem',
                        textShadow: '2px 2px 2px rgba(0,0,0,0.5)',
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
                        <Typography style={{ width: '100%' }} variant="h5">{player.currentSong?.name || "Resting..."}</Typography>
                        <Typography style={{ width: '100%' }} variant="subtitle1">{player.currentSong?.artist}</Typography>
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
                        if (player.playing) {
                            player.pause();
                        } else {
                            player.play();
                        }
                    }}>
                        <Pause fontSize="large" />
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