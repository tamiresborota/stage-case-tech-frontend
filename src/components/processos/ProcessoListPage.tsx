import React, { useState } from 'react';
import { 
  Box, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, InputAdornment, Tooltip, TextField
} from '@mui/material';
import { 
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon,
  Computer as ComputerIcon, Description as DescriptionIcon, ArrowBack as ArrowBackIcon,
  AccountTree as AccountTreeIcon
} from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingIndicator, ErrorDisplay } from '../../components/ui/SharedUI';
import { useProcessoNavigation } from '../../hooks/useProcessoNavigation';
import { useDeleteProcesso } from '../../hooks/useProcessoMutations';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';
import { StatusChip } from '../ui/StatusChip';
import { TipoChip } from '../ui/TipoChip';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useProcessosPorArea } from '../../hooks/useProcessoQueries'; 
import { useQuery } from '@tanstack/react-query';
import { areaService } from '../../services/areaService';
import { PageBreadcrumbs } from '../../components/ui/PageBreadcrumbs';
import { useFreshData } from '../../hooks/useFreshData';

const ProcessoListPage: React.FC = () => {
  const navigate = useNavigate();
  const { areaId } = useParams<{ areaId: string }>();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  const { 
    goToDetalheProcesso, 
    goToEditarProcesso, 
    goToSubprocessos, 
    goToNovoProcesso 
  } = useProcessoNavigation();

  const { showSuccess, showError } = useSnackbar();

  // Consulta para buscar área atual
  const { 
    data: area, 
    isLoading: isLoadingArea, 
  } = useQuery({
    queryKey: ['area', areaId],
    queryFn: () => areaId ? areaService.getById(areaId) : Promise.reject('ID da área não fornecido'),
    enabled: !!areaId
  });

  const { 
    data: processos = [], 
    isLoading: isLoadingProcessos, 
    isError, 
    error,
    refetch 
  } = useProcessosPorArea(areaId);

  useFreshData(['processos', areaId], refetch, '/areas');

  const { 
    mutation: deleteProcessoMutation, 
  } = useDeleteProcesso({
    queryInvalidation: ['processos', areaId],
    onSuccessCallback: () => {
      setConfirmDelete(null);
      showSuccess('Processo excluído com sucesso!');
    },
    onErrorCallback: (error) => {
      showError(`Erro ao excluir processo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  });

  // Filtra os processos com base no termo de pesquisa
  const filteredProcessos = processos.filter(
    processo => processo.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (id: string) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = () => {
    if (confirmDelete) {
      deleteProcessoMutation.mutate(confirmDelete);
    }
  };

  const isLoading = isLoadingArea || isLoadingProcessos;

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <PageBreadcrumbs 
        items={[
          { label: 'Áreas', href: '/areas' },
          { label: area?.nome || 'Processos' }
        ]} 
      />

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate('/areas')} size="small" sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontSize: '1.8rem' }}>
          Processos: {area?.nome}
        </Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <TextField
          placeholder="Pesquisar processos..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 400 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => goToNovoProcesso(areaId)}
          size="large"
          sx={{ px: 3, py: 1 }}
        >
          Novo Processo
        </Button>
      </Box>

      {isLoading ? (
        <LoadingIndicator />
      ) : isError ? (
        <ErrorDisplay error={error} onRetry={() => queryClient.invalidateQueries({ queryKey: ['processos', areaId] })} />
      ) : filteredProcessos.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">
            {searchTerm ? 'Nenhum processo encontrado para esta pesquisa.' : 'Nenhum processo cadastrado para esta área.'}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table size="medium">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Processo</TableCell>
                <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Tipo</TableCell>
                <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell align="center" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProcessos.map((processo) => (
                <TableRow 
                  key={processo.id} 
                  hover 
                  onClick={() => {
                    if (processo && processo.id) {
                      goToDetalheProcesso(processo.id);
                    }
                  }}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } 
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ mr: 2 }}>
                        {processo.tipo === 'Manual' ? (
                          <DescriptionIcon color="action" />
                        ) : (
                          <ComputerIcon color="primary" />
                        )}
                      </Box>
                      <Typography variant="body1">{processo.nome}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell><TipoChip tipo={processo.tipo} /></TableCell>
                  <TableCell><StatusChip status={processo.status} /></TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Tooltip title="Ver subprocessos">
                        <IconButton 
                          color="primary" 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (processo && processo.id) {
                              goToSubprocessos(String(processo.id));
                            } else {
                              console.error("ID de processo não encontrado ou inválido:", processo);
                            }
                          }}
                          size="small"
                        >
                          <AccountTreeIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Ver detalhes">
                        <IconButton 
                          color="info" 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (processo && processo.id) {
                              goToDetalheProcesso(processo.id);
                            }
                          }}
                          size="small"
                        >
                          <DescriptionIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton 
                          color="primary" 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (processo && processo.id) {
                              goToEditarProcesso(processo.id);
                            }
                          }}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton 
                          color="error" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(processo.id);
                          }}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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

export default ProcessoListPage;