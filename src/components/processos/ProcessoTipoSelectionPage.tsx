import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Card, 
  CardContent,
  Breadcrumbs,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Alert
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link as RouterLink, useParams, useLocation } from 'react-router-dom';
import { processoService } from '../../services/processoService';
import { LoadingIndicator, ErrorDisplay } from '../ui/SharedUI';
import { useSnackbar } from '../../hooks/useSnackbar';

const ProcessoTipoSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { areaId } = useParams<{ areaId: string }>();
  const { showError } = useSnackbar();
  
  // Estado para controlar a seleção entre processo principal ou subprocesso
  const [tipoProcesso, setTipoProcesso] = useState<'principal' | 'subprocesso'>('principal');
  const [selectedprocessoPaiId, setSelectedprocessoPaiId] = useState<string>('');

  // Verificar se recebeu o areaId
  if (!areaId) {
    navigate('/processos/novo');
    showError('É necessário selecionar uma área primeiro');
  }

  // Buscar processos da área para possível seleção de pai
  const { 
    data: processosArea = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['processos', 'area', areaId],
    queryFn: () => processoService.getByArea(areaId!),
    enabled: !!areaId
  });

  // Limpar a seleção de processo pai se o tipo mudar para principal
  useEffect(() => {
    if (tipoProcesso === 'principal') {
      setSelectedprocessoPaiId('');
    } else if (processosArea.length > 0 && !selectedprocessoPaiId) {
      setSelectedprocessoPaiId(processosArea[0].id);
    }
  }, [tipoProcesso, processosArea, selectedprocessoPaiId]);

  const handleContinue = () => {
    if (tipoProcesso === 'subprocesso' && !selectedprocessoPaiId) {
      showError('Por favor, selecione um processo pai para continuar');
      return;
    }
    
    if (tipoProcesso === 'principal') {
      navigate(`/areas/${areaId}/processos/novo`);
    } else {
      navigate(`/processos/${selectedprocessoPaiId}/subprocessos/novo`);
    }
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
        <RouterLink to="/processos/novo" style={{ textDecoration: 'none', color: 'inherit' }}>
          Novo Processo
        </RouterLink>
        <Typography color="text.primary">Tipo de Processo</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate('/processos/novo')} size="small" sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontSize: '1.8rem' }}>
          Configurar Hierarquia
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
              Escolha o tipo de processo
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              Você pode criar um processo principal (independente) ou um subprocesso vinculado a um processo existente.
            </Typography>

            <RadioGroup
              value={tipoProcesso}
              onChange={(e) => setTipoProcesso(e.target.value as 'principal' | 'subprocesso')}
              sx={{ mb: 3 }}
            >
              <FormControlLabel 
                value="principal" 
                control={<Radio />} 
                label="Processo Principal" 
              />
              <FormControlLabel 
                value="subprocesso" 
                control={<Radio />} 
                label="Subprocesso (vinculado a um processo pai)" 
              />
            </RadioGroup>

            <Divider sx={{ my: 2 }} />

            {tipoProcesso === 'subprocesso' && (
              <>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Selecione o processo pai
                </Typography>

                {processosArea.length === 0 ? (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Não há processos nesta área. Crie um processo principal primeiro.
                  </Alert>
                ) : (
                  <FormControl fullWidth required sx={{ mb: 3 }}>
                    <InputLabel id="parent-process-select-label">Processo Pai</InputLabel>
                    <Select
                      labelId="parent-process-select-label"
                      value={selectedprocessoPaiId}
                      onChange={(e) => setSelectedprocessoPaiId(e.target.value as string)}
                      label="Processo Pai *"
                      disabled={processosArea.length === 0}
                    >
                      {processosArea.map((processo) => (
                        <MenuItem key={processo.id} value={processo.id}>
                          {processo.nome}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      O subprocesso será vinculado ao processo selecionado
                    </FormHelperText>
                  </FormControl>
                )}
              </>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/processos/novo')}
              >
                Voltar
              </Button>
              <Button 
                variant="contained" 
                onClick={handleContinue}
                disabled={tipoProcesso === 'subprocesso' && (processosArea.length === 0 || !selectedprocessoPaiId)}
                endIcon={<ArrowForwardIcon />}
              >
                Continuar
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ProcessoTipoSelectionPage;