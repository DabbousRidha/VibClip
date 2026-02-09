
import React, { useState, useEffect } from 'react';
import type { Asset } from '../../types';

interface TimelineBlockProps {
    asset: Asset;
    duration: number; // Total project duration
    containerWidth: number;
    onUpdate: (id: string, updates: Partial<Asset>) => void;
    onSelect: (id: string) => void;
    onEdit: (id: string) => void;
    isSelected: boolean;
}

const TimelineBlock: React.FC<TimelineBlockProps> = ({ asset, duration, containerWidth, onUpdate, onSelect, onEdit, isSelected }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState(0);
    const [initialStartOffset, setInitialStartOffset] = useState(0);
    // Convert time to pixels
    const pixelsPerSecond = containerWidth / duration;

    const startOffset = asset.startOffset || 0;
    // Use metadata duration if available, else default to something visible (e.g. 2s or remaining time)
    const assetDuration = asset.metadata.duration || 2;

    const left = startOffset * pixelsPerSecond;
    const width = assetDuration * pixelsPerSecond;

    const dragPixelsPerSecondRef = React.useRef(pixelsPerSecond);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDragging(true);
        setDragStartX(e.clientX);
        setInitialStartOffset(asset.startOffset || 0);
        dragPixelsPerSecondRef.current = pixelsPerSecond; // Capture current scale
        onSelect(asset.id);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;

            const deltaX = e.clientX - dragStartX;
            // Use captured scale to ensure 1px mouse move = constant time delta, regardless of zoom
            const deltaTime = deltaX / dragPixelsPerSecondRef.current;

            let newStart = initialStartOffset + deltaTime;
            newStart = Math.max(0, newStart);

            onUpdate(asset.id, { startOffset: newStart });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragStartX, initialStartOffset, asset.id, onUpdate]);

    return (
        <div
            onMouseDown={handleMouseDown}
            onDoubleClick={(e) => { e.stopPropagation(); onEdit(asset.id); }}
            style={{
                position: 'absolute',
                left: `${left}px`,
                width: `${Math.max(width, 10)}px`, // Min width for visibility
                height: '40px',
                backgroundColor: isSelected ? '#3b82f6' : '#1f2937',
                border: isSelected ? '1px solid #60a5fa' : '1px solid #374151',
                borderRadius: '4px',
                cursor: 'move',
                opacity: isDragging ? 0.8 : 1,
                color: 'white',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 8px',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                userSelect: 'none',
                zIndex: isSelected ? 10 : 1
            }}
            title={`${asset.name} (Start: ${startOffset.toFixed(2)}s)`}
        >
            {asset.name}
        </div>
    );
};

export default TimelineBlock;
