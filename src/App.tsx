import { Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppSnackbar } from './components/ui/AppSnackbar';
import { SnackbarProvider } from './hooks/useSnackbar';

import Layout from './components/ui/Layout';
import Dashboard from './components/Dashboard';
import AreasPage from './components/areas/AreasPage';
import ProcessoListPage from './components/processos/ProcessoListPage';
import ProcessoFormPage from './components/processos/ProcessoFormPage';
import ProcessoDetalhePage from './components/processos/ProcessoDetalhePage';
import SubprocessoListPage from './components/processos/SubprocessoListPage';
import TodosProcessosPage from './components/processos/TodosProcessosPage';
import ProcessoHierarchyVisualization from './components/processos/ProcessoHierarchyVisualization';
import NovoProcessoAreaSelectionPage from './components/processos/NovoProcessoAreaSelectionPage';
import ProcessoTipoSelectionPage from './components/processos/ProcessoTipoSelectionPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 1,
      staleTime: 0,
      refetchOnMount: 'always'
    }
  }
});

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f7fa'
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500
        }
      }
    }
  }
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Dashboard />
      },
      {
        path: '/areas',
        element: <AreasPage />
      },
      {
        path: '/areas/:areaId/processos',
        element: <ProcessoListPage />
      },
      {
        path: '/areas/:areaId/processos/novo',
        element: <ProcessoFormPage />
      },
      {
        path: '/processos/:processoId/detalhe',
        element: <ProcessoDetalhePage />
      },
      {
        path: '/processos/:processoId/editar',
        element: <ProcessoFormPage />
      },
      {
        path: '/processos/:processoId/subprocessos',
        element: <SubprocessoListPage />
      },
      {
        path: '/processos/:processoId/subprocessos/novo',
        element: <ProcessoFormPage />
      },
      {
        path: '/processos/todos',
        element: <TodosProcessosPage />
      },
      {
        path: '/processos/lista',
        element: <ProcessoListPage />
      },
      {
        path: '/processos/hierarquia',
        element: <ProcessoHierarchyVisualization />
      },
      {
        path: '/processos/novo',
        element: <NovoProcessoAreaSelectionPage />
      },
      {
        path: '/areas/:areaId/processo-tipo',
        element: <ProcessoTipoSelectionPage />
      },
      {
        path: '*',
        element: <Navigate to="/" replace />
      }
    ]
  }
]);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider>
          <RouterProvider router={router} />
          <AppSnackbar />
        </SnackbarProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;