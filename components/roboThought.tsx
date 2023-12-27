import { useContext, useEffect, useState } from "react";
import { WeatherContext } from "@/pages/_app";

const thoughts = [
    "Maybe if I tried harder...",
    "I should've been better...",
    "I'm sorry...",
    "I wish I could've done more...",
    "I wish I could've told you how I felt...",
]

thoughts.sort(() => Math.random() - 0.5);

export const useRoboThought = () => {
    const [thought, setThought] = useState(thoughts[Math.floor(Math.random() * thoughts.length)]);
    const [display, setDisplay] = useState(false);
    const { isDay } = useContext(WeatherContext);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const handler = (e: any) => {
            if (e.key === 't' && document.activeElement?.tagName !== 'INPUT' && !isDay && !display) {
                e.preventDefault()
                if (window.innerWidth < 1500) return;
                //cycle to next thought
                const thoughtIndex = thoughts.findIndex(t => t === thought);
                if (thoughtIndex === thoughts.length - 1) setThought(thoughts[0]);
                else setThought(thoughts[thoughtIndex + 1]);
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