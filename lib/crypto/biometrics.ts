/**
 * WebAuthn Biometric Authentication
 * Safe, optional biometric unlock using browser APIs
 */

interface BiometricCredential {
  id: string;
  publicKey: string;
}

// Check if biometrics are available
export async function isBiometricAvailable(): Promise<boolean> {
  if (!window.PublicKeyCredential) {
    return false;
  }

  try {
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return available;
  } catch {
    return false;
  }
}

// Register biometric credential
export async function registerBiometric(username: string): Promise<BiometricCredential | null> {
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: 'HackVault',
          id: window.location.hostname,
        },
        user: {
          id: crypto.getRandomValues(new Uint8Array(16)),
          name: username,
          displayName: 'HackVault User',
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 }, // ES256
          { type: 'public-key', alg: -257 }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          requireResidentKey: false,
        },
        timeout: 60000,
        attestation: 'none',
      },
    }) as PublicKeyCredential;

    if (!credential) return null;

    const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
    
    return {
      id: credentialId,
      publicKey: credentialId, // Simplified for local storage
    };
  } catch (error) {
    console.error('Biometric registration failed:', error);
    return null;
  }
}

// Verify biometric
export async function verifyBiometric(credentialId: string): Promise<boolean> {
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const credentialIdBytes = Uint8Array.from(atob(credentialId), c => c.charCodeAt(0));

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: window.location.hostname,
        allowCredentials: [
          {
            type: 'public-key',
            id: credentialIdBytes,
          },
        ],
        userVerification: 'required',
        timeout: 60000,
      },
    });

    return assertion !== null;
  } catch (error) {
    console.error('Biometric verification failed:', error);
    return false;
  }
}

// Save biometric preference
export function saveBiometricCredential(credentialId: string): void {
  localStorage.setItem('hackvault_biometric_id', credentialId);
  localStorage.setItem('hackvault_biometric_enabled', 'true');
}

// Get saved biometric credential
export function getBiometricCredential(): string | null {
  const enabled = localStorage.getItem('hackvault_biometric_enabled');
  if (enabled !== 'true') return null;
  return localStorage.getItem('hackvault_biometric_id');
}

// Disable biometric
export function disableBiometric(): void {
  localStorage.removeItem('hackvault_biometric_id');
  localStorage.removeItem('hackvault_biometric_enabled');
}
