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
import { useProcessoDetalhes, useSubprocessos } from '../../hooks/useProcessoQueries';
import { PageBreadcrumbs } from '../../components/ui/PageBreadcrumbs';
import { useFreshData } from '../../hooks/useFreshData';

const SubprocessoListPage: React.FC = () => {
  const navigate = useNavigate();
  const { processoId } = useParams<{ processoId: string }>();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const { showSuccess, showError } = useSnackbar();
  
  const { 
    goToDetalheProcesso, 
    goToEditarProcesso, 
    goToSubprocessos, 
    goToNovoSubprocesso,
    goBackToProcessContext
  } = useProcessoNavigation();

  const { 
    data: processoPai, 
    isLoading: isLoadingProcessoPai,
  } = useProcessoDetalhes(processoId);

  const { 
    data: subprocessos = [], 
    isLoading: isLoadingSubprocessos, 
    isError, 
    error,
    refetch
  } = useSubprocessos(processoId);

  useFreshData(['processos', processoId, 'subprocessos'], refetch, '/subprocessos');

  const { mutation: deleteProcessoMutation } = useDeleteProcesso({
    queryInvalidation: ['processos', processoId, 'subprocessos'],
    onSuccessCallback: () => {
      setConfirmDelete(null);
      showSuccess('Subprocesso excluído com sucesso!');
    },
    onErrorCallback: (error) => {
      showError(`Erro ao excluir subprocesso: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  });

  // Filtra os subprocessos com base no termo de pesquisa
  const filteredSubprocessos = subprocessos.filter(
    sp => sp.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (id: string) => {
    setConfirmDelete(id);
  };

  const handleVoltar = () => {
    if (processoPai) {
      goBackToProcessContext(processoPai);
    } else {
      navigate('/areas');
    }
  };

  const isLoading = isLoadingProcessoPai || isLoadingSubprocessos;

  const handleConfirmDelete = () => {
    if (confirmDelete) {
      deleteProcessoMutation.mutate(confirmDelete);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <PageBreadcrumbs 
        items={[
          { label: 'Áreas', href: '/areas' },
          ...(processoPai?.areaId ? [
            { 
              label: 'Processos',
              href: `/areas/${processoPai.areaId}/processos` 
            }
          ] : []),
          ...(processoPai ? [
            { 
              label: `Subprocessos: ${processoPai.nome}` 
            }
          ] : [])
        ]} 
      />

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={handleVoltar} size="small" sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontSize: '1.8rem' }}>
          Subprocessos: {processoPai?.nome}
        </Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <TextField
          placeholder="Pesquisar subprocessos..."
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
          onClick={() => goToNovoSubprocesso(processoId)}
          size="large"
          sx={{ px: 3, py: 1 }}
        >
          Novo Subprocesso
        </Button>
      </Box>

      {isLoading ? (
        <LoadingIndicator />
      ) : isError ? (
        <ErrorDisplay 
          error={error} 
          onRetry={() => queryClient.invalidateQueries({ queryKey: ['processos', processoId, 'subprocessos'] })} 
        />
      ) : filteredSubprocessos.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">
            {searchTerm ? 'Nenhum subprocesso encontrado para esta pesquisa.' : 'Nenhum subprocesso cadastrado para este processo.'}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table size="medium">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Subprocesso</TableCell>
                <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Tipo</TableCell>
                <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell align="center" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubprocessos.map((subprocesso) => (
                <TableRow key={subprocesso.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ mr: 2 }}>
                        {subprocesso.tipo === 'Manual' ? (
                          <DescriptionIcon color="action" />
                        ) : (
                          <ComputerIcon color="primary" />
                        )}
                      </Box>
                      <Typography variant="body1">{subprocesso.nome}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell><TipoChip tipo={subprocesso.tipo} /></TableCell>
                  <TableCell><StatusChip status={subprocesso.status} /></TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Tooltip title="Ver subprocessos deste subprocesso">
                        <IconButton 
                          color="primary" 
                          onClick={() => goToSubprocessos(subprocesso.id)}
                          size="small"
                        >
                          <AccountTreeIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Ver detalhes">
                        <IconButton 
                          color="info" 
                          onClick={() => goToDetalheProcesso(subprocesso.id)}
                          size="small"
                        >
                          <DescriptionIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton 
                          color="primary" 
                          onClick={() => goToEditarProcesso(subprocesso.id)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteClick(subprocesso.id)}
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
        message="Tem certeza que deseja excluir este subprocesso? Esta ação não pode ser desfeita e removerá também todos os subprocessos associados a este."
        isLoading={deleteProcessoMutation.isPending}
      />
    </Box>
  );
};

export default SubprocessoListPage;