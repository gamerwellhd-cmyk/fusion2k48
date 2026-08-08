import React, { createContext, useContext, ReactNode } from 'react';
import { useFirebaseInit } from '../../hooks/useFirebaseInit';

type FirebaseContextState = {
  isInitialized: boolean;
  error: string | null;
};

const FirebaseContext = createContext<FirebaseContextState>({
  isInitialized: false,
  error: null,
});

export const FirebaseProvider = ({ children }: { children: ReactNode }) => {
  const { isInitialized, error } = useFirebaseInit();

  return (
    <FirebaseContext.Provider value={{ isInitialized, error }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebaseContext = () => useContext(FirebaseContext);

export default FirebaseContext;
