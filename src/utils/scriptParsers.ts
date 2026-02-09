/**
 * vibclip Script Metadata Parser
 * Extracts and updates metadata stored in comments to avoid modifying source code directly.
 */

export function parseScriptMetadata(code: string): { start?: number; duration?: number } {
    // 1. First, check for the structured @vibclip comment block
    // Format: /* @vibclip duration: 10, start: 0 */
    const metaRegex = /\/\*\s*@vibclip\s+(.*?)\s*\*\//;
    const match = code.match(metaRegex);

    if (match) {
        const content = match[1];
        const result: { start?: number; duration?: number } = {};

        const durMatch = content.match(/duration:\s*([\d.]+)/);
        if (durMatch) result.duration = parseFloat(durMatch[1]);

        const startMatch = content.match(/start:\s*([\d.]+)/);
        if (startMatch) result.start = parseFloat(startMatch[1]);

        if (result.duration !== undefined) return result;
    }

    // 2. Fallback: Try evaluation (for legacy scripts)
    try {
        const fn = new Function(`
            const start = undefined;
            const duration = undefined;
            ${code}
            return { 
                start: typeof start !== 'undefined' ? Number(start) : undefined, 
                duration: typeof duration !== 'undefined' ? Number(duration) : undefined 
            };
        `);
        const result = fn();
        if (typeof result.duration === 'number' && !isNaN(result.duration)) {
            return result;
        }
    } catch (e) { }

    // 3. Last Fallback: Regex for simple declarations (legacy)
    const dMatch = code.match(/(?:const|let|var)\s+duration\s*=\s*([\d.]+)/);
    const sMatch = code.match(/(?:const|let|var)\s+start\s*=\s*([\d.]+)/);

    return {
        start: sMatch ? parseFloat(sMatch[1]) : undefined,
        duration: dMatch ? parseFloat(dMatch[1]) : undefined
    };
}

export function updateScriptMetadata(
    code: string,
    updates: { start?: number; duration?: number }
): string {
    const metaRegex = /\/\*\s*@vibclip\s+(.*?)\s*\*\//;
    const match = code.match(metaRegex);

    // Default values if we don't find them in the comment
    let current = parseScriptMetadata(code);
    const start = updates.start !== undefined ? updates.start : current.start || 0;
    const duration = updates.duration !== undefined ? updates.duration : current.duration || 10;

    const newMeta = `/* @vibclip duration: ${duration.toFixed(2)}, start: ${start.toFixed(2)} */`;

    if (match) {
        // Update existing comment
        return code.replace(metaRegex, newMeta);
    } else {
        // Add new comment at the top, but after any imports
        const lines = code.split('\n');
        let insertIndex = 0;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().startsWith('import')) {
                insertIndex = i + 1;
            } else if (lines[i].trim() !== '') {
                break;
            }
        }

        lines.splice(insertIndex, 0, newMeta);
        return lines.join('\n');
    }
}
