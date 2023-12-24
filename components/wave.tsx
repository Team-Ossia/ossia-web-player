import { CSSProperties } from "react"

export const serverWave = ({ gradient }: {
    gradient: {
        start: string,
        stop: string,
    },
}) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={1600} height={198}>
            <defs>
                <linearGradient id="a" x1="50%" x2="50%" y1="-10.959%" y2="100%">
                    <stop stop-color={gradient.start} stop-opacity=".25" offset="0%" />
                    <stop stop-color={gradient.stop} offset="100%" />
                </linearGradient>
            </defs>
            <path fill="url(#a)" fill-rule="evenodd" d="M.005 121C311 121 409.898-.25 811 0c400 0 500 121 789 121v77H0s.005-48 .005-77z" transform="matrix(-1 0 0 1 1600 0)" />
        </svg>
    )
}

export const Wave = ({ gradient, className, style }: {
    gradient: {
        start: string,
        stop: string,
    },
    className?: string,
    style?: CSSProperties,
}) => {
    return (<div className={className} style={{
        ...style,
        background: "url(/api/wave?start=" + encodeURIComponent(gradient.start) + "&stop=" + encodeURIComponent(gradient.stop) + ") repeat-x",
    }} />)
}
