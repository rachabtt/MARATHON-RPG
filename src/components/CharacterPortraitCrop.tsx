import React from 'react';

interface CropProps {
  src?: string;
  alt?: string;
  size?: number; // px square size
  cropSettings?: { x?: number; y?: number; scale?: number };
}

export default function CharacterPortraitCrop({ src, alt = '', size = 64, cropSettings }: CropProps) {
  // Crop settings: x,y are pixel offsets (relative to the top-left of the source image), scale is zoom factor
  const x = cropSettings?.x ?? 0;
  const y = cropSettings?.y ?? 0;
  const scale = cropSettings?.scale ?? 3.3;

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: 8,
    background: '#0f172a',
    flexShrink: 0
  };

  const imgStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: `${Math.round(size * scale)}px`,
    height: 'auto',
    transform: `translate(${-x}px, ${-y}px) scale(${scale})`,
    transformOrigin: 'top left',
    objectFit: 'cover',
    maxWidth: 'none'
  };

  return (
    <div style={containerStyle} aria-hidden={!src}>
      {src ? (
        <img src={src} alt={alt} style={imgStyle} />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>{'?'}</div>
      )}
    </div>
  );
}
