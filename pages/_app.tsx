import '@/styles/globals.css'
import '@/styles/starry_night.scss';
import type { AppProps } from 'next/app'
import lastFm from '@/components/lastFm';
import { createContext, createElement, memo, useContext, useEffect, useMemo, useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Box, CircularProgress, Container, CssBaseline, IconButton, SvgIconTypeMap, ThemeProvider, createTheme, useMediaQuery } from '@mui/material';
import { Album, Home, Pause, PlayArrow, Search, Settings } from '@mui/icons-material';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { useRouter } from 'next/router';
import { AnimatePresence, delay, motion } from 'framer-motion';
import { MusicPlayer, useMusicPlayer } from '@/components/musicPlayer';
import { Wave } from '@/components/wave';
import { dvh, lvh, svh } from '@/components/units';
import { useIsMobile } from '@/components/isMobile';
import Snowfall from 'react-snowfall';
import { Rain } from 'react-rainfall';
import { useCookies } from 'react-cookie';
import dynamic from 'next/dynamic';
import { useGeo } from '@/components/useGeo';
import { useWeather } from '@/components/useWeather';
import { StarryNight } from '@/components/starry_night';

export const MusicPlayerContext = createContext<MusicPlayer>(null as any);

export const defaultShadow = ["-14px", "-6px", "20px", "black"]

const theme = createTheme({
  palette: {
    mode: 'dark',
    contrastThreshold: 5,
    primary: {
      main: '#8b00ff', // Violet color
    },
    secondary: {
      main: '#C2A32B', // Yellow color
    },
    background: {
      paper: '#1e1e1e', // Dark grey color for paper background
      default: '#121212', // Even darker grey color for default background
    }
  },
  typography: {
    fontFamily: [
      'Raleway',
      'sans-serif',
    ].join(','),
    fontSize: 14,
  },
})

export type IconComponent = OverridableComponent<SvgIconTypeMap<{}, "svg">> & {
  muiName: string;
};

const pages: {
  icon: IconComponent
  label: string,
  href: string,
  extraAction?: any,
}[] = [
    {
      icon: Search,
      label: 'Home',
      href: '/',
      extraAction: () => {
        const pagePath = window.location.pathname
        if (pagePath === '/') {
          const input = document.getElementById('search-input')
          if (input) {
            input.focus()
          }
          return
        }
        setTimeout(() => {
          const input = document.getElementById('search-input')
          if (input) {
            input.focus()
          }
        }, 650)
      }
    },
    // {
    //   icon: Album,
    //   label: 'Player',
    //   href: '/player'
    // },
    {
      icon: Settings,
      label: 'Settings',
      href: '/settings'
    }
  ]

const PhoneNavbar = () => {
  const [value, setValue] = useState<number>(-1);
  const router = useRouter();
  const isMobile = useIsMobile();

  useEffect(() => {
    const path = router.pathname;
    const index = pages.findIndex((page) => page.href === path);
    if (index > -1) {
      setValue(index);
    } else {
      setValue(-1)
    }
  }, [value, router])

  return (<>
    <BottomNavigation
      sx={{
        width: '100%',
        zIndex: 100,
        minHeight: 'var(--bottom-nav-height)',
        boxShadow: `0 5px ${defaultShadow[2]} ${defaultShadow[3]}`,
        ...(isMobile ? {
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
        } : {})
      }}
      value={value}
      onChange={(event, newValue) => {
        setValue(newValue);
      }}
    >
      {pages.map((page, index) => <BottomNavigationAction sx={{
        maxWidth: '4rem',
        minWidth: 'unset',
      }} href={page.href} onClick={(e) => {
        e.preventDefault()
        router.push(page.href);
        if (page.extraAction) {
          page.extraAction()
        }
      }} key={index} label="" icon={createElement(page.icon, { fontSize: "medium" })} />)}
    </BottomNavigation></>)
}

const NowPlayingWidgetBottom = () => {
  const router = useRouter()
  const musicPlayer = useContext(MusicPlayerContext)

  return (<>
    <AnimatePresence>
      {!router.pathname.startsWith("/player") && musicPlayer.currentSong !== null &&
        <motion.div onAnimationEnd={() => {
          window.dispatchEvent(new CustomEvent('buttons-reload'))
        }} className='now-playing-widget' key="now-playing-widget" onClick={() => {
          router.push('/player')
        }}
          initial={{ bottom: 'calc(var(--bottom-nav-height) * -1)' }}
          animate={{ bottom: 'calc(var(--bottom-nav-height) * 1.2)' }}
          exit={{ bottom: 'calc(var(--bottom-nav-height) * -1)' }}
          transition={{ duration: .4, type: 'keyframes' }}
          style={{
            height: 'var(--now-playing-widget-height)',
            width: '100%',
            display: 'flex',
            position: 'fixed',
            justifyContent: 'center',
            alignItems: 'center',
            left: 0,
            padding: '0 1rem',
          }}>
          <Box sx={(theme) => ({
            backgroundColor: theme.palette.background.paper,
            borderRadius: '1rem',
            boxShadow: '0 0 10px rgba(0,0,0,.4)',
            height: '100%',
            width: '100%',
            maxWidth: 1150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            overflow: 'hidden',
            flexDirection: 'row',
            position: 'relative',
            ':after': {
              // bottom line with primary color
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: '3px',
              transition: 'width .4s linear',
              width: (musicPlayer.currentSong) ? musicPlayer.percentage : '0',
              zIndex: 99,
              backgroundColor: theme.palette.primary.main,
            }
          })}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '.5rem',
            }}>
              <img style={{
                height: 'var(--now-playing-widget-height)',
                width: 'var(--now-playing-widget-height)',
                maxHeight: '100%',
                borderRadius: '1rem',
              }} width={250} height={250} src={`/api/artwork?artist=${encodeURIComponent(musicPlayer.currentSong?.artist || "laurie.")}&title=${encodeURIComponent(musicPlayer.currentSong?.name || "pára")}`} alt="" />
              <div>
                <h5 style={{
                  margin: 0,
                  fontSize: '1rem',
                }}>{musicPlayer.currentSong?.name || "Title"}</h5>
                <h6 style={{
                  margin: 0,
                  fontSize: '.8rem',
                }}>{musicPlayer.currentSong?.artist || "Artist"}</h6>
              </div>
            </Box>
            <Box sx={{
              marginRight: '1rem',
            }}>
              <IconButton onClick={(e) => {
                e.stopPropagation()
                musicPlayer.pause()
              }}>
                {musicPlayer.audioLoading ? <CircularProgress size={30} /> : (musicPlayer.playing ? <Pause /> : <PlayArrow />)}
              </IconButton>
            </Box>
          </Box>
        </motion.div >
      }
    </AnimatePresence >
  </>)
}

export const ArtworkWaves = () => {
  const player = useContext(MusicPlayerContext);
  const [colors, setColors] = useState<{ start: string, stop: string } | null>(null)

  useEffect(() => {
    let ac = new AbortController();
    fetch(`/api/getSongColors?artist=${encodeURIComponent(player.currentSong?.artist || "laurie.")}&title=${encodeURIComponent(player.currentSong?.name || "pára")}`, {
      signal: ac.signal,
    }).then((res) => res.json()).then((colors: string[]) => {
      setColors({
        start: colors[0],
        stop: colors[1],
      })
    }).catch(() => {
      setColors(null)
    })
    return () => {
      ac.abort();
    }
  }, [player.currentSong])

  return (<Box sx={{
    content: '""',
    position: 'absolute',
    width: '100vw',
    height: 'calc(100vh - var(--bottom-nav-height))',
    transition: 'opacity .2s ease-in-out',
    overflow: 'hidden',
    top: 0,
    left: 0,
    zIndex: -2,
    '& .waves': {
      position: 'fixed',
      width: (player.playing && colors?.start && colors.stop) ? '100vw' : '0vw',
      transition: 'width .2s ease-in-out',
      height: '100vh',
      overflow: 'hidden',
    },
    '& .wave': {
      position: 'absolute',
      width: '6400px',
      bottom: '0',
      height: '198px',
      animation: 'wave 6s cubic-bezier( 0.36, 0.45, 0.63, 0.53) infinite',
    },
    '& .wave:nth-of-type(2)': {
      bottom: '10px',
      animation: 'wave 6s cubic-bezier( 0.36, 0.45, 0.63, 0.53) -.125s infinite, swell 7s ease -1.25s infinite',
      opacity: '1',
    },
  }} className="wavecontainer">
    <div className="waves">
      <Wave style={{
        filter: `drop-shadow(${defaultShadow.join(" ")})`,
        zIndex: -3,
      }} gradient={{ start: colors?.start || "#fff", stop: colors?.stop || "#fff" }} className="wave" />
      <Wave style={{
        filter: `drop-shadow(${defaultShadow.join(" ")})`,
        zIndex: -1,
      }} gradient={{ start: colors?.start || "#fff", stop: colors?.stop || "#fff" }} className="wave" />
    </div>
    <AnimatePresence>
      {player.playing && <motion.img
        //slide up from bottom
        initial={{
          bottom: '-100vh'
        }}
        animate={{
          bottom: '0vh',
        }}
        exit={{ bottom: '-100vh' }}
        transition={{ duration: .2, type: 'keyframes', ease: 'easeInOut' }}
        style={{
          bottom: 0,
          right: 0,
          position: 'absolute',
          zIndex: -2,
          filter: `drop-shadow(${defaultShadow.join(" ")})`
        }} alt='' width={400} height={400} src='/happy_robot.png' />}
    </AnimatePresence>
  </Box>)
}

export const MusicPlayerGlobal = memo(() => <audio id="music-player-global" />)

const WeatherEffectsSSR = () => {
  const [cookies] = useCookies(['weatherEffects'])
  const { whatIsFalling, isDay } = useWeather()
  const isMobile = useIsMobile()
  const router = useRouter()
  const wideScreen = useMediaQuery('(min-width: 1400px)')
  const showMoon = useMemo(() => {
    return !isDay && ((!wideScreen && router.pathname.startsWith("/player")) || wideScreen)
  }, [router.pathname, isMobile, isDay])

  return (<AnimatePresence mode='wait'>
    {cookies.weatherEffects == true &&
      <motion.div
        key="weather-effects"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: .4, type: 'keyframes' }}
      >
        <Box className="weather" sx={{
          '& *': {
            zIndex: -1,
          }
        }}>
          {whatIsFalling == "rain" && <Rain numDrops={10} />}
          {whatIsFalling == "snow" && <Snowfall snowflakeCount={15} />}
          <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            opacity: isDay === false ? 1 : 0,
            transition: 'opacity .4s ease-in-out',
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,.3)',
            zIndex: -1,
          }} >
            <AnimatePresence>
              {(isDay === false && !whatIsFalling) && <motion.div key="starry-night"
                initial={{ opacity: 0, }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: .4, type: 'keyframes' }}
                style={{ overflow: 'hidden' }}
              >
                <StarryNight />
              </motion.div>}
              {showMoon && <motion.div key="moon"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1, transition: {
                    delay: .6,
                  }
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: .4, type: 'keyframes' }}
                style={{ overflow: 'hidden' }}
              >
                <img src='/actors/full_moon.svg' alt="" style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  margin: '1rem',
                  animation: 'floating 20s ease-in-out infinite',
                  height: '10rem',
                  width: 'auto',
                  zIndex: -1,
                  // moonlight effect
                  filter: 'drop-shadow(0 0 20px rgba(255,255,255,.5))',
                }} />
              </motion.div>}
            </AnimatePresence>
          </Box>
        </Box>
      </motion.div>
    }
  </AnimatePresence>)
}

const WeatherEffects = dynamic(() => Promise.resolve(WeatherEffectsSSR), {
  ssr: false,
})

const CookiesHandler = () => {
  const [cookies, setCookie] = useCookies(['weatherEffects', 'geolocate-method'])

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (cookies["geolocate-method"] === undefined) {
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
    }
    if (cookies['geolocate-method'] == 2) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state == 'granted') {
          console.log("Permission granted")
        } else {
          setCookie('geolocate-method', '1', {
            path: '/',
            maxAge: 60 * 60 * 24 * 365 * 10,
          })
        }
      })
    }

    if (cookies.weatherEffects === undefined) {
      setCookie('weatherEffects', true, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365 * 10,
      })
    }
  }, [])

  return (<></>)
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const musicPlayer = useMusicPlayer()
  const isMobile = useIsMobile()

  useEffect(() => {
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('buttons-reload'))
    }, 500)
  }, [router])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).lastFm = lastFm;
      (window as any).musicPlayer = musicPlayer;
    }
  }, [musicPlayer])

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hotkeyHandler = (e: KeyboardEvent) => {
      // TEST HOTKEY
      if (e.ctrlKey && e.key === 'x') {
        musicPlayer.play({
          "name": "angyal",
          "artist": "luvzee",
          "url": "https://www.last.fm/music/luvzee/_/angyal",
        })
      }

      // PLAY/PAUSE and input not focused
      if (e.key === ' ' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        musicPlayer.pause()
      }
    }
    window.addEventListener('keydown', hotkeyHandler)
    return () => {
      window.removeEventListener('keydown', hotkeyHandler)
    }
  }, [musicPlayer])

  return (<>
    <MusicPlayerGlobal />
    <CookiesHandler />
    <div
      style={{
        display: 'none',
      }}
    >
      <h1>Ossia | Music at your fingertips</h1>
      <h2>A free alternative to music streaming, Ossia adapts to the music and your environment</h2>
    </div>
    <MusicPlayerContext.Provider value={musicPlayer}>
      <div style={{
        pointerEvents: 'none',
      }} className="filters">
        <WeatherEffects />
        <ArtworkWaves />
        <AnimatePresence>
          {musicPlayer.currentSong && <motion.div className='song-bg' key={musicPlayer.currentSong.url}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: .4, type: 'keyframes' }}
          ><Box sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100vw',
            height: "100vh",
            zIndex: -1,
            opacity: 0.1,
            filter: 'blur(10px)',
            backgroundImage: `url("/api/artwork?artist=${encodeURIComponent(musicPlayer.currentSong?.artist)}&title=${encodeURIComponent(musicPlayer.currentSong?.name)}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }} /></motion.div>}
        </AnimatePresence>
      </div>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: dvh(100),
          gap: 0,
          justifyContent: 'space-between',
        }}>
          <div style={{
            overflowY: 'auto',
          }}>
            <Container sx={{
              marginBottom: '1rem',
              marginTop: '1rem',
              position: 'relative',
            }}>
              <AnimatePresence mode='wait'>
                <motion.div key={router.route}
                  onAnimationStart={() => {
                    const styleElem = document.createElement('style')
                    styleElem.setAttribute('id', 'page-transition')
                    //hide all scrollbars 
                    styleElem.innerHTML = `
                  *::-webkit-scrollbar {
                    display: none;
                  }
                  `
                    document.head.appendChild(styleElem)
                  }}
                  onAnimationComplete={() => {
                    setTimeout(() => {
                      const styleElem = document.getElementById('page-transition')
                      if (styleElem) {
                        styleElem.remove()
                      }
                    }, 100)
                  }}
                  style={{ overflow: 'hidden' }}
                  transition={{ duration: .3, type: 'keyframes' }}
                  initial={{ translateX: '100%' }}
                  animate={{
                    translateX: '0%',
                    paddingBottom: (musicPlayer.currentSong && !router.pathname.startsWith("/player")) ? 'calc(var(--bottom-nav-height) * 1.5)' : '0',
                    marginBottom: isMobile ? 'calc(var(--bottom-nav-height) + 1rem)' : '0',
                  }}
                  exit={{ translateX: '-100%' }}
                >
                  <Component {...pageProps} />
                </motion.div>
              </AnimatePresence>
            </Container>
          </div>
          <NowPlayingWidgetBottom />
          <PhoneNavbar />
        </div>
      </ThemeProvider>
    </MusicPlayerContext.Provider>
  </>
  )
}
