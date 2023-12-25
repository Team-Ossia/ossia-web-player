import { useEffect, useState } from "react"
import { useCookies } from "react-cookie"

export const useGeo = () => {
    const [cookies] = useCookies(['geolocate-method'])
    // method: 1 - IP
    // method: 2 - GPS
    const [geo, setGeo] = useState<{ lat: number, lon: number, source: "ip" | "gps" }>({
        lat: 0,
        lon: 0,
        source: "ip",
    })
    // get geolocation with the method specified in cookies

    const getGeo = async () => {
        if (cookies['geolocate-method'] == 1) {
            const res = await fetch("https://ipapi.co/json/")
            const data = await res.json()
            setGeo({
                lat: data.latitude,
                lon: data.longitude,
                source: "ip",
            })
        } else if (cookies['geolocate-method'] == 2) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setGeo({
                    lat: pos.coords.latitude,
                    lon: pos.coords.longitude,
                    source: "gps",
                })
            })
        }
    }

    //update geo every 5 minutes
    useEffect(() => {
        getGeo()
        const interval = setInterval(() => {
            getGeo()
        }, 1000 * 60 * 5)
        return () => clearInterval(interval)
    }, [cookies['geolocate-method']])

    return geo
}