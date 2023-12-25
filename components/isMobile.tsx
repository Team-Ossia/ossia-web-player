import { useEffect, useState } from "react"

export const isMobile = () => {
    const ua = window.navigator.userAgent
    const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i)
    const webkit = !!ua.match(/WebKit/i)
    const iOSSafari = iOS && webkit && !ua.match(/CriOS/i)
    const android = !!ua.match(/Android/i)
    const androidChrome = android && !!ua.match(/Chrome/i)
    const touchscreen = window.matchMedia('(hover: none)').matches
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const res = iOS || android || androidChrome || iOSSafari || touchscreen || coarse
    return res
}

export const useIsMobile = () => {
    const [isMobileState, setIsMobile] = useState(false)
    useEffect(() => {
        if (typeof window === 'undefined') return
        setIsMobile(isMobile())
        const interval = setInterval(() => {
            setIsMobile(isMobile())
        }, 500)
        return () => {
            clearInterval(interval)
        }
    }, [])
    return isMobileState
}

export const isIos = () => {
    const ua = window.navigator.userAgent
    const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i)
    const webkit = !!ua.match(/WebKit/i)
    const iOSSafari = iOS && webkit && !ua.match(/CriOS/i)
    return iOSSafari
}

export const useIsIos = () => {
    const [isIosState, setIsIos] = useState(false)
    useEffect(() => {
        if (typeof window === 'undefined') return
        setIsIos(isIos())
        const interval = setInterval(() => {
            setIsIos(isIos())
        }, 500)
        return () => {
            clearInterval(interval)
        }
    }, [])
    return isIosState
}