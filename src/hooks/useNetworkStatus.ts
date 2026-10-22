import { useEffect, useState, useCallback } from 'react';
import { getSimulatedOffline, setSimulatedOffline, syncPendingRecords, subscribeToDataChanges } from '../services/storageService';

export function useNetworkStatus() {
  const [isBrowserOnline, setIsBrowserOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [isSimulatedOffline, setIsSimulatedOfflineState] = useState<boolean>(() => {
    return getSimulatedOffline();
  });

  // Effective status: online only if browser is online AND user hasn't toggled simulated offline
  const isEffectiveOnline = isBrowserOnline && !isSimulatedOffline;

  const toggleSimulatedOffline = useCallback(() => {
    const nextState = !isSimulatedOffline;
    setSimulatedOffline(nextState);
    setIsSimulatedOfflineState(nextState);

    // If coming back online, auto-sync pending records
    if (!nextState && isBrowserOnline) {
      setTimeout(() => {
        syncPendingRecords();
      }, 400);
    }
  }, [isSimulatedOffline, isBrowserOnline]);

  useEffect(() => {
    const handleOnline = () => {
      setIsBrowserOnline(true);
      if (!getSimulatedOffline()) {
        setTimeout(() => {
          syncPendingRecords();
        }, 500);
      }
    };

    const handleOffline = () => {
      setIsBrowserOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsub = subscribeToDataChanges(() => {
      setIsSimulatedOfflineState(getSimulatedOffline());
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsub();
    };
  }, []);

  return {
    isOnline: isEffectiveOnline,
    isBrowserOnline,
    isSimulatedOffline,
    toggleSimulatedOffline,
  };
}
