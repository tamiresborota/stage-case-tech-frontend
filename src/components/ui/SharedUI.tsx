import React from 'react';
import { Box, CircularProgress, Alert, Button } from '@mui/material';

export function LoadingIndicator() {
  return (
    <Box display="flex" justifyContent="center" my={4}>
      <CircularProgress />
    </Box>
  );
}

interface ErrorDisplayProps {
  error: Error | unknown;
  onRetry?: () => void;
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar dados';
  
  return (
    <Alert 
      severity="error" 
      sx={{ mb: 2 }}
      action={onRetry && (
        <Button 
          color="inherit" 
          size="small"
          onClick={onRetry}
        >
          Tentar novamente
        </Button>
      )}
    >
      Erro ao carregar dados: {errorMessage}
    </Alert>
  );
}