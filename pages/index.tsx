import lastFm, { Song } from '@/components/lastFm';
import { MusicNote, Search } from '@mui/icons-material';
import { Box, Button, Divider, FormControl, IconButton, TextField, Typography, useTheme } from '@mui/material';
import type { NextPage } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useContext, useEffect, useMemo, useState } from 'react';
import { MusicPlayerContext } from './_app';

const Home: NextPage = () => {
  const theme = useTheme()
  const [searchResults, setSearchResults] = useState<Song[] | null>(null)
  const [formTimeout, setFormTimeout] = useState<NodeJS.Timeout | null>(null)
  const [query, setQuery] = useState<string>("")
  const player = useContext(MusicPlayerContext)

  const search = () => {
    if (query.length < 1) {
      setSearchResults(null)
      return
    }
    lastFm.querySongs(query).then((songs) => {
      if (songs.results) {
        setSearchResults(songs.results.trackmatches.track)
      } else {
        setSearchResults(null)
      }
    })
  }

  useEffect(() => {
    if (formTimeout) clearTimeout(formTimeout)
    setFormTimeout(setTimeout(search, 500))
  }, [query])

  return <div>
    <Box sx={{
      display: 'flex',
      flexDirection: 'row',
      textAlign: 'left',
      flexWrap: 'wrap',
      gap: '0 2rem',
      justifyContent: 'center',
      alignItems: 'center',
      "@media (max-width: 480px)": {
        flexDirection: 'column',
        textAlign: 'center',
        '& > svg': {
          margin: 'auto',
          marginBottom: '-2rem',
        }
      }
    }}>
      <img alt='Ossia Logo' src='/ossia_logo.png' style={{
        width: '10rem',
        filter: 'invert(1)',
        height: '10rem',
        minWidth: '10rem',
        borderRadius: '0.4rem',
        boxShadow: `${theme.shadows[0]} ${theme.shadows[1]} ${theme.shadows[2]} rgba(0,0,0,.4)`,
      }} />
      <div style={{
        textWrap: 'nowrap',
        whiteSpace: 'nowrap',
      }}>
        <Typography color={theme.palette.primary.main} variant="h1">Ossia</Typography>
        <Typography variant="h2">Just listen.</Typography>
      </div>
    </Box>
    <iframe name="hidden" style={{ display: 'none' }} />
    <form action="#" target='hidden' onSubmit={(e) => {
      e.preventDefault()
      search()
      return false
    }}>
      <TextField sx={{
        '& label': {
          transition: 'all .2s ease-in-out',
        },
        '& label[data-shrink="true"]': {
          opacity: 0,
        }
      }} value={query} onChange={(e) => {
        setQuery(e.target.value)
        if (e.target.value.length < 1) {
          setSearchResults(null)
          return
        }
      }} autoComplete='off' name='query' type='text' fullWidth size='medium' style={{ width: '100%' }} label="Search" variant="standard" />
    </form>
    <Divider sx={{ margin: '1rem 0' }} />
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: '.5rem',
    }}>
      {searchResults && searchResults.map((song, i) => {
        return (<Box onClick={() => {
          player.play(song)
        }} component="button" key={`${song.url}`} sx={{
          display: 'flex',
          backgroundColor: "transparent",
          textAlign: 'left',
          alignItems: 'center',
          position: 'relative',
          gap: '1rem',
          border: '1px solid transparent',
          borderRadius: '0.4rem',
          transition: 'border-color .05s ease-in-out, padding .05s ease-in-out',
          'div:has(h5)': {
            transition: 'margin-left .2s ease-in-out',
          },
          ':hover div:has(h5)': {
            marginLeft: '.4rem',
          },
          ':before': {
            content: '""',
            position: 'absolute',
            width: 0,
            height: '4px',
            bottom: 0,
            right: 0,
            borderRadius: '0.4rem',
            backgroundColor: theme.palette.primary.main,
            transition: 'width .2s ease-in-out',
          },
          '&:hover:before': {
            width: 'calc(100% - 3.8rem)',
          },
          '&:focus:before': {
            width: '100%',
          },
          '&:hover': {
            cursor: 'pointer',
          },
          '&:focus': {
            borderColor: theme.palette.primary.main,
            outline: 'none',
            padding: '0.4rem',
          }
        }}>
          <img style={{
            backgroundColor: theme.palette.common.white,
            borderRadius: '0.4rem',
          }} alt={song.name} src={`/api/artwork?artist=${song.artist}&title=${song.name}`} width={64} height={64} />
          <div>
            <Typography variant="h5">{song.name}</Typography>
            <Typography variant="subtitle1">{song.artist}</Typography>
          </div>
        </Box>)
      })}
    </Box>
  </div>;
};

export default Home;