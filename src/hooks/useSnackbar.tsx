import { createContext, useState, useContext, ReactNode } from 'react';

type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
}

const initialState: SnackbarState = {
  open: false,
  message: '',
  severity: 'success'
};

interface SnackbarContextProps {
  snackbar: SnackbarState;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  closeSnackbar: () => void;
}

const SnackbarContext = createContext<SnackbarContextProps | undefined>(undefined);

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [snackbar, setSnackbar] = useState<SnackbarState>(initialState);

  const showSuccess = (message: string) => {
    setSnackbar({ open: true, message, severity: 'success' });
  };

  const showError = (message: string) => {
    setSnackbar({ open: true, message, severity: 'error' });
  };

  const showWarning = (message: string) => {
    setSnackbar({ open: true, message, severity: 'warning' });
  };

  const showInfo = (message: string) => {
    setSnackbar({ open: true, message, severity: 'info' });
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <SnackbarContext.Provider value={{ 
      snackbar, 
      showSuccess, 
      showError, 
      showWarning, 
      showInfo, 
      closeSnackbar 
    }}>
      {children}
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
}