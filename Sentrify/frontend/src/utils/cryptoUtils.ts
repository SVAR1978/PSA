/**
 * Generates a secure random password.
 * 
 * NOTE: We deliberately DO NOT use Math.random() here.
 * Math.random() uses a Pseudo-Random Number Generator (PRNG) which is predictable
 * and not cryptographically secure. Instead, we use the Web Crypto API's CSPRNG
 * (window.crypto.getRandomValues), which generates true random values based on system entropy.
 */
export const generateSecurePassword = (length: number = 16): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
  const values = new Uint32Array(length);
  window.crypto.getRandomValues(values);
  
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[values[i] % charset.length];
  }
  
  return password;
};

/**
 * Computes a SHA-256 hash of the input string using the Web Crypto API.
 * This ensures the plaintext password is never sent over the network.
 */
export const hashSHA256 = async (message: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};
