import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  InputAdornment,
  TextField,
  Breadcrumbs,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { LoadingIndicator, ErrorDisplay } from '../../components/ui/SharedUI';
import { useProcessoNavigation } from '../../hooks/useProcessoNavigation';
import { useDeleteProcesso } from '../../hooks/useProcessoMutations';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';
import { useSnackbar } from '../../hooks/useSnackbar';
import { ProcessoTable } from '../ui/ProcessoTable';
import { processoService } from '../../services/processoService';
import { areaService } from '../../services/areaService';
import { useFreshData } from '../../hooks/useFreshData';
import { useQueryInvalidation } from '../../hooks/useQueryInvalidation';

const TodosProcessosPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [areas, setAreas] = useState<any[]>([]);
  const [isLoadingAreas, setIsLoadingAreas] = useState(false);

  const { showSuccess, showError } = useSnackbar();
  
  const { 
    goToDetalheProcesso, 
    goToEditarProcesso, 
    goToSubprocessos,
    goToNovoProcesso
  } = useProcessoNavigation();

  const { 
    data: processos = [], 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['processos'],
    queryFn: processoService.getAll,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true
  });

  useFreshData(['processos'], refetch, '/processos/todos');

  useQueryInvalidation(['processos']);

  useEffect(() => {
    const fetchAreas = async () => {
      setIsLoadingAreas(true);
      try {
        const areasData = await areaService.getAll();
        setAreas(areasData);
      } catch (err) {
        console.error("Erro ao buscar áreas:", err);
        showError("Não foi possível carregar as áreas para o filtro.");
      } finally {
        setIsLoadingAreas(false);
      }
    };
    
    fetchAreas();
  }, [showError]);

  const { mutation: deleteProcessoMutation } = useDeleteProcesso({
    queryInvalidation: ['processos'],
    onSuccessCallback: () => {
      setConfirmDelete(null);
      showSuccess('Processo excluído com sucesso!');
    },
    onErrorCallback: (error) => {
      showError(`Erro ao excluir processo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  });

  // Filtra os processos com base no termo de pesquisa e área selecionada
  const filteredProcessos = processos.filter(processo => {
    const matchesSearchTerm = processo.nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesArea = selectedAreaId ? String(processo.areaId) === selectedAreaId : true;
    
    return matchesSearchTerm && matchesArea;
  });

  const handleDeleteClick = (id: string) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = () => {
    if (confirmDelete) {
      deleteProcessoMutation.mutate(confirmDelete);
    }
  };

  const handleAreaChange = (areaId: string) => {
    setSelectedAreaId(areaId);
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          Dashboard
        </RouterLink>
        <RouterLink to="/processos" style={{ textDecoration: 'none', color: 'inherit' }}>
          Processos
        </RouterLink>
        <Typography color="text.primary">Lista</Typography>
      </Breadcrumbs>

      <Typography variant="h4" sx={{ mb: 3, fontSize: '1.8rem' }}>
        Lista de Processos
      </Typography>


      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <TextField
            placeholder="Pesquisar processos..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small" disabled={isLoadingAreas}>
            <InputLabel id="area-select-label">Filtrar por Área</InputLabel>
            <Select
              labelId="area-select-label"
              value={selectedAreaId}
              onChange={(e) => handleAreaChange(e.target.value as string)}
              label="Filtrar por Área"
            >
              <MenuItem value="">
                <em>Todas as Áreas</em>
              </MenuItem>
              {areas.map((area) => (
                <MenuItem key={area.id} value={area.id}>
                  {area.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => goToNovoProcesso()}
            size="large"
          >
            Novo Processo
          </Button>
        </Grid>
      </Grid>

      {isLoading || isLoadingAreas ? (
        <LoadingIndicator />
      ) : isError ? (
        <ErrorDisplay error={error} onRetry={() => queryClient.invalidateQueries({ queryKey: ['processos'] })} />
      ) : filteredProcessos.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">
            {searchTerm || selectedAreaId 
              ? 'Nenhum processo encontrado para os filtros selecionados.' 
              : 'Nenhum processo cadastrado.'}
          </Typography>
        </Paper>
      ) : (
        <ProcessoTable 
          processos={filteredProcessos} 
          onDeleteClick={handleDeleteClick} 
          onDetalheClick={goToDetalheProcesso} 
          onEditarClick={goToEditarProcesso} 
          onSubprocessosClick={goToSubprocessos}
          showArea={true} 
        />
      )}

      <ConfirmDeleteDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleConfirmDelete}
        message="Tem certeza que deseja excluir este processo? Esta ação não pode ser desfeita e removerá também todos os subprocessos associados."
        isLoading={deleteProcessoMutation.isPending}
      />
    </Box>
  );
};

export default TodosProcessosPage;