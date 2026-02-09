import type { AssetType, AssetMetadata } from '../types';

/**
 * Detects the AssetType from a MIME type string.
 */
export function getAssetTypeFromMime(mimeType: string): AssetType {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'text/javascript' || mimeType === 'application/javascript') return 'script';
    return 'other';
}

/**
 * Creates the appropriate DOM element for a given asset type and URL.
 */
export async function createAssetElement(type: AssetType, url: string): Promise<HTMLImageElement | HTMLVideoElement | HTMLAudioElement | null> {
    if (type === 'image') {
        const img = new Image();
        img.src = url;
        await new Promise((resolve, reject) => {
            img.onload = () => resolve(img);
            img.onerror = reject;
        });
        return img;
    }

    if (type === 'video' || type === 'audio') {
        const el = document.createElement(type);
        el.src = url;
        if (el instanceof HTMLVideoElement) {
            el.muted = true;
            el.playsInline = true;
        }
        await new Promise((resolve, reject) => {
            el.onloadedmetadata = () => resolve(el);
            el.onerror = reject;
        });
        return el;
    }

    return null;
}

/**
 * Extracts metadata from a media element or file.
 */
export function extractMediaMetadata(
    file: File | null,
    element: HTMLImageElement | HTMLVideoElement | HTMLAudioElement | null
): AssetMetadata {
    const metadata: AssetMetadata = {
        size: file?.size,
        mimeType: file?.type || (element instanceof HTMLImageElement ? 'image/unknown' : 'media/unknown')
    };

    if (element instanceof HTMLImageElement) {
        metadata.width = element.width;
        metadata.height = element.height;
        metadata.aspectRatio = element.width / element.height;
    } else if (element instanceof HTMLVideoElement) {
        metadata.duration = element.duration;
        metadata.width = element.videoWidth;
        metadata.height = element.videoHeight;
        metadata.aspectRatio = element.videoWidth / element.videoHeight;
    } else if (element instanceof HTMLAudioElement) {
        metadata.duration = element.duration;
    }

    return metadata;
}

/**
 * Decodes audio data from a file or blob for use with the Web Audio API.
 */
export async function decodeAssetAudio(blob: Blob, audioCtx: AudioContext): Promise<AudioBuffer | undefined> {
    try {
        const arrayBuffer = await blob.arrayBuffer();
        return await audioCtx.decodeAudioData(arrayBuffer);
    } catch (e) {
        console.error('Failed to decode audio data:', e);
        return undefined;
    }
}
