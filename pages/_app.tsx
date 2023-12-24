import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import lastFm from '@/components/lastFm';
import { useEffect, useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Container, CssBaseline, SvgIconTypeMap, ThemeProvider, createTheme } from '@mui/material';
import { Home } from '@mui/icons-material';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import { useRouter } from 'next/router';

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
      icon: Home,
      label: 'Home',
      href: '/'
    }
  ]

const PhoneNavbar = () => {
  const [value, setValue] = useState(0);
  const router = useRouter();
  return (<><BottomNavigation
    sx={{
      width: '100%',
      minHeight: '3rem',
    }}
    value={value}
    onChange={(event, newValue) => {
      setValue(newValue);
    }}
  >
    {pages.map((page, index) => <BottomNavigationAction href={page.href} onClick={(e) => {
      e.preventDefault()
      router.push(page.href);
    }} key={index} label="" icon={<page.icon />} />)}
  </BottomNavigation></>)
}

export default function App({ Component, pageProps }: AppProps) {

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).lastFm = lastFm;
    }
  }, [])

  return (
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
          }}>
            <Component {...pageProps} />
          </Container>
        </div>
        <PhoneNavbar />
      </div>
    </ThemeProvider>
  )
}
