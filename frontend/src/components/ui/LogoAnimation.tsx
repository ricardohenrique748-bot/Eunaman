'use client'
import { useState, useEffect, useRef } from 'react'

const TOTAL_FRAMES = 80;
const FRAME_PREFIX = '/logo_animation/Whisk_idzmvjn4idzifjyi1sy1egotujmlrtljr2ml1cm_';

interface LogoAnimationProps {
  className?: string;
  fill?: boolean;
  width?: number | string;
  height?: number | string;
}

export default function LogoAnimation({ className = '', fill = false, width, height }: LogoAnimationProps) {
  const [frame, setFrame] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    let imagesLoaded = 0;
    const images: HTMLImageElement[] = [];
    let isMounted = true;
    
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new window.Image();
      img.src = `${FRAME_PREFIX}${String(i).padStart(3, '0')}.jpg`;
      img.onload = () => {
        if (!isMounted) return;
        imagesLoaded++;
        if (imagesLoaded === TOTAL_FRAMES) {
          setLoaded(true);
        }
      };
      images.push(img);
    }
    imagesRef.current = images;

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    
    let lastTime = performance.now();
    const interval = 1000 / 30; // ~30 fps
    let reqId: number;

    const animate = (time: number) => {
      if (time - lastTime >= interval) {
        setFrame(prev => (prev + 1) % TOTAL_FRAMES);
        lastTime = time;
      }
      reqId = requestAnimationFrame(animate);
    };

    reqId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(reqId);
  }, [loaded]);

  const currentSrc = loaded ? `${FRAME_PREFIX}${String(frame).padStart(3, '0')}.jpg` : '/logo.png';

  return (
    <img
      src={currentSrc}
      alt="Eunaman Logo Animation"
      className={`object-contain ${className}`}
      style={fill ? { width: '100%', height: '100%', position: 'absolute', inset: 0 } : { width, height }}
    />
  );
}
