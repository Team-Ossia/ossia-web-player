export const georoot = "https://geocoding-api.open-meteo.com";
export const apiroot = "https://api.open-meteo.com";

type City = {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    elevation: number;
    feature_code: string;
    country_code: string;
    timezone: string;
    population: number;
    postcodes: string[];
    country_id: number;
    country: string;
};

type GeoSearchResponse = {
    results: City[];
    generationtime_ms: number;
};


export const geoSearch = (rb: {
    name: string,
    count?: number,
    language?: string,
    ac?: AbortController,
}) => {
    // https://geocoding-api.open-meteo.com/v1/search?name=Berlin&count=10&language=en&format=json
    return new Promise(async (resolve, reject) => {
        let resp
        try { resp = await (await fetch(`${georoot}/v1/search?name=${rb.name}&count=${rb.count || 10}&language=${rb.language || 'en'}&format=json`, { signal: rb.ac?.signal })).json() } catch { resp = {} }
        resolve(resp)
    }) as Promise<GeoSearchResponse>
}

type CurrentUnits = {
    time: string;
    interval: string;
    temperature_2m: string;
    rain: string;
    snowfall: string;
};

type CurrentData = {
    time: string;
    interval: number;
    temperature_2m: number;
    rain: number;
    is_day: 0 | 1;
    snowfall: number;
};

export type WeatherApiResponse = {
    latitude: number;
    longitude: number;
    generationtime_ms: number;
    utc_offset_seconds: number;
    timezone: string;
    timezone_abbreviation: string;
    elevation: number;
    current_units: CurrentUnits;
    current: CurrentData;
};


export const getWeatherInfo = (rb: {
    latitude: number,
    longitude: number,
    ac?: AbortController,
}) => {
    return new Promise(async (resolve, reject) => {
        let resp
        try { resp = await (await fetch(`${apiroot}/v1/forecast?latitude=${rb.latitude}&longitude=${rb.longitude}&timezone=auto&current=temperature_2m,rain,snowfall,is_day&forecast_days=1`, { signal: rb.ac?.signal })).json() } catch { resp = {} }
        resolve(resp)
    }) as Promise<WeatherApiResponse>
}

const openMeteo = {
    geoSearch,
    apiroot,
}

export default openMeteo;