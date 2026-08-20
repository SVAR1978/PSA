import React from 'react';
import type { PasswordAnalysis, StrengthLevel } from '../hooks/usePasswordStrength';

interface StrengthMeterProps {
  analysis: PasswordAnalysis;
}

const getMeterColor = (level: StrengthLevel): string => {
  switch (level) {
    case 'Weak': return 'bg-red-500';
    case 'Moderate': return 'bg-yellow-500';
    case 'Strong': return 'bg-green-400';
    case 'Very Strong': return 'bg-green-600';
    default: return 'bg-gray-300';
  }
};

const getWidth = (level: StrengthLevel): string => {
  switch (level) {
    case 'Weak': return '25%';
    case 'Moderate': return '50%';
    case 'Strong': return '75%';
    case 'Very Strong': return '100%';
    default: return '0%';
  }
};

export const StrengthMeter: React.FC<StrengthMeterProps> = ({ analysis }) => {
  return (
    <div className="strength-meter-container">
      <div className="meter-header">
        <span className="strength-label">Strength: {analysis.level}</span>
        <span className="entropy-label">{analysis.entropy} bits of entropy</span>
      </div>
      <div className="meter-bg">
        <div 
          className={`meter-fill ${getMeterColor(analysis.level)}`}
          style={{ width: getWidth(analysis.level) }}
        ></div>
      </div>
    </div>
  );
};
