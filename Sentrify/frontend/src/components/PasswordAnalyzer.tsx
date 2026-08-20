import React, { useState, useEffect } from 'react';
import { usePasswordStrength } from '../hooks/usePasswordStrength';
import { StrengthMeter } from './StrengthMeter';
import { generateSecurePassword, hashSHA256 } from '../utils/cryptoUtils';

export const PasswordAnalyzer: React.FC = () => {
  const [password, setPassword] = useState('');
  const [sessionId] = useState(() => {
    // Basic session ID generation for demo purposes
    return Math.random().toString(36).substring(2, 15);
  });
  const [isReused, setIsReused] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  
  const analysis = usePasswordStrength(password);

  useEffect(() => {
    const checkReuse = async () => {
      if (!password) {
        setIsReused(false);
        return;
      }

      setIsChecking(true);
      try {
        const digest = await hashSHA256(password);
        
        // Local storage reuse check
        const localHistory = JSON.parse(localStorage.getItem('pwd_history') || '[]');
        if (localHistory.includes(digest)) {
          setIsReused(true);
          setIsChecking(false);
          return;
        }

        // Backend reuse check
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/check-reuse`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, digest })
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsReused(data.isReused);
        }
      } catch (error) {
        console.error('Error checking password reuse:', error);
      } finally {
        setIsChecking(false);
      }
    };

    // Debounce the reuse check to avoid hammering the API
    const timeoutId = setTimeout(() => {
      checkReuse();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [password, sessionId]);

  const handleGenerate = () => {
    const newPassword = generateSecurePassword(16);
    setPassword(newPassword);
  };

  const isChecklistIncomplete = !Object.values(analysis.checklist).every(Boolean);

  const handleSave = async () => {
    if (!password || isReused || isChecklistIncomplete) return;
    
    try {
      const digest = await hashSHA256(password);
      
      // Save locally
      const localHistory = JSON.parse(localStorage.getItem('pwd_history') || '[]');
      if (!localHistory.includes(digest)) {
        localStorage.setItem('pwd_history', JSON.stringify([...localHistory, digest]));
      }

      // Save to backend
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/save-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, digest })
      });

      // Show success popup and clear input
      setShowSuccessPopup(true);
      setPassword('');
      setTimeout(() => setShowSuccessPopup(false), 3000);
    } catch (error) {
      console.error('Error saving password:', error);
      alert('Failed to save password.');
    }
  };

  return (
    <div className="analyzer-container">
      <div className="input-group">
        <input 
          type="text" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter a password to analyze..."
          className="password-input"
        />
        <button onClick={handleGenerate} className="generate-btn" disabled={isChecklistIncomplete}>
          Generate Secure Password
        </button>
      </div>

      {password && (
        <div className="analysis-results">
          <StrengthMeter analysis={analysis} />
          
          {isReused && (
            <div className="alert-error">
              <strong>Warning:</strong> This password has been used before in this session!
            </div>
          )}
          
          <div className="suggestions-box">
            <h3>Actionable Suggestions:</h3>
            {analysis.suggestions.length > 0 ? (
              <ul>
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            ) : (
              <p className="text-success">Looks good! No further suggestions.</p>
            )}
          </div>
          
          <div className="checklist-box">
            <h3>Checklist:</h3>
            <ul>
              <li className={analysis.checklist.length ? 'checked' : 'unchecked'}>12+ characters</li>
              <li className={analysis.checklist.uppercase ? 'checked' : 'unchecked'}>Uppercase letter</li>
              <li className={analysis.checklist.lowercase ? 'checked' : 'unchecked'}>Lowercase letter</li>
              <li className={analysis.checklist.number ? 'checked' : 'unchecked'}>Number</li>
              <li className={analysis.checklist.symbol ? 'checked' : 'unchecked'}>Symbol</li>
            </ul>
          </div>

          <button onClick={handleSave} className="save-btn" disabled={isChecking || isReused || isChecklistIncomplete}>
            Save Password (Hashed)
          </button>
        </div>
      )}

      {showSuccessPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-icon">✓</div>
            <h3>Save Successful!</h3>
            <p>Your password was hashed and saved securely.</p>
          </div>
        </div>
      )}
    </div>
  );
};
