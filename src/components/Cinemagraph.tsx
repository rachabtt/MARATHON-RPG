/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { CinemagraphConfig } from '../types';
import { getLocationEffectProfile } from '../utils/locationEffects';
import { getLocationAnchors } from '../utils/locationAnchors';
import { getHoundVisualProfile } from '../utils/houndProfile';

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
  
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  useEffect(() => {
    setImageLoadFailed(false);
  }, [imageUrl]);
  
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
        modeSpeedMultiplier = 1.4 * locationEffect.particleSpeed;
        modeDensityMultiplier = 2.2 * locationEffect.particleDensity;
        particleColorTemplate = 'rgba(185, 48, 28, ALPHA_VAL)';
      } else if (config.environmentFilter === 'storm') {
        modeSpeedMultiplier = 2.8 * locationEffect.particleSpeed;
        modeDensityMultiplier = 2.6 * locationEffect.particleDensity;
        particleColorTemplate = 'rgba(145, 38, 22, ALPHA_VAL)';
      } else if (config.environmentFilter === 'extraction') {
        modeSpeedMultiplier = 2.0 * locationEffect.particleSpeed;
        modeDensityMultiplier = 3.0 * locationEffect.particleDensity;
        particleColorTemplate = 'rgba(205, 55, 35, ALPHA_VAL)';
      } else if (config.environmentFilter === 'silence') {
        modeSpeedMultiplier = 0.4;
        modeDensityMultiplier = 0.3;
        particleColorTemplate = 'rgba(110, 110, 115, ALPHA_VAL)'; // quiet gray
      } else if (config.environmentFilter === 'scanner') {
        modeSpeedMultiplier = 0.95 * locationEffect.particleSpeed;
        modeDensityMultiplier = 0.9 * locationEffect.particleDensity;
        particleColorTemplate = 'rgba(152, 60, 44, ALPHA_VAL)';
      } else if (config.environmentFilter === 'hounds') {
        modeSpeedMultiplier = 0.8 * locationEffect.particleSpeed;
        modeDensityMultiplier = 1.15 * locationEffect.particleDensity;
        particleColorTemplate = 'rgba(130, 48, 35, ALPHA_VAL)';
      } else {
        modeSpeedMultiplier *= locationEffect.particleSpeed;
        modeDensityMultiplier *= locationEffect.particleDensity;
      }

      particles.forEach((p) => {
        // Evaluate age of particle within its lifespan cycle:
        // By using continuous math with modulo, we guarantee the exact same coordinate positions at the loop boundaries!
        const particleTime = (loopTimeSec + p.phaseOffset) % p.duration;
        const speed = config.windSpeed * p.speedFactor * 65.0 * modeSpeedMultiplier; // wind drift rate in pixels-equivalent
        
        // Progress downwind
        let currentX = p.startX + particleTime * speed;
        let currentY = p.startY + particleTime * speed * Math.sin(locationEffect.particleDrift + p.driftAngle * 0.25);
        
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
  const locationEffect = getLocationEffectProfile(config.activeLocation, config);
  const quickEffect = config.quickEffect;
  const quickEffectElapsed = quickEffect ? Date.now() - quickEffect.startedAt : Number.POSITIVE_INFINITY;
  const isQuickEffectActive = Boolean(quickEffect && quickEffectElapsed < quickEffect.durationMs);
  const isRadioBurst = isQuickEffectActive && quickEffect?.type === 'glitch_radio';
  const isEmBurst = isQuickEffectActive && quickEffect?.type === 'flash_em';
  const isHoundBurst = isQuickEffectActive && quickEffect?.type === 'ombre_hound';
  const anchors = getLocationAnchors(config.activeLocation);
  const houndProfile = getHoundVisualProfile(config.activeLocation);
  const scannerX = anchors.scannerPulse.x * 1000;
  const scannerY = anchors.scannerPulse.y * 562.5;
  const radioX = anchors.radioZone.x * 1000;
  const radioY = anchors.radioZone.y * 562.5;
  const lightSources = anchors.lightSources.map((point) => ({
    x: point.x * 1000,
    y: point.y * 562.5,
  }));
  const houndProgress = Math.min(1, quickEffectElapsed / houndProfile.durationMs);
  const houndX = (anchors.houndZones.entry.x + (anchors.houndZones.exit.x - anchors.houndZones.entry.x) * houndProgress) * 100;
  const houndY = (anchors.houndZones.entry.y + (anchors.houndZones.exit.y - anchors.houndZones.entry.y) * houndProgress) * 100;

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
  )) || isScannerPeak || isRadioBurst;

  const glitchX = isGlitchFrame ? (Math.random() - 0.5) * (isScannerPeak ? 5 : glitchFactor * 32 + locationEffect.cameraShake * 9) : 0;
  const glitchY = isGlitchFrame ? (Math.random() - 0.5) * (isScannerPeak ? 3 : glitchFactor * 10 + locationEffect.cameraShake * 4) : 0;
  const glitchScale = isGlitchFrame ? 1.0 + (Math.random() * (isScannerPeak ? 0.005 : 0.025 * glitchFactor)) : 1.0;

  // Periodic EM flashes timing - heavily boosted during EM Storms
  let flashActive = (config.visualEmFlashes || isEmBurst) && (
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
    let baseFilter = locationEffect.filter;

    if (isGlitchFrame && !isSilenceMode) {
      baseFilter += ` hue-rotate(${Math.random() * 80 * glitchFactor}deg) contrast(${1.15 + Math.random() * 0.35})`;
    }
    if (isEmBurst) {
      baseFilter += ' brightness(1.22) contrast(1.35) saturate(0.92)';
    }
    return baseFilter;
  };

  // Transition style should be instantaneous (abrupt) for signal glitch or dead silence
  const useAbruptTransitions = isSignalMode || isSilenceMode;
  const transitionRules = useAbruptTransitions 
    ? 'none' 
    : 'filter 0.8s ease-in-out, transform 0.15s ease-out';

  return (
    <div 
      id="cinemagraph-viewport"
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen overflow-hidden bg-stone-950 select-none"
      style={{ 
        filter: getFilterStyle(), 
        transform: `translate(${glitchX + Math.sin(timeSec * 18) * locationEffect.cameraShake}px, ${glitchY}px) scale(${glitchScale})`,
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

      {/* 1. Base Landscape Image for active location */}
      <div className="absolute inset-0 select-none pointer-events-none w-full h-full z-0">
        {imageLoadFailed ? (
          <div className="absolute inset-0 bg-black flex items-center justify-center text-[10px] font-mono tracking-widest text-stone-700 uppercase">
            // UESC VISUEL INDISPONIBLE
          </div>
        ) : (
          <img
            key={imageUrl}
            src={imageUrl}
            alt="Tau Ceti IV - Lieu actif"
            referrerPolicy="no-referrer"
            onError={() => setImageLoadFailed(true)}
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-opacity duration-1000 ease-in-out"
          />
        )}
      </div>

      {/* Real-time EM lightning flashes overlay */}
      {flashActive && (
        <div className={`absolute inset-0 ${isEmBurst ? 'bg-orange-100/70' : 'bg-sky-100/45'} mix-blend-color-dodge pointer-events-none z-10 animate-pulse`} />
      )}

      {isEmBurst && (
        <div className="absolute inset-0 bg-black/65 pointer-events-none z-25 animate-pulse" />
      )}

      {/* Poussiere rouge background blend overlays */}
      {isPoussiereMode && (
        <>
          <div className="absolute inset-0 bg-[#9c2f1e]/15 mix-blend-multiply pointer-events-none z-10" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#8c3523]/45 via-[#8c3523]/22 to-transparent pointer-events-none z-10" />
        </>
      )}

      {config.activeLocation === 'red_plains' && (
        <div className="absolute inset-0 pointer-events-none z-10 opacity-45 mix-blend-screen">
          <div className="absolute left-0 right-0 h-[3px] bg-orange-200/20 blur-[1px]" style={{ top: `${anchors.mirageBand.y * 100}%`, transform: `translateY(${Math.sin(timeSec * 5) * 6}px) scaleX(${1 + Math.sin(timeSec * 2) * 0.018})` }} />
          <div className="absolute left-0 right-0 h-[1px] bg-red-200/16 blur-[1px]" style={{ top: `${(anchors.mirageBand.y + anchors.mirageBand.height * 0.55) * 100}%`, transform: `translateY(${Math.cos(timeSec * 4) * 5}px)` }} />
        </div>
      )}

      {config.activeLocation === 'new_carthage' && (
        <div className="absolute inset-x-0 top-0 h-1/2 pointer-events-none z-10 bg-[radial-gradient(circle_at_22%_12%,rgba(255,180,85,0.15),transparent_26%),radial-gradient(circle_at_78%_18%,rgba(255,160,70,0.09),transparent_30%)]" />
      )}

      {config.activeLocation === 'black_arches' && (
        <>
          <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_50%_16%,rgba(190,118,78,0.16),transparent_38%)] mix-blend-screen" />
          <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_52%_52%,transparent_28%,rgba(0,0,0,0.24)_100%)] mix-blend-multiply" />
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
      {(isSignalMode || isRadioBurst) && (
        <>
          {/* Cyan channel shift layer */}
          {!imageLoadFailed && (
            <img
              src={imageUrl}
              onError={() => setImageLoadFailed(true)}
              alt="Cyan offset channel"
              referrerPolicy="no-referrer"
              className="absolute top-0 left-0 w-full h-full object-cover select-none pointer-events-none mix-blend-screen opacity-40 z-10"
              style={{
                transform: `translate(${isGlitchFrame ? (Math.random() - 0.5) * (isRadioBurst ? 34 : 16) : 4}px, ${isGlitchFrame ? (Math.random() - 0.5) * 8 : -2}px)`,
                filter: 'hue-rotate(115deg) saturate(1.8) contrast(1.2)'
              }}
            />
          )}
          {/* Red channel shift layer */}
          {!imageLoadFailed && (
            <img
              src={imageUrl}
              onError={() => setImageLoadFailed(true)}
              alt="Red offset channel"
              referrerPolicy="no-referrer"
              className="absolute top-0 left-0 w-full h-full object-cover select-none pointer-events-none mix-blend-screen opacity-40 z-10"
              style={{
                transform: `translate(${isGlitchFrame ? (Math.random() - 0.5) * (isRadioBurst ? -34 : -16) : -4}px, ${isGlitchFrame ? (Math.random() - 0.5) * -8 : 2}px)`,
                filter: 'hue-rotate(-45deg) saturate(2.0) contrast(1.2)'
              }}
            />
          )}
          {/* Jittery jumping scan parasite lines */}
          <div className="absolute inset-0 pointer-events-none z-20">
            <div className="absolute w-full h-[1px] bg-red-400/30 blur-[0.5px]" style={{ top: `${(timeSec * 35) % 100}%` }} />
            <div className="absolute w-full h-[2px] bg-sky-400/25 blur-[0.5px]" style={{ top: `${((timeSec + 0.3) * 65) % 100}%` }} />
            <div className="absolute w-full h-[4px] bg-yellow-500/10" style={{ top: `${((timeSec + 0.75) * 18) % 100}%` }} />
          </div>
        </>
      )}

      {/* Hound movement language: low, fast, partial silhouettes only. */}
      {(config.visualHoundShadows || isHoundBurst) && !houndProfile.showOnlyOnBurst && (
        <>
          <div 
            className="absolute w-[24%] h-[12%] bg-black/65 rounded-full scale-y-50 pointer-events-none mix-blend-multiply z-20" 
            style={{
              left: `${anchors.houndZones.cover.x * 100 - 12}%`,
              top: `${anchors.houndZones.cover.y * 100}%`,
              filter: `blur(${houndProfile.blurPx + 10}px)`,
              opacity: houndProfile.opacity * (0.44 + 0.22 * Math.sin(timeSec * 2.2)),
              transform: `scale(${houndProfile.scale + 0.08 * Math.sin(timeSec * 2.2)}) translate(${Math.sin(timeSec * 1.8) * 8}px, ${Math.cos(timeSec * 1.2) * 6}px) scaleY(0.42)`,
              transition: 'transform 0.5s ease-out'
            }}
          />
        </>
      )}

      {isHoundBurst && (
        <>
          <div
            className="absolute h-[44px] w-[190px] bg-black/82 rounded-full pointer-events-none mix-blend-multiply z-20"
            style={{
              left: `${houndX}%`,
              top: `${houndY}%`,
              filter: `blur(${houndProfile.blurPx}px)`,
              transform: `scale(${houndProfile.scale}) scaleY(0.34) rotate(-3deg)`,
              opacity: Math.max(0, houndProfile.opacity + 0.26 - houndProgress * 0.72)
            }}
          />
          <div
            className="absolute h-[34px] w-[94px] bg-stone-950/75 pointer-events-none z-20"
            style={{
              left: `${houndX + 4}%`,
              top: `${houndY - 2}%`,
              clipPath: 'polygon(4% 82%, 19% 43%, 38% 28%, 55% 18%, 72% 36%, 92% 78%, 80% 86%, 62% 64%, 46% 82%, 25% 67%, 12% 92%)',
              filter: `blur(${Math.max(2, houndProfile.blurPx - 7)}px)`,
              transform: `scale(${houndProfile.scale})`,
              opacity: Math.max(0, houndProfile.opacity + 0.20 - houndProgress * 0.85)
            }}
          />
          <div
            className="absolute w-[16%] h-[9%] border border-orange-400/18 bg-orange-400/5 pointer-events-none z-20"
            style={{
              left: `${Math.max(4, Math.min(86, anchors.radioZone.x * 100 - 8))}%`,
              top: `${Math.max(10, Math.min(84, anchors.radioZone.y * 100 - 4))}%`,
              opacity: 0.3 + 0.35 * Math.sin(timeSec * 28),
              filter: 'blur(0.5px)'
            }}
          />
        </>
      )}

      {/* Hounds proches - extra low slithering quadruped shadows and fuzzy silhouettes fleeing under arches */}
      {isHoundsMode && (
        <>
          <div 
            className="absolute bg-stone-950/75 blur-[16px] rounded-full pointer-events-none mix-blend-multiply"
            style={{
              top: `${anchors.houndZones.cover.y * 100}%`,
              left: `${anchors.houndZones.entry.x * 100 + ((timeSec * 0.45) % 5.0) * (anchors.houndZones.exit.x - anchors.houndZones.entry.x) * 22}%`,
              width: houndProfile.variant === 'distant_silhouette' ? '120px' : '165px',
              height: houndProfile.variant === 'equipment_reflection' ? '42px' : '50px',
              opacity: Math.sin(((timeSec * 0.8) % 5.0) * Math.PI / 5.0) * houndProfile.opacity,
              transform: `scale(${houndProfile.scale}) scaleY(0.38) rotate(-4deg)`,
              transition: 'left 0.1s linear'
            }}
          />
          <div 
            className="absolute bg-black/80 blur-[20px] rounded-full pointer-events-none mix-blend-multiply"
            style={{
              top: `${anchors.houndZones.cover.y * 100 - 6}%`,
              left: `${anchors.houndZones.cover.x * 100}%`,
              width: '100px',
              height: '40px',
              transform: `scale(${1.0 + 0.25 * Math.sin(timeSec * 4.8)}) translate(${(Math.sin(timeSec * 4.2)) * 14}px, ${(Math.cos(timeSec * 3.1)) * 5}px)`,
              opacity: 0.75
            }}
          />
          {((ticker % 6000 < 1500) && (ticker % 6000 > 300)) && (
            <div 
              className="absolute w-14 h-8 bg-stone-950/65 blur-[3px] pointer-events-none z-10 animate-pulse"
              style={{
                left: `${anchors.houndZones.cover.x * 100 + 2}%`,
                top: `${anchors.houndZones.cover.y * 100 - 5}%`,
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
            [ALETHEIA NOTICE]
          </div>
          <div className="mt-1 text-stone-300 leading-relaxed">
            - INTERFÉRENCE LOCALE DÉTECTÉE<br />
            - ACTIVITÉ PÉRIPHÉRIQUE NON CONFIRMÉE<br />
            - FORCE EM : {90 + Math.floor(Math.sin(timeSec) * 24)} µT
          </div>
        </div>
      )}

      {/* Double-layered scanlines for CTR and Scanner filters */}
      {(isScannerMode || isSignalMode || isTempete || locationEffect.scanlineOpacity > 0.2) && (
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.18)_50%)] bg-[size:100%_4px] pointer-events-none z-20" style={{ opacity: Math.min(0.86, locationEffect.scanlineOpacity + (isRadioBurst ? 0.28 : 0)) }} />
      )}

      {/* Retro Horizontal scanline jitter overlay for intense glitch fields */}
      {isGlitchFrame && !isSilenceMode && (
        <div className="absolute inset-0 bg-stone-950/15 pointer-events-none z-15">
          <div className="absolute top-1/2 left-0 w-full h-[3px] bg-white/20 blur-[1px]" style={{ top: `${Math.random() * 100}%` }} />
          <div className="absolute top-1/4 left-0 w-full h-[5px] bg-white/10 blur-[2px]" style={{ top: `${Math.random() * 100}%` }} />
        </div>
      )}

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

        {/* Anchored environmental light sources */}
        {headlightAlphaActual > 0.05 && (
          <g style={{ opacity: headlightAlphaActual, transition: 'opacity 0.03s linear' }}>
            {lightSources.map((source, index) => (
              <g key={`light-${index}`}>
                <polygon
                  points={`${source.x},${source.y} ${source.x + (index % 2 === 0 ? 120 : -115)},${source.y + 165} ${source.x + (index % 2 === 0 ? -185 : 170)},${source.y + 178}`}
                  fill="url(#headlight-cone-1)"
                  className="mix-blend-screen"
                  opacity={config.activeLocation === 'black_arches' ? 0.20 : 0.36}
                />
                <circle cx={source.x} cy={source.y} r={isPoussiereMode || isTempete ? 34 : 18} fill={index % 2 === 0 ? 'url(#headlight-glow-1)' : 'url(#headlight-glow-2)'} />
              </g>
            ))}
          </g>
        )}

        {/* ==================== B. AUTOMATED SCIENCE TOWER BEACONS ==================== */}
        <g>
          {/* Main scanning dome glow - pulses red/cyan/amber */}
          <circle 
            cx={scannerX}
            cy={scannerY}
            r={12 + 10 * domePulse} 
            fill="url(#scanner-glow-amber)" 
            style={{ opacity: isSilenceMode ? 0 : 0.3 + 0.7 * domePulse }} 
          />
          <circle 
            cx={scannerX}
            cy={scannerY}
            r="4" 
            fill={isSilenceMode ? '#444' : '#ffbc3c'} 
          />

          {/* Green indicator LED near power assembly base */}
          <circle
            cx={scannerX - 22}
            cy={scannerY + 121}
            r={6 + 4 * greenLedPulse}
            fill="url(#scanner-glow-green)"
            style={{ opacity: isSilenceMode ? 0 : 0.4 + 0.6 * greenLedPulse }}
          />
          <circle cx={scannerX - 22} cy={scannerY + 121} r="1.8" fill={isSilenceMode ? '#333' : '#a4ffb6'} />

          {/* Amber warning sensor LED blinking */}
          <circle
            cx={scannerX - 47}
            cy={scannerY + 135}
            r={5 + 3 * amberLedPulse}
            fill="url(#scanner-glow-red)"
            style={{ opacity: isSilenceMode ? 0 : 0.2 + 0.8 * amberLedPulse }}
          />
          <circle cx={scannerX - 47} cy={scannerY + 135} r="1.5" fill={isSilenceMode ? '#333' : '#ffa0a0'} />
        </g>

        {/* Geological active scanner green waves and cargo sweeping target */}
        {isScannerMode && (
          <g stroke="rgba(16, 185, 129, 0.55)" fill="none" strokeWidth="1.2">
            {/* Sweeping concentric concentric lines radiating down from scanner tower */}
            <circle cx={scannerX} cy={scannerY} r={`${(timeSec * 115) % 180}`} style={{ opacity: 1.0 - ((timeSec * 115) % 180) / 180 }} />
            <circle cx={scannerX} cy={scannerY} r={`${((timeSec + 0.45) * 115) % 180}`} style={{ opacity: 1.0 - (((timeSec + 0.45) * 115) % 180) / 180 }} />
            {/* Laser sector analyzer spot pointing back at the crates */}
            <polygon 
              points={`${scannerX},${scannerY} ${scannerX - 105},${scannerY + 74 + 50 * domePulse} ${scannerX - 145},${scannerY + 134 - 50 * domePulse}`} 
              fill="rgba(16, 185, 129, 0.11)" 
              className="mix-blend-screen"
            />
            {/* Circle boundary around boxes */}
            <circle cx={scannerX - 118} cy={scannerY + 112} r="45" stroke="rgba(16, 185, 129, 0.35)" strokeDasharray="3, 3" />
            <text x={scannerX - 118} y={scannerY + 72} fill="rgba(16, 185, 129, 0.85)" fontFamily="monospace" fontSize="8" textAnchor="middle" letterSpacing="1">
              SCAN ACTIVE // ANALYZING LITHOLOGY
            </text>
          </g>
        )}

        {/* High Voltage EM electrostatic discharges over transmitter cables */}
        {isTempete && (ticker % 1100 < 150) && (Math.random() < 0.72) && (
          <g stroke="#67e8f9" strokeWidth="1.5" fill="none" filter="drop-shadow(0 0 4px #06b6d4) drop-shadow(0 0 1px #a5f3fc)">
            {/* Static spark connecting far right antenna 952,80 to 840,280 */}
            <path d={getLightningPath(radioX, radioY, scannerX + 110, scannerY + 30)} opacity={0.88} />
            {/* Static spark on rover antenna */}
            <path d={getLightningPath(285, 210, 268, 300)} opacity={0.7} />
            {/* Spark around geological beacon tower */}
            <path d={getLightningPath(scannerX, scannerY, scannerX - 45, scannerY + 135)} opacity={0.65} />
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
          background: locationEffect.haze,
          opacity: Math.min(0.72, atmosphereHazeAlpha + locationEffect.hazeOpacity)
        }}
      />

      {locationEffect.ghostingOpacity > 0 && !imageLoadFailed && (
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none mix-blend-screen z-15"
          style={{
            opacity: locationEffect.ghostingOpacity + (isRadioBurst ? 0.18 : 0),
            transform: `translate(${config.activeLocation === 'black_arches' ? -10 : 8}px, 0)`,
            filter: 'blur(1px) saturate(0.7)'
          }}
        />
      )}

      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background: `radial-gradient(circle, transparent 42%, rgba(0,0,0,${locationEffect.vignetteOpacity}) 100%)`
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
