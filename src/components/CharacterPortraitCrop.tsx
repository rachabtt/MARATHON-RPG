import React from 'react';

interface CropProps {
  src?: string;
  alt?: string;
  /** size can be a pixel number or one of 'small' | 'medium' */
  size?: number | 'small' | 'medium';
  cropSettings?: { x?: number; y?: number; width?: number; height?: number };
}

export default function CharacterPortraitCrop({ src, alt = '', size = 'small', cropSettings }: CropProps) {
  // Default percent crop if none provided (matches design guidance)
  const crop = {
    x: cropSettings?.x ?? 3.5,
    y: cropSettings?.y ?? 8,
    width: cropSettings?.width ?? 45,
    height: cropSettings?.height ?? 47
  };

  // If the caller provided a full-image portrait (pre-cropped), we want
  // to center it and fit it inside the container (dézoomer si trop grand).
  // Detect either explicit full-image cropSettings OR filename/path hints
  // that the asset is pre-cropped (folder "cropped" or "_cropped" suffix).
  const isCroppedFile = !!src && (src.includes('/cropped/') || src.includes('_cropped'));
  const isFullPortrait = isCroppedFile || (!!cropSettings && cropSettings.x === 0 && cropSettings.y === 0 && cropSettings.width === 100 && cropSettings.height === 100);

  // Size mapping
  const pxSize = typeof size === 'number' ? size : size === 'small' ? 64 : 80;

  // Compute style for image. If it's a pre-cropped full portrait, use
  // `object-fit: contain` so the image is centered and scaled down if needed.
  let imgStyle: React.CSSProperties;
  if (isFullPortrait) {
    imgStyle = {
      position: 'relative',
      left: 0,
      top: 0,
      width: 'auto',
      height: '100%',
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'contain',
      objectPosition: 'center'
    };
  } else {
    // Compute scale factors per recommendation
    const scaleX = 100 / crop.width; // how many percent the image width must be to make crop width fill 100%
    const scaleY = 100 / crop.height;
    const scale = Math.max(scaleX, scaleY);

    // The image will be resized by percent; we set its width to scale*100% then shift left/top by crop.x*scale percent
    imgStyle = {
      position: 'absolute',
      left: `${-crop.x * scale}%`,
      top: `${-crop.y * scale}%`,
      width: `${scale * 100}%`,
      height: 'auto',
      objectFit: 'cover',
      transformOrigin: 'top left',
      maxWidth: 'none'
    };
  }

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    width: `${pxSize}px`,
    height: `${pxSize}px`,
    borderRadius: 8,
    background: '#0f172a',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <div style={containerStyle} aria-hidden={!src}>
      {src ? (
        // large, absolutely positioned image; percent math aligns the requested crop rect into the container
        <img src={src} alt={alt} style={imgStyle} />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>{'?'}</div>
      )}
    </div>
  );
}
