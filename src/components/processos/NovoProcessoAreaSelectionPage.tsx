import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Card, 
  CardContent,
  Breadcrumbs,
  IconButton
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { areaService } from '../../services/areaService';
import { LoadingIndicator, ErrorDisplay } from '../ui/SharedUI';
import { useSnackbar } from '../../hooks/useSnackbar';

const NovoProcessoAreaSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const { showError } = useSnackbar();

  // Buscar áreas disponíveis
  const { 
    data: areas = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['areas'],
    queryFn: areaService.getAll
  });

  // Definir a primeira área como selecionada por padrão quando os dados carregam
  useEffect(() => {
    if (areas.length > 0 && !selectedAreaId) {
      setSelectedAreaId(areas[0].id);
    }
  }, [areas, selectedAreaId]);

  const handleContinue = () => {
    if (!selectedAreaId) {
      showError('Por favor, selecione uma área para continuar');
      return;
    }
    
    // Navegar para a página de seleção de tipo de processo
    navigate(`/areas/${selectedAreaId}/processo-tipo`);
  };

  return (
    <Box sx={{ p: 3, maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          Dashboard
        </RouterLink>
        <RouterLink to="/processos/todos" style={{ textDecoration: 'none', color: 'inherit' }}>
          Processos
        </RouterLink>
        <Typography color="text.primary">Novo Processo</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate('/processos/todos')} size="small" sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontSize: '1.8rem' }}>
          Criar Novo Processo
        </Typography>
      </Box>

      {isLoading ? (
        <LoadingIndicator />
      ) : isError ? (
        <ErrorDisplay error={error} onRetry={() => window.location.reload()} />
      ) : (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Selecione a área para o novo processo
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              Todo processo deve pertencer a uma área. Selecione a área onde o novo processo será criado.
            </Typography>

            <FormControl fullWidth required sx={{ mb: 3 }}>
              <InputLabel id="area-select-label">Área</InputLabel>
              <Select
                labelId="area-select-label"
                value={selectedAreaId}
                onChange={(e) => setSelectedAreaId(e.target.value as string)}
                label="Área *"
              >
                {areas.map((area) => (
                  <MenuItem key={area.id} value={area.id}>
                    {area.nome}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {areas.length === 0 
                  ? 'Nenhuma área disponível. Por favor, crie uma área primeiro.' 
                  : 'Selecione a área para o novo processo'}
              </FormHelperText>
            </FormControl>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/processos/todos')}
              >
                Cancelar
              </Button>
              <Button 
                variant="contained" 
                onClick={handleContinue}
                disabled={!selectedAreaId || areas.length === 0}
                endIcon={<ArrowForwardIcon />}
              >
                Continuar
              </Button>
            </Box>

            {areas.length === 0 && (
              <Paper sx={{ p: 2, mt: 3, bgcolor: 'info.light' }}>
                <Typography>
                  Não há áreas cadastradas. Por favor, 
                  <Button 
                    component={RouterLink}
                    to="/areas"
                    color="primary"
                    size="small"
                    sx={{ mx: 0.5 }}
                  >
                    cadastre uma área
                  </Button>
                  antes de criar um processo.
                </Typography>
              </Paper>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default NovoProcessoAreaSelectionPage;