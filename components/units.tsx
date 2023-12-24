export const dvh = (number: number) => {
    if (typeof window === 'undefined') return `${number}vh`
    //check if css supports dvh
    if (CSS.supports('height', '100dvh')) {
        return `${number}dvh`
    } else {
        return `${number}vh`
    }
}

export const svh = (number: number) => {
    if (typeof window === 'undefined') return `${number}vh`
    //check if css supports dvh
    if (CSS.supports('height', '100svh')) {
        return `${number}svh`
    } else {
        return `${number}vh`
    }
}

export const lvh = (number: number) => {
    if (typeof window === 'undefined') return `${number}vh`
    //check if css supports dvh
    if (CSS.supports('height', '100lvh')) {
        return `${number}lvh`
    } else {
        return `${number}vh`
    }
}