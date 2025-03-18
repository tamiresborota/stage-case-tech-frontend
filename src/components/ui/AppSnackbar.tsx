import { Alert, Snackbar } from '@mui/material';
import { useSnackbar } from '../../hooks/useSnackbar';

export function AppSnackbar() {
  const { snackbar, closeSnackbar } = useSnackbar();

  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={closeSnackbar}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert 
        onClose={closeSnackbar} 
        severity={snackbar.severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
}