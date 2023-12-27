import '@/styles/globals.css'
import '@/styles/starry_night.scss';
import type { AppProps } from 'next/app'
import lastFm from '@/components/lastFm';
import {
  createContext,
  createElement,
  memo,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  CircularProgress,
  Container,
  CssBaseline,
  IconButton,
  SvgIconTypeMap,
  ThemeProvider,
  Typography,
  createTheme,
  useMediaQuery,
} from '@mui/material';
import { Pause, PlayArrow, Search, Settings } from '@mui/icons-material';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { useRouter } from 'next/router';
import { AnimatePresence, motion } from 'framer-motion';
import { MusicPlayer, useMusicPlayer } from '@/components/musicPlayer';
import { Wave } from '@/components/wave';
import { dvh } from '@/components/units';
import { useIsMobile } from '@/components/isMobile';
import Snowfall from 'react-snowfall';
import { Rain } from 'react-rainfall';
import { useCookies } from 'react-cookie';
import dynamic from 'next/dynamic';
import { Weather, useWeather } from '@/components/useWeather';
import { StarryNight } from '@/components/starry_night';
import { useRoboThought } from '@/components/roboThought';
import { PiPProvider } from '@/components/pip';
import { PiPInner, QuickMenu, QuickMenuInner } from '@/components/pipper';

export const WeatherContext = createContext<Weather>(null as any);
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
        window.dispatchEvent(new CustomEvent('close-pip'))
        router.push(page.href);
        if (page.extraAction) {
          page.extraAction()
        }
      }} key={index} label="" icon={createElement(page.icon, { fontSize: "medium" })} />)}
    </BottomNavigation></>)
}

export const NowPlayingWidgetBottom = () => {
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

export const SongBG = () => {
  const player = useContext(MusicPlayerContext);

  return (<AnimatePresence>
    {player.currentSong && <motion.div className='song-bg' key={player.currentSong.url}
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
      zIndex: -3,
      opacity: 0.2,
      filter: 'blur(10px)',
      backgroundImage: `url("/api/artwork?artist=${encodeURIComponent(player.currentSong?.artist)}&title=${encodeURIComponent(player.currentSong?.name)}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }} /></motion.div>}
  </AnimatePresence>)
}

export const ArtworkWaves = () => {
  const player = useContext(MusicPlayerContext);
  const colors = useMemo(() => ({
    start: player.colors[0] || "#000000",
    stop: player.colors[1] || "#000000",
  }), [player.colors])
  const robo = useRoboThought()

  return (<Box sx={{
    content: '""',
    position: 'absolute',
    width: '100vw',
    height: 'calc(100vh - var(--bottom-nav-height))',
    overflow: 'hidden',
    top: 0,
    left: 0,
    zIndex: -2,
    opacity: 0.85,
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
      {(player.playing && (player.colors.length > 0)) && <motion.div
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
        }}
      >
        <div className="robo-wrapper">
          <Box
            sx={{
              position: 'relative'
            }}
          >
            <AnimatePresence>
              {robo.display && <motion.div
                initial={{
                  opacity: 0,
                  scale: 0,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ duration: .2, type: 'keyframes', ease: 'easeInOut' }}
              >
                <Box className="thought-bubble"
                  //thought bubble pointing to bottom right
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: 'auto',
                    transform: 'translate(-50%, -100%)',
                    backgroundColor: 'rgba(255,255,255,.1)',
                    borderRadius: '1rem',
                    zIndex: -1,
                    filter: `drop-shadow(${defaultShadow.join(" ")})`,
                    ':after': {
                      content: '""',
                      position: 'absolute',
                      top: '100%',
                      left: '100%',
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                    }
                  }}
                >
                  <Typography variant='body1' sx={{
                    padding: '1rem',
                  }}>
                    {robo.thought}
                  </Typography>
                </Box>
              </motion.div>}
            </AnimatePresence>
            <img
              style={{
                filter: `drop-shadow(${defaultShadow.join(" ")})`,
                height: 400,
                maxHeight: '50vh',
                width: 'auto',
                pointerEvents: 'all',
              }}
              alt='' height={400} src='/happy_robot.png' />
          </Box>
        </div>
      </motion.div>}
    </AnimatePresence>
  </Box >)
}

export const MusicPlayerGlobal = memo(() => <audio id="music-player-global" />)

const WeatherEffectsSSR = () => {
  const [cookies] = useCookies(['weather-effects'])
  const { whatIsFalling, isDay } = useContext(WeatherContext)
  const isMobile = useIsMobile()
  const router = useRouter()
  const wideScreen = useMediaQuery('(min-width: 1400px)')
  const showMoon = useMemo(() => {
    return !isDay && ((!wideScreen && router.pathname.startsWith("/player")) || wideScreen)
  }, [router.pathname, isMobile, isDay])

  return (<AnimatePresence mode='wait'>
    {cookies["weather-effects"] == true &&
      <motion.div
        key="weather-effects"
        className='weather-effects'
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
                  pointerEvents: 'all',
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
  const [cookies, setCookie] = useCookies(['weather-effects', 'geolocate-method'])

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

    if (cookies["weather-effects"] === undefined) {
      setCookie('weather-effects', true, {
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
  const weather = useWeather()

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
    <WeatherContext.Provider value={weather}>
      <MusicPlayerContext.Provider value={musicPlayer as any}>
        <div style={{
          pointerEvents: 'none',
          zIndex: -1,
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          overflow: 'hidden',
        }} className="filters">
          <WeatherEffects />
          <SongBG />
          <ArtworkWaves />
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
            <div className='scroll-y'>
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
                    initial={{ transform: 'translateX(100%)' }}
                    animate={{
                      transform: 'translateX(0%)',
                      paddingBottom: (musicPlayer.currentSong && !router.pathname.startsWith("/player")) ? 'calc(var(--bottom-nav-height) * 1.5)' : '0',
                      marginBottom: isMobile ? 'calc(var(--bottom-nav-height) + 1rem)' : '0',
                    }}
                    exit={{ transform: 'translateX(-100%)' }}
                  >
                    <Component {...pageProps} />
                  </motion.div>
                </AnimatePresence>
              </Container>
            </div>
            <PiPProvider>
              <PiPInner />
            </PiPProvider>
            <NowPlayingWidgetBottom />
            <PhoneNavbar />
            <Box sx={{
              position: 'fixed',
              top: 0,
              right: 0,
              zIndex: 999999,
            }}>
            </Box>
            <div id="pipfix" style={{
              display: 'none',
            }}>
              <QuickMenuInner />
            </div>
          </div>
        </ThemeProvider>
      </MusicPlayerContext.Provider>
    </WeatherContext.Provider>
  </>)
}
