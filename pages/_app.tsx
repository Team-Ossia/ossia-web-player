import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import lastFm from '@/components/lastFm';
import { createContext, createElement, useEffect, useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Box, Container, CssBaseline, SvgIconTypeMap, ThemeProvider, createTheme } from '@mui/material';
import { Album, Home, Search, Settings } from '@mui/icons-material';
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

  return (<><BottomNavigation
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
        width: '100vw',
        height: '100vh',
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
          animation: 'wave 7s cubic-bezier( 0.36, 0.45, 0.63, 0.53) infinite',
        },
        '& .wave:nth-of-type(2)': {
          bottom: '10px',
          animation: 'wave 7s cubic-bezier( 0.36, 0.45, 0.63, 0.53) -.125s infinite, swell 7s ease -1.25s infinite',
          opacity: '1',
        },
      }} className="wavecontainer">
        <div className="waves">
          <div className="wave" />
          <div className="wave" />
        </div>
      </Box>
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
            flexShrink: 1,
          }}>
            <Container sx={{
              marginBottom: '1rem',
              marginTop: '1rem',
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
                  transition={{ duration: .2, type: 'tween' }}
                  initial={{ translateX: '100%' }}
                  animate={{ translateX: '0%' }}
                  exit={{ translateX: '-100%' }}
                >
                  <Component {...pageProps} />
                </motion.div>
              </AnimatePresence>
            </Container>
          </div>
          <PhoneNavbar />
        </div>
      </ThemeProvider>
    </MusicPlayerContext.Provider>
  </>
  )
}
