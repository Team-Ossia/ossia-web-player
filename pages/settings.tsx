import { Autocomplete, Box, Card, Container, Divider, FormControl, FormControlLabel, FormLabel, Paper, Radio, RadioGroup, Switch, TextField, Typography } from "@mui/material";
import type { NextPage } from "next";
import { motion, useForceUpdate } from 'framer-motion'
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { geoSearch } from "@/components/openMeteo";
import { useIsMobile } from "@/components/isMobile";

const InnerPage = () => {
    //geo manual selection: {lat: number, lon: number, name: string}
    const [cookies, setCookie] = useCookies(['weather-effects', 'geolocate-method', 'pip-enabled']);
    const isMobile = useIsMobile();

    useEffect(() => {
        console.log(cookies['pip-enabled'])
    }, [cookies])

    return (<>
        <Container sx={{
            padding: '1rem',
            '& label.Mui-focused': {
                color: 'rgba(255,255,255,.7) !important',
            }
        }}>
            <Typography variant="h1" align="center">Settings</Typography>
            <Divider style={{ margin: '.5rem 0' }} />
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '1rem',
            }}>
                <Card variant="outlined" sx={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '1rem',
                }}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        gap: '.5rem',
                    }}>
                        <Switch
                            checked={cookies["weather-effects"] == true}
                            onChange={(e) => {
                                setCookie('weather-effects', e.target.checked.toString(), {
                                    path: '/',
                                    maxAge: 60 * 60 * 24 * 365 * 10,
                                })
                            }}
                        />
                        <Typography variant="h4">Weather effects</Typography>
                    </Box>
                    <Typography variant="body1">Day and night cycle, snowfall and rainfall</Typography>
                    <motion.div
                        style={{
                            overflow: 'hidden',
                        }}
                        animate={{
                            height: cookies["weather-effects"] == true ? 'auto' : 0,
                        }}
                        transition={{
                            duration: .2,
                            type: 'keyframes',
                        }}
                    >
                        <Divider style={{ margin: '.5rem 0' }} />
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            gap: '.2rem',
                        }}>

                            <FormControl>
                                <FormLabel>Geolocation method</FormLabel>
                                <RadioGroup
                                    row
                                    value={cookies["geolocate-method"]}
                                    onChange={(e) => {
                                        setCookie('geolocate-method', e.target.value, {
                                            path: '/',
                                            maxAge: 60 * 60 * 24 * 365 * 10,
                                        })
                                    }}
                                >
                                    <FormControlLabel value={1} control={<Radio />} label="IP" />
                                    <FormControlLabel onClick={() => {
                                        //request geolocation permission for later use, if error, switch back
                                        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                                            if (result.state == 'granted') {
                                                setCookie('geolocate-method', '2', {
                                                    path: '/',
                                                    maxAge: 60 * 60 * 24 * 365 * 10,
                                                })
                                            } else {
                                                setCookie('geolocate-method', '1', {
                                                    path: '/',
                                                    maxAge: 60 * 60 * 24 * 365 * 10,
                                                })
                                            }
                                        })
                                    }} value={2} control={<Radio />} label="GPS" />
                                    <FormControlLabel disabled value={3} control={<Radio />} label="Manual" />
                                </RadioGroup>
                            </FormControl>
                        </Box>
                    </motion.div>
                </Card>
                {!isMobile && <Card variant="outlined" sx={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '1rem',
                }}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        gap: '.5rem',
                    }}>
                        <Typography variant="h4">Floating Player <span style={{ fontSize: 18 }}>{"("}Experimental{")"}</span></Typography>
                    </Box>
                    <Divider style={{ margin: '.5rem 0' }} />
                    <Typography variant="body1">Control the music anywhere from your desktop.<br />To open the player, simply select it from the context menu!</Typography>
                    <Typography style={{
                        opacity: .7,
                    }} variant="body2">Known issue: You may have to reopen the window on the first launch </Typography>
                </Card>}
                <Card variant="outlined" sx={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '1rem',
                }}>
                    <Typography variant="h4">Credits</Typography>
                    <Divider style={{ margin: '.5rem 0' }} />
                    <Typography variant="body1">&quot;Horizon&quot; font by <a target="_blank" href="https://typefaceseger.com/">Köteles Tamás</a></Typography>
                    <Typography variant="body1">Weather data by <a target="_blank" href="https://open-meteo.com">open-meteo.com</a></Typography>
                    <Typography variant="body1">Icons and UI by <a target="_blank" href="https://mui.com">mui.com</a></Typography>
                    <Typography variant="body1">Night background by <a target="_blank" href="https://codepen.io/bennettfeely/">bennettfeely</a></Typography>
                    <Typography variant="body1">Snowfall by <a target="_blank" href="https://github.com/cahilfoley/react-snowfall">cahilfoley</a></Typography>
                    <Typography variant="body1">Rainfall by <a target="_blank" href="https://github.com/jason1642/react-rainfall">jason1642</a></Typography>
                    <Typography variant="body1">Additional information can be found on our <a target="_blank" href="https://github.com/Team-Ossia/ossia-web-player">Github repository</a></Typography>
                </Card>
            </Box>
        </Container>
    </>)
}

const InnerPageNoSSR = dynamic(() => Promise.resolve(InnerPage), {
    ssr: false,
})

const Settings: NextPage = () => {
    return <InnerPageNoSSR />
}

export default Settings;