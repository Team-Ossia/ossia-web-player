import { useEffect, useMemo, useState } from "react"
import { WeatherApiResponse } from "./openMeteo"
import { useGeo } from "./useGeo"
import { getWeatherInfo } from "./openMeteo"

export const useWeather = () => {
    const { lat, lon } = useGeo()
    const [weather, setWeather] = useState<WeatherApiResponse | null>(null)

    const whatIsFalling = useMemo(() => {
        if (!weather || !weather.current) return null
        if (weather.current.rain > 0) return "rain"
        if (weather.current.snowfall > 0) return "snow"
        return null
    }, [weather])

    const isDay = useMemo(() => {
        if (!weather || !weather.current) return null
        return weather.current.is_day == 1
    }, [weather])

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
    }
}