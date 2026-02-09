/**
 * Predefined color palettes for cinematic effects
 */
export const palettes: Record<string, string[]> = {
    cyberpunk: ["#ff00ff", "#00ffff", "#ffff00", "#00ff00", "#ff0000"],
    retro: ["#f06292", "#ba68c8", "#9575cd", "#7986cb", "#64b5f6"],
    vintage: ["#d4a373", "#faedcd", "#fefae0", "#e9edc9", "#ccd5ae"],
    noir: ["#000000", "#333333", "#666666", "#999999", "#ffffff"],
    vibrant: ["#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5"],
};

/**
 * Converts a color string to RGB object
 */
export function toRGB(str: string): { r: number, g: number, b: number, a: number } {
    // If we're in a worker, this DOM trick won't work. 
    // For now we assume this is called in the main thread for preview/ui.
    if (typeof document === 'undefined') {
        // Fallback for non-DOM environments (very basic hex support)
        if (str.startsWith('#')) {
            const hex = str.slice(1);
            if (hex.length === 3) {
                return {
                    r: parseInt(hex[0] + hex[0], 16),
                    g: parseInt(hex[1] + hex[1], 16),
                    b: parseInt(hex[2] + hex[2], 16),
                    a: 1
                };
            }
            return {
                r: parseInt(hex.slice(0, 2), 16),
                g: parseInt(hex.slice(2, 4), 16),
                b: parseInt(hex.slice(4, 6), 16),
                a: 1
            };
        }
        return { r: 255, g: 255, b: 255, a: 1 };
    }

    const el = document.createElement('div');
    el.style.color = str;
    document.body.appendChild(el);
    const style = window.getComputedStyle(el).color;
    document.body.removeChild(el);

    const match = style.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!match) return { r: 0, g: 0, b: 0, a: 1 };
    return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
        a: match[4] ? parseFloat(match[4]) : 1
    };
}

/**
 * Converts color to HSL object
 */
export function toHSL(str: string): { h: number, s: number, l: number, a: number } {
    const { r, g, b, a } = toRGB(str);
    const r_ = r / 255, g_ = g / 255, b_ = b / 255;
    const max = Math.max(r_, g_, b_), min = Math.min(r_, g_, b_);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r_: h = (g_ - b_) / d + (g_ < b_ ? 6 : 0); break;
            case g_: h = (b_ - r_) / d + 2; break;
            case b_: h = (r_ - g_) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100, a };
}

/**
 * Interpolates between two colors
 */
export function lerpColor(a: string, b: string, t: number): string {
    const c1 = toRGB(a);
    const c2 = toRGB(b);
    const r = Math.round(c1.r + (c2.r - c1.r) * t);
    const g = Math.round(c1.g + (c2.g - c1.g) * t);
    const bl = Math.round(c1.b + (c2.b - c1.b) * t);
    const alpha = c1.a + (c2.a - c1.a) * t;
    return `rgba(${r},${g},${bl},${alpha})`;
}
