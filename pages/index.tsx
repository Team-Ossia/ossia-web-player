import lastFm, { Song } from '@/components/lastFm';
import { MusicNote, Search } from '@mui/icons-material';
import { Box, Button, CircularProgress, Divider, FormControl, IconButton, TextField, Typography, useTheme } from '@mui/material';
import type { NextPage } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useContext, useEffect, useMemo, useState } from 'react';
import { MusicPlayerContext } from './_app';
import { useIsIos, useIsMobile } from '@/components/isMobile';
import { AnimatePresence, motion } from 'framer-motion';

const PlayableSong = ({ song }: { song: Song }) => {
  const player = useContext(MusicPlayerContext)

  return (<Box
    onClick={() => {
      player.play(song)
    }} component="button" key={`${song.url}`} sx={(theme) => ({
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
    })}>
    <img style={{
      backgroundColor: "white",
      borderRadius: '0.4rem',
      width: 64,
      height: 64,
      minWidth: 64,
    }} alt={song.name} src={`/api/artwork?artist=${song.artist}&title=${song.name}`} width={64} height={64} />
    <div style={{
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: '.2rem',
      flexShrink: 1,
    }}>
      <Typography style={{
        // line clamp 2
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        color: "white",
        WebkitLineClamp: 2,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }} variant="h5">{song.name}</Typography>
      <Typography style={{
        color: "white",
      }} variant="subtitle1">{song.artist}</Typography>
    </div>
  </Box>)
}

const Home: NextPage = () => {
  const theme = useTheme()
  const [searchResults, setSearchResults] = useState<Song[] | null>(null)
  const [formTimeout, setFormTimeout] = useState<NodeJS.Timeout | null>(null)
  const [query, setQuery] = useState<string>("")
  const [searchLoading, setSearchLoading] = useState(false)
  const [adornmentAttached, setAdornmentAttached] = useState(false)

  useEffect(() => {
    if (searchLoading) setAdornmentAttached(true)
  }, [searchLoading])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('buttons-reload'))
  }, [searchResults])

  const search = () => {
    if(!query) return
    setSearchLoading(true)
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
    }).finally(() => {
      setSearchLoading(false)
    })
  }

  useEffect(() => {
    if (formTimeout) clearTimeout(formTimeout)
    setFormTimeout(setTimeout(search, 500))
  }, [query])

  return <div>
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
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
      <img alt='Ossia Logo' src='/ossia_hero_white.png' style={{
        width: '25rem',
        height: 'auto',
        maxWidth: 'calc(100% - 6rem)',
        // minWidth: '20rem',
        borderRadius: '0.4rem',
        filter: `drop-shadow(${theme.shadows[0]} ${theme.shadows[1]} ${theme.shadows[2]} rgba(0,0,0,.4))`,
      }} />
    </Box>
    <iframe name="hidden" style={{ display: 'none' }} />
    <form action="#" target='hidden' onSubmit={(e) => {
      e.preventDefault()
      search()
      return false
    }}>
      <TextField InputProps={{
        startAdornment: adornmentAttached ? (
          <AnimatePresence>
            {searchLoading && <motion.div key='loading'
              initial={{ width: 0 }}
              animate={{ width: 'auto' }}
              exit={{ width: 0 }}
              style={{
                overflow: 'hidden',
              }}
              onAnimationEnd={() => {
                if (!searchLoading) setAdornmentAttached(false)
              }}
              transition={{ duration: 0.2, type: 'keyframes' }}
            >
              <CircularProgress sx={{
                color: "white",
                marginRight: '.5rem',
              }} size={24} />
            </motion.div>}
          </AnimatePresence>
        ) : undefined
      }} id='search-input' sx={{
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
        return (<PlayableSong key={`${song.url}`} song={song} />)
      })}
    </Box>
  </div >;
};

export default Home;