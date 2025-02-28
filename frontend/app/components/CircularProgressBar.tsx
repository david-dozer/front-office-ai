import React, { useState, useEffect } from 'react';

interface CircularProgressBarProps {
  progress: number; // Target progress (0-100)
  size?: number; // Overall size (default: 200)
  strokeWidth?: number; // Stroke thickness (default: 10)
  duration?: number; // Animation duration in ms (default: 1500)
  animateOnLoad?: boolean; // Whether to animate on mount (default: true)
}

// Define smooth color transitions
const colorStops = [
  { progress: 0, hue: 0, sat: 85, light: 35 },      // Red
  { progress: 12.5, hue: 10, sat: 85, light: 35 },  // Red-Orange
  { progress: 25, hue: 20, sat: 85, light: 40 },    // Orange
  { progress: 37.5, hue: 40, sat: 85, light: 45 },  // Orange-Yellow
  { progress: 50, hue: 55, sat: 85, light: 50 },    // Yellow
  { progress: 62.5, hue: 65, sat: 85, light: 50 },  // Yellow-Green
  { progress: 75, hue: 85, sat: 85, light: 45 },    // Green-Yellow
  { progress: 87.5, hue: 100, sat: 85, light: 40 }, // Near Green
  { progress: 100, hue: 120, sat: 85, light: 35 },  // Green
];

// Function to interpolate colors smoothly
const getSmoothColor = (progress: number) => {
  const clamped = Math.max(0, Math.min(100, progress));
  for (let i = 0; i < colorStops.length - 1; i++) {
    const start = colorStops[i];
    const end = colorStops[i + 1];
    if (clamped >= start.progress && clamped <= end.progress) {
      const t = (clamped - start.progress) / (end.progress - start.progress);
      const hue = start.hue + t * (end.hue - start.hue);
      const sat = start.sat + t * (end.sat - start.sat);
      const light = start.light + t * (end.light - start.light);
      return `hsl(${hue}, ${sat}%, ${light}%)`;
    }
  }
  return 'hsl(0, 85%, 35%)';
};

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  progress,
  size = 200,
  strokeWidth = 10,
  duration = 1500,
  animateOnLoad = true,
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(animateOnLoad ? 0 : progress);

  useEffect(() => {
    if (!animateOnLoad) return;

    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;

      // Ease-out transition for smoother stopping
      const progressFraction = Math.pow(elapsed / duration, 0.8);
      const newProgress = Math.min(progress, progressFraction * progress);
      
      setAnimatedProgress(newProgress);
      
      if (elapsed < duration) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [progress, duration, animateOnLoad]);

  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedProgress / 100) * circumference;
  const strokeColor = getSmoothColor(animatedProgress);

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#eee"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle (rotated so it starts at the top) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.25, 1, 0.5, 1), stroke 1s linear',
          }}
        />
      </svg>
      {/* Display progress percentage under the wheel */}
      {/* <div style={{ marginTop: '10px', fontSize: size * 0.2, color: '#333' }}>
        {`${Math.round(animatedProgress)}%`}
      </div> */}
    </div>
  );
};

export default CircularProgressBar;
