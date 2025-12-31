
import React, { useState, useRef, useEffect } from 'react';

interface ZoomableImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export const ZoomableImage: React.FC<ZoomableImageProps> = ({ src, alt, className }) => {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Dragging state
  const isDragging = useRef(false);
  const startDrag = useRef({ x: 0, y: 0 });

  // Touch Zoom state
  const initialPinchDist = useRef<number | null>(null);
  const initialScale = useRef(1);

  // Reset when image changes
  useEffect(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, [src]);

  const handleWheel = (e: React.WheelEvent) => {
    // Prevent page scroll when zooming
    // Note: React's synthetic event wrapper might require e.nativeEvent.preventDefault() in some setups,
    // but e.preventDefault() usually works if the event isn't passive.
    
    // Zoom if ctrl is pressed (trackpad pinch) or just scroll wheel
    if (e.ctrlKey || Math.abs(e.deltaY) > 0) {
        // We only prevent default if we are effectively zooming or modifying the view
        // to avoid blocking normal page scroll if users intend to scroll past it.
        // However, for a "studio" app, capturing scroll on the canvas is standard.
        // e.preventDefault(); // React synthetic events might warn about this if passive.
    }
    
    const zoomIntensity = 0.001;
    const delta = -e.deltaY * zoomIntensity;
    const newScale = Math.min(Math.max(1, scale + delta), 5);
    
    setScale(newScale);
    if (newScale === 1) {
        setTranslate({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      isDragging.current = true;
      startDrag.current = { x: e.clientX - translate.x, y: e.clientY - translate.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current && scale > 1) {
      e.preventDefault();
      const newX = e.clientX - startDrag.current.x;
      const newY = e.clientY - startDrag.current.y;
      setTranslate({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
          const dist = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
          );
          initialPinchDist.current = dist;
          initialScale.current = scale;
      } else if (e.touches.length === 1 && scale > 1) {
          isDragging.current = true;
          startDrag.current = { 
              x: e.touches[0].clientX - translate.x, 
              y: e.touches[0].clientY - translate.y 
          };
      }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      if (e.touches.length === 2 && initialPinchDist.current) {
          const dist = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
          );
          const ratio = dist / initialPinchDist.current;
          const newScale = Math.min(Math.max(1, initialScale.current * ratio), 5);
          setScale(newScale);
          if (newScale === 1) setTranslate({ x: 0, y: 0 });
      } else if (e.touches.length === 1 && isDragging.current && scale > 1) {
          const newX = e.touches[0].clientX - startDrag.current.x;
          const newY = e.touches[0].clientY - startDrag.current.y;
          setTranslate({ x: newX, y: newY });
      }
  };

  const handleTouchEnd = () => {
      isDragging.current = false;
      initialPinchDist.current = null;
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden touch-none select-none ${className}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ cursor: scale > 1 ? 'grab' : 'zoom-in' }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-auto transition-transform duration-75 ease-out select-none"
        draggable={false}
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transformOrigin: 'center center'
        }}
      />
      {scale > 1 && (
        <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] text-white pointer-events-none backdrop-blur-sm z-10">
            {(scale * 100).toFixed(0)}%
        </div>
      )}
    </div>
  );
};
