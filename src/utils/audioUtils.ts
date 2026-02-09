import type { AudioAnalysis } from '../types';

/**
 * Encodes an AudioBuffer to a WAV File (ArrayBuffer)
 */
export const audioBufferToWav = (buffer: AudioBuffer) => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);
    const channels = [];
    let i;
    let sample;
    let offset = 0;
    let pos = 0;

    // write WAVE header
    const setUint32 = (data: number) => {
        view.setUint32(pos, data, true);
        pos += 4;
    };

    const setUint16 = (data: number) => {
        view.setUint16(pos, data, true);
        pos += 2;
    };

    setUint32(0x46464952);                         // "RIFF"
    setUint32(length - 8);                         // file length - 8
    setUint32(0x45564157);                         // "WAVE"

    setUint32(0x20746d66);                         // "fmt " chunk
    setUint32(16);                                 // length = 16
    setUint16(1);                                  // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2);                      // block-align
    setUint16(16);                                 // 16-bit (hardcoded)

    setUint32(0x61746164);                         // "data" - chunk
    setUint32(length - pos - 4);                   // chunk length

    // write interleaved data
    for (i = 0; i < buffer.numberOfChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
        for (i = 0; i < numOfChan; i++) {             // interleave channels
            sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
            sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF); // scale to 16-bit signed int
            view.setInt16(pos, sample, true);          // write 16-bit sample
            pos += 2;
        }
        offset++;                                     // next sample y
    }

    return bufferArray;
};

/**
 * Offline Audio Analysis for non-realtime exports
 */
export class OfflineAudioAnalyzer {
    private buffer: AudioBuffer;
    private fftSize: number = 256;
    private sampleRate: number;
    private window: Float32Array;

    constructor(buffer: AudioBuffer) {
        this.buffer = buffer;
        this.sampleRate = buffer.sampleRate;
        // Precompute Hanning window
        this.window = new Float32Array(this.fftSize);
        for (let i = 0; i < this.fftSize; i++) {
            this.window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (this.fftSize - 1)));
        }
    }

    private fft(real: Float32Array, imag: Float32Array) {
        const n = real.length;
        if (n <= 1) return;

        for (let i = 0, j = 0; i < n; i++) {
            if (i < j) {
                const tr = real[i]; real[i] = real[j]; real[j] = tr;
                const ti = imag[i]; imag[i] = imag[j]; imag[j] = ti;
            }
            let m = n >> 1;
            while (m >= 1 && j >= m) {
                j -= m;
                m >>= 1;
            }
            j += m;
        }

        for (let s = 2; s <= n; s <<= 1) {
            const angle = -2 * Math.PI / s;
            const wr = Math.cos(angle);
            const wi = Math.sin(angle);
            for (let j = 0; j < n; j += s) {
                let w_ir = 1;
                let w_ii = 0;
                for (let k = 0; k < s / 2; k++) {
                    const tr = w_ir * real[j + k + s / 2] - w_ii * imag[j + k + s / 2];
                    const ti = w_ir * imag[j + k + s / 2] + w_ii * real[j + k + s / 2];
                    real[j + k + s / 2] = real[j + k] - tr;
                    imag[j + k + s / 2] = imag[j + k] - ti;
                    real[j + k] += tr;
                    imag[j + k] += ti;
                    const tmp = w_ir * wr - w_ii * wi;
                    w_ii = w_ir * wi + w_ii * wr;
                    w_ir = tmp;
                }
            }
        }
    }

    analyze(time: number, playbackRate: number = 1, startOffset: number = 0): AudioAnalysis {
        const adjTime = (time - startOffset) * playbackRate;
        if (adjTime < 0 || adjTime >= this.buffer.duration) {
            return {
                volume: 0, bass: 0, mid: 0, treble: 0,
                spectrum: new Array(this.fftSize / 2).fill(0),
                waveform: new Array(this.fftSize).fill(0)
            };
        }
        const startSample = Math.floor(adjTime * this.sampleRate);
        const real = new Float32Array(this.fftSize);
        const imag = new Float32Array(this.fftSize);
        const raw = new Float32Array(this.fftSize);

        // Extract window
        for (let i = 0; i < this.fftSize; i++) {
            const idx = startSample + i;
            if (idx > 0 && idx < this.buffer.length) {
                let val = 0;
                for (let ch = 0; ch < this.buffer.numberOfChannels; ch++) {
                    val += this.buffer.getChannelData(ch)[idx];
                }
                raw[i] = val / this.buffer.numberOfChannels;
                real[i] = raw[i] * this.window[i];
            }
        }

        this.fft(real, imag);

        const spectrum = new Float32Array(this.fftSize / 2);
        const minDb = -100;
        const maxDb = -30;

        for (let i = 0; i < this.fftSize / 2; i++) {
            // Magnitude and conversion to dB
            const mag = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]) / this.fftSize;
            const db = 20 * Math.log10(Math.max(1e-10, mag));
            // Scale to 0-1 based on Web Audio defaults
            spectrum[i] = Math.max(0, Math.min(1, (db - minDb) / (maxDb - minDb)));
        }

        const getAverage = (start: number, end: number) => {
            let sum = 0;
            for (let i = start; i < end; i++) sum += spectrum[i];
            return sum / (end - start);
        };

        return {
            volume: getAverage(0, spectrum.length),
            bass: getAverage(0, 10),
            mid: getAverage(10, 50),
            treble: getAverage(50, 100),
            spectrum: Array.from(spectrum),
            waveform: Array.from(raw)
        };
    }
}
