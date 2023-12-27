import { ContentCut, ContentCopy, ContentPaste, Cloud, PhoneAndroid } from "@mui/icons-material"
import { Divider, ListItemIcon, ListItemText, MenuItem, MenuList, Paper, Typography } from "@mui/material"
import { useCallback, useEffect, useRef, useState } from "react"
import { usePiPWindow } from "./pip"
import { AnimatePresence } from "framer-motion"
import { motion } from "framer-motion"
import { useCookies } from "react-cookie"

export const GlobalContextMenu = ({ x, y }: {
    x: number,
    y: number,

}) => {
    const [focused, setFocused] = useState(false)
    const { requestPipWindow, closePipWindow, pipWindow, isSupported } = usePiPWindow()
    const menuRef = useRef<any>(null)

    const startPiP = useCallback(() => {
        const height = Math.floor(window.innerHeight * .7)
        const width = height * 9 / 16;
        requestPipWindow(width, height);
    }, [requestPipWindow]);

    useEffect(() => {
        if (focused) { menuRef.current?.focus() }
    }, [focused])

    useEffect(() => {
        if (x != -1 && y != -1) setFocused(true)
    }, [x, y])

    return (<AnimatePresence>
        {focused &&
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setFocused(false)}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 9998,
                }}
            >
                <Paper
                    onBlur={() => setFocused(false)}
                    sx={{
                        width: 320,
                        maxWidth: '100%',
                        position: 'fixed',
                        top: y,
                        left: x,
                        zIndex: 9999,
                        '& ul': {
                            paddingTop: 0,
                            paddingBottom: 0,
                        },
                        '& li:first-of-type': {
                            marginTop: '8px',
                        },
                        '& li:last-child': {
                            marginBottom: '8px',
                        }
                    }}>
                    <MenuList sx={{
                        '&:focus': {
                            outline: 'none',
                        }
                    }} ref={menuRef}>
                        {isSupported && <MenuItem onClick={() => {
                            if (pipWindow) closePipWindow()
                            else startPiP()
                        }}>
                            <ListItemIcon>
                                <PhoneAndroid fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Open floating player</ListItemText>
                            <Typography variant="body2" color="text.secondary">
                                (Experimental)
                            </Typography>
                        </MenuItem>}
                    </MenuList>
                </Paper>
            </motion.div>}
    </AnimatePresence>)
}