import type { TextSystem } from '../../types';

export const createTextSystem = (
    ctx: CanvasRenderingContext2D
): TextSystem => {
    const text: TextSystem = {
        draw: (str, x, y, opts = {}) => {
            ctx.font = `${opts.size || 24}px ${opts.font || 'Inter, sans-serif'}`;
            ctx.textAlign = opts.align || 'left';
            ctx.fillStyle = opts.color || 'white';
            if (opts.outlineWidth) {
                ctx.strokeStyle = opts.outlineColor || 'black';
                ctx.lineWidth = opts.outlineWidth;
                ctx.strokeText(str, x, y);
            }
            ctx.fillText(str, x, y);
        },
        glitch: (str, x, y, intensity) => {
            const offset = intensity * 10;
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = 'cyan';
            text.draw(str, x - offset, y);
            ctx.fillStyle = 'magenta';
            text.draw(str, x + offset, y);
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            text.draw(str, x, y);
        },
        block: (textStr, x, y, maxWidth, opts = {}) => {
            const size = opts.size || 24;
            const font = opts.font || 'Inter, sans-serif';
            const color = opts.color || 'white';
            const lineHeight = opts.lineHeight || 1.2;
            const align = opts.align || 'left';
            const isMarkdown = opts.markdown ?? true;

            const getStyleFont = (bold: boolean, italic: boolean) => {
                let prefix = '';
                if (bold && italic) prefix = 'bold italic ';
                else if (bold) prefix = 'bold ';
                else if (italic) prefix = 'italic ';
                return `${prefix}${size}px ${font}`;
            };

            // 1. Parse into Spans
            interface Span { text: string; bold: boolean; italic: boolean; width: number }
            let spans: Span[] = [];

            if (isMarkdown) {
                const regex = /(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*|[^*]+)/g;
                let match;
                while ((match = regex.exec(textStr)) !== null) {
                    let s = match[0];
                    let bold = false, italic = false;
                    if (s.startsWith('***') && s.endsWith('***')) { bold = true; italic = true; s = s.slice(3, -3); }
                    else if (s.startsWith('**') && s.endsWith('**')) { bold = true; s = s.slice(2, -2); }
                    else if (s.startsWith('*') && s.endsWith('*')) { italic = true; s = s.slice(1, -1); }

                    ctx.font = getStyleFont(bold, italic);
                    spans.push({ text: s, bold, italic, width: ctx.measureText(s).width });
                }
            } else {
                ctx.font = getStyleFont(false, false);
                spans.push({ text: textStr, bold: false, italic: false, width: ctx.measureText(textStr).width });
            }

            // 2. Wrap into Lines
            interface Line { spans: Span[]; width: number }
            const lines: Line[] = [];
            let currentLine: Line = { spans: [], width: 0 };

            // Helper to split a span by words
            const pushSpanToLines = (span: Span) => {
                const words = span.text.split(/(\s+)/);
                for (const word of words) {
                    ctx.font = getStyleFont(span.bold, span.italic);
                    const wordWidth = ctx.measureText(word).width;

                    if (currentLine.width + wordWidth > maxWidth && currentLine.spans.length > 0) {
                        lines.push(currentLine);
                        currentLine = { spans: [], width: 0 };
                        // Skip leading space on new line
                        if (word.trim() === '') continue;
                    }

                    const wordSpan = { ...span, text: word, width: wordWidth };
                    currentLine.spans.push(wordSpan);
                    currentLine.width += wordWidth;
                }
            };

            spans.forEach(pushSpanToLines);
            if (currentLine.spans.length > 0) lines.push(currentLine);

            // 3. Render Lines
            ctx.save();
            ctx.textBaseline = 'top';
            ctx.fillStyle = color;

            lines.forEach((line, i) => {
                let lineX = x;
                let extraSpace = 0;
                const isLastLine = i === lines.length - 1;

                if (align === 'center') lineX += (maxWidth - line.width) / 2;
                else if (align === 'right') lineX += maxWidth - line.width;
                else if (align === 'justify' && !isLastLine) {
                    const spaces = line.spans.filter(s => s.text.trim() === '').length;
                    if (spaces > 0) extraSpace = (maxWidth - line.width) / spaces;
                }

                line.spans.forEach(span => {
                    ctx.font = getStyleFont(span.bold, span.italic);
                    if (opts.outlineWidth) {
                        ctx.strokeStyle = opts.outlineColor || 'black';
                        ctx.lineWidth = opts.outlineWidth;
                        ctx.strokeText(span.text, lineX, y + i * size * lineHeight);
                    }
                    ctx.fillText(span.text, lineX, y + i * size * lineHeight);
                    lineX += span.width + (span.text.trim() === '' ? extraSpace : 0);
                });
            });

            ctx.restore();
        },
        fit: (str, x, y, w, h, opts = {}) => {
            // Binary search for best font size
            let minSize = opts.minSize || 10;
            let maxSize = opts.maxSize || 200;
            let bestSize = minSize;

            // Simple heuristic to start
            let currentSize = Math.floor((minSize + maxSize) / 2);

            ctx.save();
            ctx.font = `${currentSize}px ${opts.font || 'Inter, sans-serif'}`;
            const textMetrics = ctx.measureText(str);

            // If huge single line, scale based on width directly
            if (!str.includes('\n') && !opts.markdown && textMetrics.width > 0) {
                bestSize = Math.min(maxSize, Math.max(minSize, currentSize * (w / textMetrics.width)));
            } else {
                // Iterative approach for multiline/wrapped text
                // We'll just try 3 iterations to be fast
                for (let i = 0; i < 4; i++) {
                    // Check if current size fits
                    // Note: This is a simplified check. For true wrapping check we'd need to dry-run block()
                    // Here we assume approx char count and aspect ratio
                    const estCharsPerLine = w / (currentSize * 0.6);
                    const estLines = Math.ceil(str.length / estCharsPerLine);
                    const estHeight = estLines * currentSize * (opts.lineHeight || 1.2);

                    if (estHeight < h && (str.length < estCharsPerLine || ctx.measureText(str).width < w * 1.5)) {
                        bestSize = currentSize;
                        minSize = currentSize;
                    } else {
                        maxSize = currentSize;
                    }
                    currentSize = Math.floor((minSize + maxSize) / 2);
                }
            }
            ctx.restore();

            // Render with best size
            text.block(str, x, y, w, { ...opts, size: bestSize });
        }
    };
    return text;
};
