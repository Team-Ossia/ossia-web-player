export const apiroot = "https://pipedapi.kavin.rocks"

export type SearchResponse = {
    corrected: boolean,
    items: {
        id: string,
        name: string,
        url: string,
        artist: string,
        duration: number,
        thumbnail: string,
    }[],
}

export const search = (rb: {
    filter?: 'videos' | 'channels' | 'playlists' | 'community' | 'all',
    q: string,
    nextpage?: string,
}) => {
    return new Promise(async (resolve, reject) => {
        let np = ""
        if (rb["nextpage"]) {
            np = "nextpage/"
        }
        const params = new URLSearchParams(rb as any).toString()
        let resp
        try { resp = await (await fetch(`${apiroot}/${np}search?${params}`)).json() } catch { resp = {} }
        resolve(resp)
    }) as Promise<SearchResponse>
}

type StreamsResponse = {
    title: string;
    description: string;
    uploadDate: string;
    uploader: string;
    uploaderUrl: string;
    uploaderAvatar: string;
    thumbnailUrl: string;
    hls: string;
    dash: string | null;
    lbryId: string | null;
    category: string;
    license: string;
    visibility: string;
    tags: string[];
    metaInfo: any[]; // You might want to replace this with a specific type
    uploaderVerified: boolean;
    duration: number;
    views: number;
    likes: number;
    dislikes: number;
    uploaderSubscriberCount: number;
    audioStreams: AudioStream[];
    videoStreams: VideoStream[];
    relatedStreams: RelatedStream[];
    subtitles: any[]; // You might want to replace this with a specific type
    livestream: boolean;
    proxyUrl: string;
    chapters: any[]; // You might want to replace this with a specific type
    previewFrames: PreviewFrame[];
};

type AudioStream = {
    url: string;
    format: string;
    quality: string;
    mimeType: string;
    codec: string;
    // Add more properties if needed
};

type VideoStream = {
    url: string;
    format: string;
    quality: string;
    mimeType: string;
    codec: string;
    width: number;
    height: number;
    fps: number;
    bitrate: number;
    // Add more properties if needed
};

type RelatedStream = {
    url: string;
    type: string;
    title: string;
    thumbnail: string;
    uploaderName: string;
    uploaderUrl: string;
    uploaderAvatar: string;
    uploadedDate: string;
    shortDescription: string | null;
    duration: number;
    views: number;
    uploaded: number;
    uploaderVerified: boolean;
    isShort: boolean;
    // Add more properties if needed
};

type PreviewFrame = {
    urls: string[];
    frameWidth: number;
    frameHeight: number;
    totalCount: number;
    durationPerFrame: number;
    framesPerPageX: number;
    framesPerPageY: number;
    // Add more properties if needed
};


export const getStreams = (rb: {
    id: string,
}) => {
    return new Promise(async (resolve, reject) => {
        // leave id out of params
        let resp
        try { resp = await (await fetch(`${apiroot}/streams/${rb.id}`)).json() } catch { resp = {} }
        resolve(resp)
    }) as Promise<StreamsResponse>
}

const piped = {
    search,
    getStreams,
    apiroot,
}

export default piped