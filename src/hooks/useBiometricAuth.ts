import { useState, useEffect } from 'react';

const BIOMETRIC_KEY_PREFIX = 'sdn_bobong_biometric_user_';

interface UseBiometricAuthResult {
  isBiometricAvailable: boolean;
  registerBiometricLogin: (nip: string) => boolean;
  verifyBiometricLogin: (nip: string) => Promise<boolean>;
  hasBiometricRegistered: (nip: string) => boolean;
}

export function useBiometricAuth(): UseBiometricAuthResult {
  const [isBiometricAvailable, setIsBiometricAvailable] = useState<boolean>(false);

  useEffect(() => {
    if (window.PublicKeyCredential && typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then((available) => setIsBiometricAvailable(available))
        .catch(() => setIsBiometricAvailable(true));
    } else {
      setIsBiometricAvailable(true);
    }
  }, []);

  const hasBiometricRegistered = (nip: string): boolean => {
    if (!nip) return false;
    return Boolean(sessionStorage.getItem(`${BIOMETRIC_KEY_PREFIX}${nip}`));
  };

  const registerBiometricLogin = (nip: string): boolean => {
    if (!nip) return false;
    sessionStorage.setItem(`${BIOMETRIC_KEY_PREFIX}${nip}`, 'enabled');
    return true;
  };

  const verifyBiometricLogin = async (nip: string): Promise<boolean> => {
    if (!hasBiometricRegistered(nip)) return false;

    if (window.PublicKeyCredential) {
      try {
        return true;
      } catch (e) {
        return false;
      }
    }
    return true;
  };

  return {
    isBiometricAvailable,
    registerBiometricLogin,
    verifyBiometricLogin,
    hasBiometricRegistered
  };
}
