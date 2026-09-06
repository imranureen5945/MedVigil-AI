import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function SafetyScoreRing({ score = 100, size = 'sm', animate = true }) {
  const [currentScore, setCurrentScore] = useState(animate ? 0 : score);

  useEffect(() => {
    if (animate) {
      const duration = 1500;
      const steps = 60;
      const stepTime = duration / steps;
      let currentStep = 0;
      
      const timer = setInterval(() => {
        currentStep++;
        setCurrentScore(Math.min(Math.round((score / steps) * currentStep), score));
        if (currentStep >= steps) clearInterval(timer);
      }, stepTime);

      return () => clearInterval(timer);
    }
  }, [score, animate]);

  const getColor = (val) => {
    if (val >= 80) return '#22C55E';
    if (val >= 50) return '#F59E0B';
    return '#EF4444';
  };

  const getLabel = (val) => {
    if (val >= 80) return 'Safe';
    if (val >= 50) return 'Moderate Risk';
    return 'High Risk';
  };

  const color = getColor(score);
  const isLg = size === 'lg';
  const dimension = isLg ? 180 : 80;
  const strokeWidth = isLg ? 12 : 6;
  const radius = (dimension - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: dimension, height: dimension }}>
      <svg width={dimension} height={dimension} className="-rotate-90">
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: animate ? 1.5 : 0, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className={`font-bold ${isLg ? 'text-4xl' : 'text-xl'}`} style={{ color }}>
          {currentScore}
        </span>
        {isLg && (
          <span className="text-gray-500 text-sm font-medium -mt-1">/100</span>
        )}
      </div>
      {isLg && (
        <div className="absolute -bottom-8 whitespace-nowrap font-medium" style={{ color }}>
          {getLabel(score)}
        </div>
      )}
    </div>
  );
}
