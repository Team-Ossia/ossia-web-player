import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import lastFm from '@/components/lastFm';
import { createContext, createElement, useContext, useEffect, useMemo, useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Box, Container, CssBaseline, IconButton, SvgIconTypeMap, ThemeProvider, createTheme } from '@mui/material';
import { Album, Home, Pause, PlayArrow, Search, Settings } from '@mui/icons-material';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { useRouter } from 'next/router';
import { AnimatePresence, motion } from 'framer-motion';
import { MusicPlayer, useMusicPlayer } from '@/components/musicPlayer';

export const MusicPlayerContext = createContext<MusicPlayer>(null as any);

const theme = createTheme({
  palette: {
    mode: 'dark',
    contrastThreshold: 5,
    primary: {
      main: '#8b00ff', // Violet color
    },
    secondary: {
      main: '#ff5722', // Orange color
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
}[] = [
    {
      icon: Search,
      label: 'Home',
      href: '/'
    },
    {
      icon: Album,
      label: 'Player',
      href: '/player'
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/settings'
    }
  ]

const PhoneNavbar = () => {
  const [value, setValue] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const path = router.pathname;
    const index = pages.findIndex((page) => page.href === path);
    if (index > -1) {
      setValue(index);
    }
  }, [value, router.pathname])

  return (<>
    <BottomNavigation
      sx={{
        width: '100%',
        zIndex: 100,
        minHeight: 'var(--bottom-nav-height)',
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
      }} key={index} label="" icon={createElement(page.icon, { fontSize: "medium" })} />)}
    </BottomNavigation></>)
}

const NowPlayingWidgetBottom = () => {
  const router = useRouter()
  const musicPlayer = useContext(MusicPlayerContext)

  return (<>
    <AnimatePresence>
      {!router.pathname.startsWith("/player") && musicPlayer.currentSong !== null &&
        <motion.div className='now-playing-widget' key="now-playing-widget" onClick={() => {
          router.push('/player')
        }}
          initial={{ bottom: 'calc(var(--bottom-nav-height) * -1)' }}
          animate={{ bottom: 'calc(var(--bottom-nav-height) * 1.2)' }}
          exit={{ bottom: 'calc(var(--bottom-nav-height) * -1)' }}
          transition={{ duration: .4 }}
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
                {musicPlayer.playing ? <Pause /> : <PlayArrow />}
              </IconButton>
            </Box>
          </Box>
        </motion.div >
      }
    </AnimatePresence >
  </>)
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const musicPlayer = useMusicPlayer()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).lastFm = lastFm;
    }
  }, [])

  return (<>
    <audio id="music-player-global" />
    <MusicPlayerContext.Provider value={musicPlayer}>
      <Box sx={{
        content: '""',
        position: 'absolute',
        width: musicPlayer.playing ? '100vw' : '0vw',
        height: '100vh',
        transition: 'width .2s ease-in-out',
        overflow: 'hidden',
        top: 0,
        left: 0,
        zIndex: -2,
        '& .waves': {
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        },
        '& .wave': {
          filter: 'hue-rotate(100deg)',
          background: "url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/85486/wave.svg) repeat-x;",
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
          <div className="wave" />
          <div className="wave" />
        </div>
      </Box>
      <AnimatePresence>
        {musicPlayer.currentSong && <motion.div className='song-bg' key={musicPlayer.currentSong.url}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        ><Box sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1,
          opacity: 0.1,
          filter: 'blur(10px)',
          backgroundImage: `url(/api/artwork?artist=${encodeURIComponent(musicPlayer.currentSong?.artist)}&title=${encodeURIComponent(musicPlayer.currentSong?.name)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} /></motion.div>}
      </AnimatePresence>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
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
                  transition={{ duration: .3 }}
                  initial={{ translateX: '100%' }}
                  animate={{ translateX: '0%', paddingBottom: (musicPlayer.currentSong && !router.pathname.startsWith("/player")) ? 'calc(var(--bottom-nav-height) * 1.5)' : '0' }}
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
