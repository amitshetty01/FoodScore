'use client';
import { useEffect, useState } from 'react';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  grade?: string;
}

export function ScoreRing({ score, size = 120, strokeWidth = 10, showLabel = true, grade }: ScoreRingProps) {
  const [animated, setAnimated] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (animated / 10) * circumference;
  const offset = circumference - progress;
  const innerSize = size - strokeWidth * 2;

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const ringColor = score >= 8 ? '#10b981' : score >= 6.5 ? '#22c55e' : score >= 5 ? '#ca8a04' : score >= 3.5 ? '#ea580c' : '#dc2626';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-zinc-100 dark:text-zinc-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="score-ring drop-shadow-sm"
          style={{ filter: `drop-shadow(0 0 6px ${ringColor}40)` }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="rounded-full flex flex-col items-center justify-center"
            style={{ width: innerSize, height: innerSize }}
          >
            <span className={`font-syne font-bold ${size > 100 ? 'text-3xl' : 'text-xl'} text-zinc-900 dark:text-white`}>
              {score.toFixed(1)}
            </span>
            {grade && (
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 -mt-0.5">
                {grade}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
