import React from 'react';
import AppRouter from './routes';
import LoadingSpinner from './core/ui/LoadingSpinner';
import { useFirebaseContext } from './core/context/FirebaseContext';

export default function App() {
  const { isInitialized, error } = useFirebaseContext();

  React.useEffect(() => {
    if (error) console.warn('Firebase sync disabled:', error);
  }, [error]);

  if (!isInitialized) return <LoadingSpinner />;

  return <AppRouter />;
}
