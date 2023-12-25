import { useEffect, useState } from "react";
import { useWeather } from "./useWeather";

const thoughts = [
    "Maybe if I tried harder...",
    "I should've been better...",
    "I'm sorry...",
    "I wish I could've done more...",
    "I wish I could've told you how I felt...",
]

export const useRoboThought = () => {
    const [thought, setThought] = useState('');
    const [display, setDisplay] = useState(false);
    const { isDay } = useWeather();

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const handler = (e: any) => {
            if (e.key === 't' && document.activeElement?.tagName !== 'INPUT' && !isDay && !display) {
                e.preventDefault()
                if (window.innerWidth < 1500) return;
                setThought(thoughts[Math.floor(Math.random() * thoughts.length)]);
                setDisplay(true);
                setTimeout(() => {
                    setDisplay(false);
                }, 5000);
            }
        }
        window.addEventListener('keypress', handler)
        return () => {
            window.removeEventListener('keypress', handler)
        }
    }, [isDay, display])

    return {
        display,
        thought,
    }
}