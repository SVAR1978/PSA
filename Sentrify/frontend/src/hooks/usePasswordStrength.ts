import { useState, useEffect } from 'react';

export type StrengthLevel = 'Weak' | 'Moderate' | 'Strong' | 'Very Strong';

export interface PasswordChecklist {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  symbol: boolean;
}

export interface PasswordAnalysis {
  entropy: number;
  level: StrengthLevel;
  checklist: PasswordChecklist;
  suggestions: string[];
}

const checkSequential = (password: string): boolean => {
  for (let i = 0; i < password.length - 2; i++) {
    const charCode1 = password.charCodeAt(i);
    const charCode2 = password.charCodeAt(i + 1);
    const charCode3 = password.charCodeAt(i + 2);
    if (charCode1 + 1 === charCode2 && charCode2 + 1 === charCode3) {
      return true;
    }
  }
  return false;
};

const checkRepeated = (password: string): boolean => {
  return /(.)\1\1/.test(password);
};

const checkKeyboardPattern = (password: string): boolean => {
  const patterns = ['qwerty', 'asdfgh', 'zxcvbn', '123456'];
  const lowerPass = password.toLowerCase();
  return patterns.some(pattern => lowerPass.includes(pattern));
};

export const usePasswordStrength = (password: string): PasswordAnalysis => {
  const [analysis, setAnalysis] = useState<PasswordAnalysis>({
    entropy: 0,
    level: 'Weak',
    checklist: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      symbol: false,
    },
    suggestions: [],
  });

  useEffect(() => {
    let poolSize = 0;
    const checklist = {
      length: password.length >= 12,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[^a-zA-Z0-9]/.test(password),
    };

    if (checklist.lowercase) poolSize += 26;
    if (checklist.uppercase) poolSize += 26;
    if (checklist.number) poolSize += 10;
    if (checklist.symbol) poolSize += 32;

    const entropy = poolSize > 0 ? password.length * Math.log2(poolSize) : 0;
    const roundedEntropy = Math.round(entropy);

    const suggestions: string[] = [];
    if (!checklist.length) suggestions.push(`Too short \u2014 add ${Math.max(0, 12 - password.length)} more characters.`);
    if (!checklist.lowercase) suggestions.push('Add a lowercase letter.');
    if (!checklist.uppercase) suggestions.push('Add an uppercase letter.');
    if (!checklist.number) suggestions.push('Add a number.');
    if (!checklist.symbol) suggestions.push('Add a symbol like ! or #.');

    // Penalties
    let penalty = 0;
    if (checkSequential(password)) {
      suggestions.push('Avoid sequential characters like "abc" or "123".');
      penalty += 15;
    }
    if (checkRepeated(password)) {
      suggestions.push('Avoid repeated characters like "aaa".');
      penalty += 15;
    }
    if (checkKeyboardPattern(password)) {
      suggestions.push('Avoid common keyboard patterns like "qwerty".');
      penalty += 20;
    }

    const effectiveEntropy = Math.max(0, entropy - penalty);

    let level: StrengthLevel = 'Weak';
    if (effectiveEntropy > 60 && Object.values(checklist).every(Boolean)) {
      level = 'Very Strong';
    } else if (effectiveEntropy > 40) {
      level = 'Strong';
    } else if (effectiveEntropy > 25) {
      level = 'Moderate';
    }

    setAnalysis({
      entropy: roundedEntropy,
      level,
      checklist,
      suggestions,
    });
  }, [password]);

  return analysis;
};
