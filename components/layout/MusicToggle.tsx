"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";

interface MusicToggleProps {
  audioSrc?: string;
}

export function MusicToggle({ audioSrc = "/audio/background-music.mp3" }: MusicToggleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element on mount
    const audio = new Audio(audioSrc);
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    // Check if audio can be loaded
    audio.addEventListener("canplaythrough", () => {
      setIsLoaded(true);
    });

    audio.addEventListener("error", () => {
      // Audio file not found or error loading - keep component visible but non-functional
      console.log("Audio file not found at:", audioSrc);
      setIsLoaded(false);
    });

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [audioSrc]);

  const toggleSound = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.log("Audio playback failed:", err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      onClick={toggleSound}
      className="flex items-center gap-2 text-[10px] md:text-[11px] tracking-[0.15em] text-white/60 hover:text-white/90 transition-colors uppercase pointer-events-auto"
      aria-label={isPlaying ? "Turn sound off" : "Turn sound on"}
    >
      {/* Sound wave bars animation */}
      <div className="flex items-end gap-[2px] h-3">
        {[1, 2, 3, 4].map((bar) => (
          <motion.div
            key={bar}
            className="w-[2px] bg-current rounded-full"
            animate={{
              height: isPlaying 
                ? ["4px", "12px", "6px", "10px", "4px"]
                : "4px",
            }}
            transition={{
              duration: 0.8,
              repeat: isPlaying ? Infinity : 0,
              delay: bar * 0.1,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      <span>
        SOUND [{isPlaying ? "ON" : "OFF"}]
      </span>
    </motion.button>
  );
}


