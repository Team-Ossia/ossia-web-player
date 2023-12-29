import lastFm, { Song } from '@/components/lastFm';
import { Box, CircularProgress, Divider, TextField, Typography, useTheme } from '@mui/material';
import type { NextPage } from 'next';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { MusicPlayerContext } from './_app';
import { AnimatePresence, motion } from 'framer-motion';

export const RevolvingText = ({ children }: { children: React.ReactNode }) => {
  const container = useRef<HTMLDivElement>(null)
  const [doRevolve, setDoRevolve] = useState(false)

  useEffect(() => {
    if (container.current!.scrollWidth > container.current!.offsetWidth) setDoRevolve(true)
  }, [container.current])

  return (<div ref={container} style={{
    display: 'flex',
    flexDirection: 'row',
    gap: '.5rem',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  }}>
    <div style={{
      width: 'max-content',
    }}>
      {doRevolve ? <motion.div
        animate={{
          x: [0,
            -container.current!.scrollWidth + container.current!.clientWidth,
            0],
        }}
        transition={{
          repeat: Infinity,
          duration: 10,
          ease: 'linear',
        }}
      >
        {children}
      </motion.div> : children}
    </div>
  </div>)
}

export const PlayableSong = ({ song }: { song: Song }) => {
  const player = useContext(MusicPlayerContext)

  return (<Box
    onClick={() => {
      if (player.context && player.context.state === 'suspended') player.context.resume()
      player.play(song)
    }} component="button" key={`${song.spotify_id}`} sx={(theme) => ({
      display: 'flex',
      backgroundColor: "transparent",
      textAlign: 'left',
      alignItems: 'center',
      position: 'relative',
      gap: '1rem',
      border: '1px solid transparent',
      borderRadius: '0.4rem',
      transition: 'border-color .05s ease-in-out, padding .05s ease-in-out',
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
      '&:hover:before, &:focus:before': {
        width: 'calc(100% - 3.8rem)',
      },
      '&:hover, &:focus': {
        cursor: 'pointer',
        outline: 'none',
      },
    })}>
    <img style={{
      backgroundColor: "white",
      borderRadius: '0.4rem',
      width: 64,
      height: 64,
      minWidth: 64,
    }} alt={song.name} src={`/api/spotify/artwork?artist=${song.artist}&title=${song.name}`} width={64} height={64} />
    <div style={{
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: '.2rem',
      flexShrink: 1,
    }}>
      <RevolvingText>
        <Typography style={{
          color: "white",
          width: "max-content",
        }} variant="h5">{song.name}</Typography>
      </RevolvingText>
      <Typography style={{
        color: "white",
        whiteSpace: 'nowrap',
        overflow: 'hidden',
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

  const search = useCallback(() => {
    if (!query) return
    const ac = new AbortController()
    setSearchLoading(true)
    if (query.length < 1) {
      setSearchResults(null)
      return
    }
    lastFm.querySongs(query, ac).then((songs) => {
      if (songs.results) {
        setSearchResults(songs.results.trackmatches.track)
      } else {
        setSearchResults(null)
      }
    }).catch(() => { }).finally(() => {
      setSearchLoading(false)
    })
    return () => {
      ac.abort()
    }
  }, [query])

  useEffect(() => {
    if (formTimeout) clearTimeout(formTimeout)
    setFormTimeout(setTimeout(search, 500))
  }, [query])

  return <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  }}>
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      textAlign: 'left',
      flexWrap: 'wrap',
      position: 'relative',
      justifyContent: 'center',
      margin: 'auto',
      alignItems: 'center',
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
    <form style={{
      width: '100%',
    }} action="#" target='hidden' onSubmit={(e) => {
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
        width: '100%',
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
      width: '100%',
    }}>
      {searchResults && searchResults.map((song, i) => {
        return (<PlayableSong key={`${song.spotify_id}`} song={song} />)
      })}
    </Box>
  </div >;
};

export default Home;