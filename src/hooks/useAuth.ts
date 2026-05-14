import { useContext } from 'react';
import { AuthContext, type AuthContextType } from '../context/AuthContext';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider. '
      + 'Make sure AuthProvider wraps your component tree in main.tsx or App.tsx.'
    );
  }
  
  return context;
};
