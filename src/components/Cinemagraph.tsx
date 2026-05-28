/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { CinemagraphConfig } from '../types';
import { LOCATIONS } from '../utils/locations';
import tauCetiBase from '../assets/images/tau_ceti_base_1779960769896.png';
import delta6Dust from '../assets/images/delta6_dust_1779965726252.png';

interface CinemagraphProps {
  key?: any;
  config: CinemagraphConfig;
  imageUrl: string;
  onFlickerSound?: () => void;
  onScannerSound?: () => void;
}

interface Particle {
  startX: number;        // Start coordinate in viewBox (0 - 1000)
  startY: number;        // Start coordinate in viewBox (0 - 562.5)
  size: number;          // Visual radius
  driftAngle: number;    // Base movement angle in radians
  speedFactor: number;   // Speed scale for this individual particle
  duration: number;      // Lifespan in seconds (e.g. 6 to 10 seconds)
  phaseOffset: number;   // Stagger factor so they don't fade all at once
  depth: number;         // For parallax/blur sizing
}

export default function Cinemagraph({ config, imageUrl, onFlickerSound, onScannerSound }: CinemagraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 562.5 });
  
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const activeLocId = config.activeLocation || 'delta6';
  const activeLoc = LOCATIONS.find(l => l.id === activeLocId) || LOCATIONS[3];
  const activeLocPath = activeLoc.image;

  const getSceneBgSrc = (locId: string, originalPath: string) => {
    if (failedImages[locId]) {
      if (locId === 'delta6' || config.environmentFilter === 'dust' || config.environmentFilter === 'storm' || config.environmentFilter === 'extraction') {
        return delta6Dust;
      }
      return imageUrl || tauCetiBase;
    }
    return originalPath;
  };
  
  // High-fidelity particle array
  const particlesRef = useRef<Particle[]>([]);
  
  // Track continuous loop epoch (20-second repeat period)
  const EPOCH_DURATION = 20000; // 20 seconds loop period
  const startTimeRef = useRef<number>(document.timeline ? document.timeline.currentTime as number || Date.now() : Date.now());
  
  // Track scanner pulse sounds intervals to avoid triggering on every frame
  const lastScannerPulseHandled = useRef<number>(-1);

  // 1. Initialize static, repeatable particle attributes
  useEffect(() => {
    const arr: Particle[] = [];
    const count = 300; // Generous particle count for thick atmospheric immersion
    for (let i = 0; i < count; i++) {
      // Stagger particles evenly across the screen coordinates
      arr.push({
        startX: Math.random() * 1200 - 100, // Extend off-screen to handle horizontal flow
        startY: Math.random() * 600,
        size: 0.8 + Math.random() * 2.2,
        driftAngle: 0.05 + Math.random() * 0.12, // Slight downward drift
        speedFactor: 0.5 + Math.random() * 1.5,
        duration: 5.0 + Math.random() * 6.0, // Staggered lifespans
        phaseOffset: Math.random() * 20.0,   // Randomize entry phase
        depth: 0.2 + Math.random() * 0.8,    // Foreground vs background sizes
      });
    }
    particlesRef.current = arr;
  }, []);

  // 2. High-performance ResizeObserver for responsive canvas scaling
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      
      // Bound checking and responsive aspect-ratio containment (16:9)
      const targetHeight = width * (562.5 / 1000);
      setDimensions({ width, height: targetHeight });
      
      // Feed canvas buffer coordinates
      if (canvasRef.current) {
        canvasRef.current.width = width;
        canvasRef.current.height = targetHeight;
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // 3. Core animation loop
  useEffect(() => {
    let lastTime = 0;
    
    const loop = (timestamp: number) => {
      const elapsed = timestamp - startTimeRef.current;
      const loopTimeMs = elapsed % EPOCH_DURATION; // Cycles strictly from 0 to 20000
      const loopTimeSec = loopTimeMs / 1000.0;
      
      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameRef.current = requestAnimationFrame(loop);
        return;
      }
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationFrameRef.current = requestAnimationFrame(loop);
        return;
      }
      
      // Clear with soft transparency to allow trailing/wind motion blur
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 3.1 Calculate scaling factors for coordinates (viewBox 1000x562.5 -> actual canvas width/height)
      const scaleX = canvas.width / 1000.0;
      const scaleY = canvas.height / 562.5;
      
      // 3.2 Draw drifting red-orange dust particles
      const particles = particlesRef.current;
      
      // Compute narrative mode parameters for particles
      let modeSpeedMultiplier = 1.0;
      let modeDensityMultiplier = 1.0;
      let particleColorTemplate = 'rgba(164, 69, 50, ALPHA_VAL)'; // default warm rust
      
      if (config.environmentFilter === 'dust') {
        modeSpeedMultiplier = 1.4;
        modeDensityMultiplier = 2.2;
        particleColorTemplate = 'rgba(185, 48, 28, ALPHA_VAL)';
      } else if (config.environmentFilter === 'storm') {
        modeSpeedMultiplier = 2.8;
        modeDensityMultiplier = 2.6;
        particleColorTemplate = 'rgba(145, 38, 22, ALPHA_VAL)';
      } else if (config.environmentFilter === 'extraction') {
        modeSpeedMultiplier = 2.0;
        modeDensityMultiplier = 3.0;
        particleColorTemplate = 'rgba(205, 55, 35, ALPHA_VAL)';
      } else if (config.environmentFilter === 'silence') {
        modeSpeedMultiplier = 0.4;
        modeDensityMultiplier = 0.3;
        particleColorTemplate = 'rgba(110, 110, 115, ALPHA_VAL)'; // quiet gray
      } else if (config.environmentFilter === 'scanner') {
        modeSpeedMultiplier = 0.95;
        modeDensityMultiplier = 0.9;
        particleColorTemplate = 'rgba(152, 60, 44, ALPHA_VAL)';
      } else if (config.environmentFilter === 'hounds') {
        modeSpeedMultiplier = 0.8;
        modeDensityMultiplier = 1.15;
        particleColorTemplate = 'rgba(130, 48, 35, ALPHA_VAL)';
      }

      particles.forEach((p) => {
        // Evaluate age of particle within its lifespan cycle:
        // By using continuous math with modulo, we guarantee the exact same coordinate positions at the loop boundaries!
        const particleTime = (loopTimeSec + p.phaseOffset) % p.duration;
        const speed = config.windSpeed * p.speedFactor * 65.0 * modeSpeedMultiplier; // wind drift rate in pixels-equivalent
        
        // Progress downwind
        let currentX = p.startX + particleTime * speed;
        let currentY = p.startY + particleTime * speed * Math.sin(p.driftAngle);
        
        // Wrap coordinates seamlessly
        if (currentX > 1100) {
          currentX = (currentX - 1200);
        }
        if (currentY > 600) {
          currentY = currentY - 600;
        }
        
        // Compute alpha fade-in / fade-out to prevent popping
        let alpha = 0;
        const progress = particleTime / p.duration;
        if (progress < 0.25) {
          alpha = progress / 0.25; // fade in
        } else if (progress > 0.75) {
          alpha = (1.0 - progress) / 0.25; // fade out
        } else {
          alpha = 1.0;
        }
        
        // Adjust alpha by depth and configuration density multiplier
        const alphaScale = p.depth * 0.45;
        const densityMultiplier = Math.min(config.dustDensity / 120.0, 2.5) * modeDensityMultiplier;
        const finalAlpha = alpha * alphaScale * densityMultiplier;
        ctx.fillStyle = particleColorTemplate.replace('ALPHA_VAL', finalAlpha.toFixed(3));
        
        // Distant vs Foreground bokeh blur
        const drawRadius = p.size * p.depth * scaleX;
        ctx.beginPath();
        if (p.depth > 0.75) {
          // Foreground particles blurred, floating faster
          ctx.arc(currentX * scaleX, currentY * scaleY, drawRadius * 1.5, 0, Math.PI * 2);
          ctx.shadowColor = 'rgba(156, 63, 45, 0.4)';
          ctx.shadowBlur = 4;
        } else {
          ctx.arc(currentX * scaleX, currentY * scaleY, drawRadius, 0, Math.PI * 2);
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.closePath();
      });
      ctx.shadowBlur = 0; // Reset canvas shadows
      
      // 3.3 Trigger periodic sound effects on loop boundaries
      // Scanner sound triggers when the scanning dome brightness is maximum (peaks of oscillator)
      // Every 6 seconds scanner dome has a full sweep
      const scannerPeriod = 6.0 / config.scannerPulseSpeed;
      const currentScannerCycle = Math.floor(loopTimeSec / scannerPeriod);
      if (currentScannerCycle !== lastScannerPulseHandled.current && config.audioEnabled) {
        lastScannerPulseHandled.current = currentScannerCycle;
        if (onScannerSound) {
          onScannerSound();
        }
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [config, onScannerSound]);

  // Compute periodic values for SVG elements (flickers, sways, breathing) directly
  // By driving everything with a single ticking timer, we maintain full synchronization and loop fidelity.
  const [ticker, setTicker] = useState(0);
  useEffect(() => {
    let frame: number;
    const tick = () => {
      setTicker(Date.now() - startTimeRef.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const timeSec = (ticker % EPOCH_DURATION) / 1000.0;

  // 1. Cables Sway parameters (quadratic Bezier control shifts)
  // Harmonic oscillation combined with tiny eolian vibration
  const cableSway = Math.sin(timeSec * Math.PI * 0.4 * config.windSpeed) * 3.5 * config.windSpeed;
  const cableJitter = Math.cos(timeSec * Math.PI * 1.2 * config.windSpeed) * 0.4 * config.windSpeed;
  const swayOffset = cableSway + cableJitter;

  // 2. Headlight Flicker math
  // Multi-sine waveform for realistic flickering that loops perfectly
  const headlightOsc = Math.sin(timeSec * Math.PI * config.flickerRate * 0.72) + 
                       0.45 * Math.sin(timeSec * Math.PI * config.flickerRate * 1.83) +
                       0.25 * Math.sin(timeSec * Math.PI * config.flickerRate * 4.95);
  // Highlight spike thresholds
  const shouldFlickerDeep = headlightOsc < -1.1; 
  const headlightAlpha = Math.max(0.08, Math.min(1.0, 
    config.headlightIntensity * (shouldFlickerDeep ? 0.22 : 0.88 + 0.12 * Math.sin(timeSec * 25.0))
  ));

  // Trigger headlight click sound on flicker transitions
  const prevShouldFlickerRef = useRef(false);
  useEffect(() => {
    if (shouldFlickerDeep && !prevShouldFlickerRef.current && config.audioEnabled && onFlickerSound) {
      onFlickerSound();
    }
    prevShouldFlickerRef.current = shouldFlickerDeep;
  }, [shouldFlickerDeep, onFlickerSound, config.audioEnabled]);

  // 3. Scanner Pulsing math
  const scannerTime = timeSec * config.scannerPulseSpeed;
  const domePulse = Math.pow(0.5 + 0.5 * Math.sin(scannerTime * Math.PI * 0.65), 3); // Sharp glow curves
  const greenLedPulse = 0.5 + 0.5 * Math.cos(scannerTime * Math.PI * 1.15);
  const amberLedPulse = 0.5 + 0.5 * Math.sin(timeSec * Math.PI * 0.88 + 1.5);

  // 4. Atmosphere breathing
  const breathingCycle = Math.sin(timeSec * Math.PI * 0.2 * config.hazeBreathingSpeed);
  const atmosphereHazeAlpha = (config.environmentFilter === 'dust') 
    ? 0.35 + 0.15 * breathingCycle 
    : (config.environmentFilter === 'extraction')
    ? 0.45 + 0.12 * breathingCycle
    : (config.environmentFilter === 'silence')
    ? 0.05 + 0.03 * breathingCycle
    : 0.12 + 0.08 * breathingCycle;

  // Real-time radio signal glitch math based on RPG state modes
  const isNormalMode = config.environmentFilter === 'normal';
  const isPoussiereMode = config.environmentFilter === 'dust';
  const isScannerMode = config.environmentFilter === 'scanner';
  const isSignalMode = config.environmentFilter === 'signal';
  const isHoundsMode = config.environmentFilter === 'hounds';
  const isTempete = config.environmentFilter === 'storm';
  const isExtraction = config.environmentFilter === 'extraction';
  const isSilenceMode = config.environmentFilter === 'silence';

  // Lightning path generator helper
  const getLightningPath = (x1: number, y1: number, x2: number, y2: number) => {
    const segments = 5;
    let path = `M ${x1} ${y1}`;
    for (let i = 1; i < segments; i++) {
      const ratio = i / segments;
      const baseX = x1 + (x2 - x1) * ratio;
      const baseY = y1 + (y2 - y1) * ratio;
      const jitterX = (Math.random() - 0.5) * 20;
      const jitterY = (Math.random() - 0.5) * 20;
      path += ` L ${baseX + jitterX} ${baseY + jitterY}`;
    }
    path += ` L ${x2} ${y2}`;
    return path;
  };

  let hasGlitch = config.visualRadioGlitch > 0;
  let glitchFactor = config.visualRadioGlitch;
  if (isSignalMode) {
    hasGlitch = true;
    glitchFactor = Math.max(glitchFactor, 0.75);
  } else if (isTempete) {
    hasGlitch = true;
    glitchFactor = Math.max(glitchFactor, 0.85);
  } else if (isExtraction) {
    hasGlitch = true;
    glitchFactor = Math.max(glitchFactor, 0.50);
  } else if (isSilenceMode) {
    hasGlitch = false;
    glitchFactor = 0.0;
  }

  // Scanner pulse triggers a tiny micro-glitch synchronised to the pulse
  const isScannerPeak = isScannerMode && (domePulse > 0.88);

  const isGlitchFrame = (hasGlitch && (
    ((ticker % 1400 < 80) && (Math.random() < glitchFactor)) ||
    ((ticker % 2800 < 130) && (Math.random() < glitchFactor * 0.8)) ||
    (Math.random() < glitchFactor * 0.03) // brief random spikes
  )) || isScannerPeak;

  const glitchX = isGlitchFrame ? (Math.random() - 0.5) * (isScannerPeak ? 5 : glitchFactor * 32) : 0;
  const glitchY = isGlitchFrame ? (Math.random() - 0.5) * (isScannerPeak ? 3 : glitchFactor * 10) : 0;
  const glitchScale = isGlitchFrame ? 1.0 + (Math.random() * (isScannerPeak ? 0.005 : 0.025 * glitchFactor)) : 1.0;

  // Periodic EM flashes timing - heavily boosted during EM Storms
  let flashActive = config.visualEmFlashes && (
    ((ticker % 4200 < 160) && (ticker % 4200 > 40)) || 
    ((ticker % 6500 < 220) && (ticker % 6500 > 100)) ||
    ((ticker % 11000 < 120) && (ticker % 11000 > 0))
  );

  if (isTempete) {
    // Add rapid ambient sky lightening discharges
    flashActive = flashActive || (Math.random() < 0.05 && ticker % 1600 < 180) || (Math.random() < 0.01);
  } else if (isExtraction) {
    flashActive = flashActive || (Math.random() < 0.02 && ticker % 2400 < 120);
  } else if (isSilenceMode) {
    flashActive = false;
  }

  // Adaptive spotlight overlay factors based on environment
  let modeLightsFactor = 1.0;
  if (isHoundsMode) {
    // Weaker, tense flickers as Hounds distort field or draw power
    modeLightsFactor = 0.55 + 0.25 * Math.sin(timeSec * 45.0);
  } else if (isTempete) {
    // Highly unstable in electrostatic gale
    modeLightsFactor = Math.random() < 0.08 ? 0.05 : 0.70 + 0.3 * Math.sin(timeSec * 35.0);
  } else if (isExtraction) {
    // Projectors pushed to maximum load of Rover power arrays, but highly erratic
    modeLightsFactor = 1.5 * (Math.random() < 0.05 ? 0.2 : 0.85 + 0.15 * Math.sin(timeSec * 15.0));
  } else if (isSilenceMode) {
    // Muted/offline
    modeLightsFactor = 0.0;
  }

  const headlightAlphaActual = Math.max(0.0, Math.min(1.5, headlightAlpha * modeLightsFactor));

  // Color mapping CSS filter for color grading our 8 detailed narrative scene modes and locations
  const getFilterStyle = () => {
    let baseFilter = '';
    
    // 1. Layer Location Filters for beautiful mood distinctions
    const activeLocId = config.activeLocation || 'delta6';
    if (activeLocId === 'new_carthage') {
      baseFilter = 'brightness(1.05) contrast(1.02) saturate(0.85) hue-rotate(-15deg)';
    } else if (activeLocId === 'red_plains') {
      baseFilter = 'saturate(1.8) contrast(1.1) hue-rotate(-5deg) brightness(0.92)';
    } else if (activeLocId === 'black_arches') {
      baseFilter = 'brightness(0.68) contrast(1.35) saturate(0.75) hue-rotate(5deg)';
    } else { // delta6
      baseFilter = 'contrast(1.02) saturate(1.05)';
    }

    // 2. Layer Ambient Ambiance Filters
    switch (config.environmentFilter) {
      case 'dust':
        baseFilter += ' sepia(0.2) saturate(1.4) hue-rotate(-10deg) contrast(0.9) brightness(0.9)';
        break;
      case 'scanner':
        baseFilter += ' saturate(1.25) contrast(1.15) hue-rotate(8deg) brightness(0.95)';
        break;
      case 'signal':
        baseFilter += ' saturate(1.4) contrast(1.35) hue-rotate(20deg) brightness(1.05)';
        break;
      case 'hounds':
        baseFilter += ' brightness(0.75) contrast(1.3) saturate(0.85) sepia(0.1)';
        break;
      case 'storm':
        baseFilter += ' brightness(0.7) saturate(1.4) hue-rotate(180deg) contrast(1.2)';
        break;
      case 'extraction':
        baseFilter += ' contrast(1.4) saturate(1.8) brightness(0.7) sepia(0.3) hue-rotate(-20deg)';
        break;
      case 'silence':
        baseFilter += ' saturate(0.4) brightness(0.7) contrast(1.1) hue-rotate(160deg)';
        break;
      default:
        break;
    }

    if (isGlitchFrame && !isSilenceMode) {
      baseFilter += ` hue-rotate(${Math.random() * 80 * glitchFactor}deg) contrast(${1.15 + Math.random() * 0.35})`;
    }
    return baseFilter;
  };

  // Poly clip coordinates or bounding areas for localized tarp wind warping.
  const windTarpWarpScale = (isTempete ? 40 : isExtraction ? 30 : isSilenceMode ? 5 : 15) + 
                            (isTempete ? 18 : 8) * Math.sin(timeSec * Math.PI * 0.55 * config.windSpeed);

  // Transition style should be instantaneous (abrupt) for signal glitch or dead silence
  const useAbruptTransitions = isSignalMode || isSilenceMode;
  const transitionRules = useAbruptTransitions 
    ? 'none' 
    : 'filter 0.8s ease-in-out, transform 0.15s ease-out';

  return (
    <div 
      id="cinemagraph-viewport"
      ref={containerRef}
      className="relative w-full overflow-hidden bg-stone-950 rounded-xl border border-stone-800 shadow-2xl select-none aspect-video"
      style={{ 
        filter: getFilterStyle(), 
        transform: `translate(${glitchX}px, ${glitchY}px) scale(${glitchScale})`,
        transition: transitionRules,
        transitionProperty: isGlitchFrame ? 'none' : 'filter 0.8s ease-in-out, transform 0.15s ease-out'
      }}
    >
      {/* Black Screen Dramatic Overwrite */}
      {config.screenBlack && (
        <div className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center font-mono text-[10px] tracking-widest text-stone-700 uppercase animate-pulse select-none pointer-events-none">
          <span>// SIGNAL TRANSMISSION COUPE</span>
          <span className="text-[9px] mt-1 text-stone-850">LIAISON EN ATTENTE MJ</span>
        </div>
      )}

      {/* 1. Base Landscape Image for active location with fallback */}
      <div className="absolute inset-0 select-none pointer-events-none w-full h-full z-0">
        {LOCATIONS.map((loc) => {
          const isActive = (config.activeLocation || 'delta6') === loc.id;
          const bgSrc = getSceneBgSrc(loc.id, loc.image);
          return (
            <img
              key={loc.id}
              src={bgSrc}
              alt={`Tau Ceti IV - ${loc.label}`}
              referrerPolicy="no-referrer"
              onError={() => {
                setFailedImages(prev => ({ ...prev, [loc.id]: true }));
              }}
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-opacity duration-1000 ease-in-out"
              style={{
                opacity: isActive ? 1 : 0,
                zIndex: isActive ? 1 : 0
              }}
            />
          );
        })}
      </div>

      {/* Real-time EM lightning flashes overlay */}
      {flashActive && (
        <div className="absolute inset-0 bg-sky-100/45 mix-blend-color-dodge pointer-events-none z-10 animate-pulse" />
      )}

      {/* Poussiere rouge background blend overlays */}
      {isPoussiereMode && (
        <>
          <div className="absolute inset-0 bg-[#9c2f1e]/15 mix-blend-multiply pointer-events-none z-10" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#8c3523]/45 via-[#8c3523]/22 to-transparent pointer-events-none z-10" />
        </>
      )}

      {/* Extraction near-zero visibility dust gale background blend */}
      {isExtraction && (
        <>
          <div className="absolute inset-0 bg-[#4f1a08]/40 backdrop-blur-[0.5px] mix-blend-color-burn pointer-events-none z-10" />
          <div className="absolute inset-0 border-[6px] border-red-700/80 animate-pulse pointer-events-none z-20 shadow-[inset_0_0_60px_rgba(185,28,28,0.55)]" />
          <div className="absolute bottom-[8%] left-[4%] bg-red-950/95 border border-red-500 text-red-500 font-mono text-[9px] px-3 py-2 rounded tracking-widest uppercase animate-pulse shadow-xl shadow-red-950/50 z-30">
            [UESC ALERTE CRITIQUE] // ÉVACUATION IMMINENTE COMPTE À REBOURS EXIGÉ
          </div>
        </>
      )}

      {/* Signal instable multi-channel RGB shifts */}
      {isSignalMode && (
        <>
          {/* Cyan channel shift layer */}
          <img
            src={getSceneBgSrc(activeLocId, activeLocPath)}
            onError={() => {
              setFailedImages(prev => ({ ...prev, [activeLocId]: true }));
            }}
            alt="Cyan offset channel"
            referrerPolicy="no-referrer"
            className="absolute top-0 left-0 w-full h-full object-cover select-none pointer-events-none mix-blend-screen opacity-40 z-10"
            style={{
              transform: `translate(${isGlitchFrame ? (Math.random() - 0.5) * 16 : 4}px, ${isGlitchFrame ? (Math.random() - 0.5) * 8 : -2}px)`,
              filter: 'hue-rotate(115deg) saturate(1.8) contrast(1.2)'
            }}
          />
          {/* Red channel shift layer */}
          <img
            src={getSceneBgSrc(activeLocId, activeLocPath)}
            onError={() => {
              setFailedImages(prev => ({ ...prev, [activeLocId]: true }));
            }}
            alt="Red offset channel"
            referrerPolicy="no-referrer"
            className="absolute top-0 left-0 w-full h-full object-cover select-none pointer-events-none mix-blend-screen opacity-40 z-10"
            style={{
              transform: `translate(${isGlitchFrame ? (Math.random() - 0.5) * -16 : -4}px, ${isGlitchFrame ? (Math.random() - 0.5) * -8 : 2}px)`,
              filter: 'hue-rotate(-45deg) saturate(2.0) contrast(1.2)'
            }}
          />
          {/* Jittery jumping scan parasite lines */}
          <div className="absolute inset-0 pointer-events-none z-20">
            <div className="absolute w-full h-[1px] bg-red-400/30 blur-[0.5px]" style={{ top: `${(timeSec * 35) % 100}%` }} />
            <div className="absolute w-full h-[2px] bg-sky-400/25 blur-[0.5px]" style={{ top: `${((timeSec + 0.3) * 65) % 100}%` }} />
            <div className="absolute w-full h-[4px] bg-yellow-500/10" style={{ top: `${((timeSec + 0.75) * 18) % 100}%` }} />
          </div>
        </>
      )}

      {/* Real-time organic creature (Hound of Arches) edge shadows & scary brief silhouettes */}
      {config.visualHoundShadows && (
        <>
          {/* Shadow 1 - near rover bottom-left corner */}
          <div 
            className="absolute left-[8%] bottom-[4%] w-[24%] h-[18%] bg-black/75 blur-[24px] rounded-full scale-y-50 pointer-events-none mix-blend-multiply" 
            style={{
              transform: `scale(${1.0 + 0.12 * Math.sin(timeSec * 2.2)}) translate(${(Math.sin(timeSec * 1.8)) * 8}px, ${(Math.cos(timeSec * 1.2)) * 6}px)`,
              transition: 'transform 0.5s ease-out-harmonic'
            }}
          />
          {/* Shadow 2 - behind the black arches base on the right */}
          <div 
            className="absolute right-[32%] bottom-[22%] w-[16%] h-[28%] bg-stone-950/85 blur-[35px] rounded-full scale-x-75 pointer-events-none mix-blend-multiply" 
            style={{
              transform: `scale(${1.1 + 0.18 * Math.cos(timeSec * 1.4)}) translate(${(Math.cos(timeSec * 2.1)) * 14}px, ${(Math.sin(timeSec * 1.1)) * 10}px)`,
              transition: 'transform 0.8s ease-in-out'
            }}
          />
        </>
      )}

      {/* Hounds proches - extra low slithering quadruped shadows and fuzzy silhouettes fleeing under arches */}
      {isHoundsMode && (
        <>
          {/* Flat running quadruped shadow slide-by */}
          <div 
            className="absolute bg-stone-950/75 blur-[16px] rounded-full pointer-events-none mix-blend-multiply"
            style={{
              bottom: '10%',
              left: `${-15 + ((timeSec * 0.8) % 5.0) * 35}%`, // rushes past the desert dust
              width: '160px',
              height: '50px',
              opacity: Math.sin(((timeSec * 0.8) % 5.0) * Math.PI / 5.0) * 0.85,
              transform: 'scaleY(0.4) rotate(-4deg)',
              transition: 'left 0.1s linear'
            }}
          />
          {/* Another shadow rustling behind the crates */}
          <div 
            className="absolute bg-black/80 blur-[20px] rounded-full pointer-events-none mix-blend-multiply"
            style={{
              bottom: '18%',
              left: '49%',
              width: '100px',
              height: '40px',
              transform: `scale(${1.0 + 0.25 * Math.sin(timeSec * 4.8)}) translate(${(Math.sin(timeSec * 4.2)) * 14}px, ${(Math.cos(timeSec * 3.1)) * 5}px)`,
              opacity: 0.75
            }}
          />
          {/* Fleeting spooky silhouette behindcrates occasionally */}
          {((ticker % 6000 < 1500) && (ticker % 6000 > 300)) && (
            <div 
              className="absolute left-[54%] bottom-[23%] w-12 h-8 bg-stone-950/65 blur-[3px] pointer-events-none z-10 animate-pulse"
              style={{
                clipPath: 'polygon(15% 85%, 32% 45%, 52% 12%, 68% 34%, 88% 72%, 100% 90%)',
                transform: `scaleX(${ticker % 12000 < 6000 ? 1 : -1}) translate(${Math.sin(timeSec * 14) * 5}px, 0px)`
              }}
            />
          )}
        </>
      )}

      {/* Real-time Aletheia warning system telemetry hud */}
      {config.visualAletheiaOverlay && (
        <div className="absolute top-[10%] left-[4%] bg-black/95 border border-red-500/80 text-red-500 font-mono text-[9px] p-2.5 rounded tracking-widest animate-pulse max-w-[240px] z-20 shadow-lg shadow-red-950/40">
          <div className="font-bold flex items-center gap-1.5 text-red-400 text-[10px]">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
            [ALETHEIA WARNING]
          </div>
          <div className="mt-1 text-stone-300 leading-relaxed">
            - INTERFÉRENCE SPECTRE S-4 RELEVÉE<br />
            - MOUVEMENT BIOLOGIQUE LOCALISÉ<br />
            - FORCE EM : {150 + Math.floor(Math.sin(timeSec) * 40)} µT (CRITIQUE)
          </div>
        </div>
      )}

      {/* Double-layered scanlines for CTR and Scanner filters */}
      {(isScannerMode || isSignalMode || isTempete) && (
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.18)_50%)] bg-[size:100%_4px] pointer-events-none z-20 opacity-80" />
      )}

      {/* Retro Horizontal scanline jitter overlay for intense glitch fields */}
      {isGlitchFrame && !isSilenceMode && (
        <div className="absolute inset-0 bg-stone-950/15 pointer-events-none z-15">
          <div className="absolute top-1/2 left-0 w-full h-[3px] bg-white/20 blur-[1px]" style={{ top: `${Math.random() * 100}%` }} />
          <div className="absolute top-1/4 left-0 w-full h-[5px] bg-white/10 blur-[2px]" style={{ top: `${Math.random() * 100}%` }} />
        </div>
      )}

      {/* 2. Seamless Wind-Tarp Distortion Filter via SVG */}
      <div 
        id="tarp-wind-overlay"
        className="absolute top-0 left-0 w-full h-full pointer-events-none origin-right"
        style={{
          clipPath: 'polygon(65% 35%, 100% 35%, 100% 90%, 65% 90%)',
          filter: `url(#fabric-wind-filter)`
        }}
      >
        {LOCATIONS.map((loc) => {
          const isActive = (config.activeLocation || 'delta6') === loc.id;
          const bgSrc = getSceneBgSrc(loc.id, loc.image);
          return (
            <img
              key={`tarp-${loc.id}`}
              src={bgSrc}
              alt={`Tarp Mask - ${loc.label}`}
              referrerPolicy="no-referrer"
              onError={() => {
                setFailedImages(prev => ({ ...prev, [loc.id]: true }));
              }}
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-opacity duration-1000 ease-in-out"
              style={{
                opacity: isActive ? 1 : 0
              }}
            />
          );
        })}
      </div>

      {/* SVG filter definitions containing the wind displacement */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="fabric-wind-filter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={`${0.012 + 0.003 * Math.sin(timeSec * Math.PI * 0.4)} ${0.035 + 0.005 * Math.cos(timeSec * Math.PI * 0.4)}`}
              numOctaves="3"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={windTarpWarpScale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* 3. HTML5 SVG Layer for Cables, Vector flares and lights overlay */}
      <svg 
        className="absolute top-0 left-0 w-full h-full pointer-events-none mix-blend-screen"
        viewBox="0 0 1000 562.5"
        preserveAspectRatio="none"
      >
        {/* ==================== A. ROVER HEADLIGHT FLARES ==================== */}
        <defs>
          <radialGradient id="headlight-glow-1" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="rgba(255, 235, 195, 0.95)" />
            <stop offset="15%" stopColor="rgba(255, 230, 180, 0.7)" />
            <stop offset="50%" stopColor="rgba(235, 140, 70, 0.25)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <radialGradient id="headlight-glow-2" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="rgba(255, 235, 195, 0.95)" />
            <stop offset="15%" stopColor="rgba(255, 230, 180, 0.7)" />
            <stop offset="50%" stopColor="rgba(235, 140, 70, 0.25)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          
          {/* Spotlight cones */}
          <linearGradient id="headlight-cone-1" x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="rgba(255, 222, 160, 0.4)" />
            <stop offset="40%" stopColor="rgba(242, 160, 80, 0.15)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </linearGradient>

          {/* Scanner Indicators Gradients */}
          <radialGradient id="scanner-glow-red" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 60, 60, 0.95)" />
            <stop offset="35%" stopColor="rgba(255, 30, 30, 0.60)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>
          <radialGradient id="scanner-glow-green" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(60, 255, 120, 0.95)" />
            <stop offset="40%" stopColor="rgba(30, 220, 80, 0.55)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>
          <radialGradient id="scanner-glow-amber" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 180, 40, 0.95)" />
            <stop offset="35%" stopColor="rgba(235, 145, 20, 0.55)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>
        </defs>

        {/* Rover spotlight cone overlays */}
        {headlightAlphaActual > 0.05 && (
          <g style={{ opacity: headlightAlphaActual, transition: 'opacity 0.03s linear' }}>
            {/* Left headlight projector beam cone */}
            <polygon 
              points="190,325 320,490 10,480"
              fill="url(#headlight-cone-1)" 
              className="mix-blend-screen"
            />
            {/* Right headlight projector beam cone */}
            <polygon 
              points="225,335 380,510 60,540"
              fill="url(#headlight-cone-1)" 
              className="mix-blend-screen"
            />
            
            {/* Expanded fuzzy bulbglows if in dense red dust, otherwise standard */}
            <circle cx="190" cy="326" r={isPoussiereMode ? 35 : 14} fill="url(#headlight-glow-1)" />
            <circle cx="225" cy="336" r={isPoussiereMode ? 35 : 14} fill="url(#headlight-glow-2)" />
          </g>
        )}

        {/* ==================== B. AUTOMATED SCIENCE TOWER BEACONS ==================== */}
        <g>
          {/* Main scanning dome glow - pulses red/cyan/amber */}
          <circle 
            cx="627" 
            cy="271" 
            r={12 + 10 * domePulse} 
            fill="url(#scanner-glow-amber)" 
            style={{ opacity: isSilenceMode ? 0 : 0.3 + 0.7 * domePulse }} 
          />
          <circle 
            cx="627" 
            cy="271" 
            r="4" 
            fill={isSilenceMode ? '#444' : '#ffbc3c'} 
          />

          {/* Green indicator LED near power assembly base */}
          <circle
            cx="605"
            cy="392"
            r={6 + 4 * greenLedPulse}
            fill="url(#scanner-glow-green)"
            style={{ opacity: isSilenceMode ? 0 : 0.4 + 0.6 * greenLedPulse }}
          />
          <circle cx="605" cy="392" r="1.8" fill={isSilenceMode ? '#333' : '#a4ffb6'} />

          {/* Amber warning sensor LED blinking */}
          <circle
            cx="580"
            cy="406"
            r={5 + 3 * amberLedPulse}
            fill="url(#scanner-glow-red)"
            style={{ opacity: isSilenceMode ? 0 : 0.2 + 0.8 * amberLedPulse }}
          />
          <circle cx="580" cy="406" r="1.5" fill={isSilenceMode ? '#333' : '#ffa0a0'} />
        </g>

        {/* Geological active scanner green waves and cargo sweeping target */}
        {isScannerMode && (
          <g stroke="rgba(16, 185, 129, 0.55)" fill="none" strokeWidth="1.2">
            {/* Sweeping concentric concentric lines radiating down from scanner tower */}
            <circle cx="627" cy="271" r={`${(timeSec * 115) % 180}`} style={{ opacity: 1.0 - ((timeSec * 115) % 180) / 180 }} />
            <circle cx="627" cy="271" r={`${((timeSec + 0.45) * 115) % 180}`} style={{ opacity: 1.0 - (((timeSec + 0.45) * 115) % 180) / 180 }} />
            {/* Laser sector analyzer spot pointing back at the crates */}
            <polygon 
              points={`627,271 525,${345 + 50 * domePulse} 485,${405 - 50 * domePulse}`} 
              fill="rgba(16, 185, 129, 0.11)" 
              className="mix-blend-screen"
            />
            {/* Circle boundary around boxes */}
            <circle cx="510" cy="380" r="45" stroke="rgba(16, 185, 129, 0.35)" strokeDasharray="3, 3" />
            <text x="510" y="340" fill="rgba(16, 185, 129, 0.85)" fontFamily="monospace" fontSize="8" textAnchor="middle" letterSpacing="1">
              SCAN ACTIVE // ANALYZING LITHOLOGY
            </text>
          </g>
        )}

        {/* High Voltage EM electrostatic discharges over transmitter cables */}
        {isTempete && (ticker % 1100 < 150) && (Math.random() < 0.72) && (
          <g stroke="#67e8f9" strokeWidth="1.5" fill="none" filter="drop-shadow(0 0 4px #06b6d4) drop-shadow(0 0 1px #a5f3fc)">
            {/* Static spark connecting far right antenna 952,80 to 840,280 */}
            <path d={getLightningPath(952, 80, 840, 280)} opacity={0.88} />
            {/* Static spark on rover antenna */}
            <path d={getLightningPath(285, 210, 268, 300)} opacity={0.7} />
            {/* Spark around geological beacon tower */}
            <path d={getLightningPath(627, 271, 580, 406)} opacity={0.65} />
          </g>
        )}

        {/* ==================== C. TRANSMITTER ANTENNA CABLES SWAYING ==================== */}
        <g stroke="rgba(35, 30, 25, 0.8)" strokeWidth="1.6" fill="none">
          <path 
            d={`M 952,80 Q ${896 + swayOffset * 1.5} ${210 + swayOffset * 0.4} 840,280`} 
            stroke="#1b1815"
            strokeWidth="1.4"
          />
          <path
            d={`M 940,220 Q ${890 + swayOffset * 1.1} ${370 + Math.abs(swayOffset) * 0.2} 852,460`}
            stroke="#161311"
            strokeWidth="1.1"
          />
          <path
            d={`M 285,210 Q ${278 + swayOffset * 0.4} ${250 + Math.abs(swayOffset) * 0.1} 268,300`}
            stroke="#1a1816"
            strokeWidth="0.8"
          />
        </g>
      </svg>

      {/* 4. Canvas element for Particle Drift Simulation (Red dust particles, grains of sand) */}
      <canvas 
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none mix-blend-screen"
        style={{ width: dimensions.width, height: dimensions.height }}
      />

      {/* 5. Fullscreen Atmospheric Dark Red Haze Breath Overlay */}
      <div 
        id="dust-haze-fade"
        className="absolute top-0 left-0 w-full h-full pointer-events-none transition-opacity duration-300 pointer-events-none mix-blend-multiply z-15"
        style={{
          background: 'radial-gradient(circle, rgba(148, 51, 34, 0.18) 0%, rgba(110, 31, 18, 0.28) 100%)',
          opacity: atmosphereHazeAlpha
        }}
      />

      {/* 6. Static cinematic widescreen black bars (letterboxing) overlay to improve cinematic NASA feel */}
      <div className="absolute top-0 left-0 w-full h-[6%] bg-black/90 pointer-events-none border-b border-stone-900 flex justify-between items-center px-4 z-30">
        <span className="font-mono text-[9px] text-stone-500 tracking-widest uppercase">
          {isSilenceMode ? 'MISSION DETECT FEED // OFFLINE' : 'TAU CETI IV SENTINEL FEED // D6'}
        </span>
        <span className="font-mono text-[9px] text-stone-500 tracking-widest">
          {isSilenceMode ? 'ERROR // CORRUPTED HEADER' : 'SOL RECOVERY CYCLE: LOP_A2'}
        </span>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-[6%] bg-black/90 pointer-events-none border-t border-stone-900 flex justify-between items-center px-4 z-30">
        <span className="font-mono text-[9px] tracking-widest flex items-center gap-1">
          {isSilenceMode ? (
            <span className="text-red-500 flex items-center gap-1.5 font-bold">
              <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
              LIAISON INTERROMPUE // PERTE DE PROTOCOLE TR
            </span>
          ) : isExtraction ? (
            <span className="text-red-600 flex items-center gap-1.5 font-bold animate-pulse">
              <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
              SYSTEM STATE: EMERGENCY EXTRACTION PROTOCOL 01
            </span>
          ) : isTempete ? (
            <span className="text-cyan-400 flex items-center gap-1.5 animate-pulse">
              <span className="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              SYSTEM STATE: electrostatic overload // electrostatic storm
            </span>
          ) : isHoundsMode ? (
            <span className="text-red-400 flex items-center gap-1.5 animate-pulse">
              <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              SYSTEM STATE: peripheral biologic shadow markers
            </span>
          ) : isSignalMode ? (
            <span className="text-amber-500 flex items-center gap-1.5 animate-pulse">
              <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full" />
              SYSTEM STATE: uncalibrated signal aberration
            </span>
          ) : isScannerMode ? (
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              SYSTEM STATE: active radar scanner // surveying lithosphere
            </span>
          ) : (
            <span className="text-emerald-500/80 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              SYSTEM STATE: PASSIVE SENTINEL NOMINAL
            </span>
          )}
        </span>
        <span className="font-mono text-[9px] text-stone-500 tracking-widest">
          {isSilenceMode ? 'STABILITY: LOST' : 'CYCLE STABILITY: 100.0% (PERFECT)'}
        </span>
      </div>
    </div>
  );
}
