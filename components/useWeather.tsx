import { useEffect, useMemo, useState } from "react"
import { WeatherApiResponse } from "./openMeteo"
import { useGeo } from "./useGeo"
import { getWeatherInfo } from "./openMeteo"

export type WeatherEmulation = {
    whatIsFalling: "rain" | "snow" | null,
    isDay: boolean | null,
}

export type Weather = {
    weather: WeatherApiResponse | null,
    whatIsFalling: "rain" | "snow" | null,
    isDay: boolean | null,
    emulation: WeatherEmulation,
    setEmulation: (emulation: WeatherEmulation) => void,
}

export const useWeather = () => {
    const { lat, lon } = useGeo()
    const [weather, setWeather] = useState<WeatherApiResponse | null>(null)
    const [emulation, setEmulation] = useState<WeatherEmulation>({
        whatIsFalling: null,
        isDay: null,
    })

    const whatIsFalling = useMemo(() => {
        if (emulation.whatIsFalling) return emulation.whatIsFalling
        if (!weather || !weather.current) return null
        if (weather.current.rain > 0) return "rain"
        if (weather.current.snowfall > 0) return "snow"
        return null
    }, [weather, emulation])

    const isDay = useMemo(() => {
        if (emulation.isDay !== null) return emulation.isDay
        if (!weather || !weather.current) return null
        return weather.current.is_day == 1
    }, [weather, emulation])

    useEffect(() => {
        // get weather data every minute
        if (!lat || !lon) return;
        const ac = new AbortController()
        getWeatherInfo({
            latitude: lat,
            longitude: lon,
            ac,
        }).then((data) => {
            setWeather(data)
        }).catch(() => { })
        const interval = setInterval(() => {
            getWeatherInfo({
                latitude: lat,
                longitude: lon,
                ac,
            }).then((data) => {
                setWeather(data)
            }).catch(() => { })
        }, 1000 * 60)
        return () => {
            clearInterval(interval)
            ac.abort()
        }
    }, [lat, lon])

    return {
        weather,
        whatIsFalling,
        isDay,
        emulation,
        setEmulation,
    }
}