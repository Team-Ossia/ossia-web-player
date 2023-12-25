import { Autocomplete, Box, Card, Container, Divider, FormControl, FormControlLabel, FormLabel, Paper, Radio, RadioGroup, Switch, TextField, Typography } from "@mui/material";
import type { NextPage } from "next";
import { motion, useForceUpdate } from 'framer-motion'
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { geoSearch } from "@/components/openMeteo";

const InnerPage = () => {
    //geo manual selection: {lat: number, lon: number, name: string}
    const [cookies, setCookie] = useCookies(['weatherEffects', 'geolocate-method']);

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
                            checked={cookies.weatherEffects == true}
                            onChange={(e) => {
                                setCookie('weatherEffects', e.target.checked.toString(), {
                                    path: '/',
                                    maxAge: 60 * 60 * 24 * 365 * 10,
                                })
                            }}
                        />
                        <Typography variant="h4">Weather effects</Typography>
                    </Box>
                    <Typography variant="body1">Day and night cycle, snowfall anf rainfall</Typography>
                    <motion.div
                        style={{
                            overflow: 'hidden',
                        }}
                        animate={{
                            height: cookies.weatherEffects == true ? 'auto' : 0,
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