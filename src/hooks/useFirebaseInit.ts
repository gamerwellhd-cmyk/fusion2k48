import { useEffect, useState } from 'react';
import { initializeFirebase } from '../services/firebase';

/**
 * Hook para inicializar Firebase ao carregar a app
 */
export const useFirebaseInit = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeFirebase();
        setIsInitialized(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Firebase initialization failed';
        console.error('Firebase init error:', errorMessage);
        setError(errorMessage);
        // Continue anyway - app still works with localStorage
        setIsInitialized(true);
      }
    };

    init();
  }, []);

  return { isInitialized, error };
};
