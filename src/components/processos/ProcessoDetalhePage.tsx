import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import {
  Box, Typography, Grid, Card, CardHeader, CardContent,
  Divider, Button, List, ListItem, ListItemIcon, ListItemText,
  IconButton, Tooltip
} from '@mui/material';
import {
  Edit as EditIcon, Delete as DeleteIcon, Description as DescriptionIcon,
  Person as PersonIcon, Build as BuildIcon,
  Add as AddIcon, ArrowBack as ArrowBackIcon, AccountTree as AccountTreeIcon
} from '@mui/icons-material';
import { LoadingIndicator, ErrorDisplay } from '../../components/ui/SharedUI';
import { useProcessoNavigation } from '../../hooks/useProcessoNavigation';
import { useDeleteProcesso } from '../../hooks/useProcessoMutations';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';
import { useSnackbar } from '../../hooks/useSnackbar';
import { 
  useProcessoDetalhes, 
  useProcessoDetalhesCompletos
} from '../../hooks/useProcessoQueries';
import { PageBreadcrumbs } from '../../components/ui/PageBreadcrumbs';
import { processoService } from '../../services/processoService';
import { StatusChip } from '../../components/ui/StatusChip';
import { TipoChip } from '../../components/ui/TipoChip';
import { StatusProcesso, TipoProcesso } from '../../types/enums';
import { ProcessoHierarquia } from '../../types/processo';

// Componente para exibir a árvore de subprocessos de forma recursiva
const SubprocessoTree = ({ 
  processo, 
  level = 0, 
  onViewProcesso 
}: { 
  processo: ProcessoHierarquia, 
  level?: number,
  onViewProcesso: (id: string) => void
}) => {
  return (
    <Box sx={{ pl: level * 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 1,
          my: 0.5,
          bgcolor: level === 0 ? 'primary.light' : 'background.paper',
          color: level === 0 ? 'white' : 'inherit',
          borderRadius: 1,
          border: '1px solid',
          borderColor: level === 0 ? 'primary.main' : 'divider',
          ...(level > 0 && { cursor: 'pointer' })
        }}
        onClick={() => level > 0 && onViewProcesso(processo.id)}
      >
        <Typography variant="body1" fontWeight={level === 0 ? 'bold' : 'normal'}>
          {processo.nome}
        </Typography>
        <StatusChip 
          status={processo.status as StatusProcesso} 
          sx={{ ml: 'auto', mr: 1 }}
        />
      </Box>

      {processo.subProcessos && processo.subProcessos.length > 0 && (
        <Box>
          {processo.subProcessos.map((subp) => (
            <SubprocessoTree
              key={subp.id}
              processo={subp}
              level={level + 1}
              onViewProcesso={onViewProcesso}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

const ProcessoDetalhePage = () => {
  const { processoId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { showSuccess, showError } = useSnackbar();
  
  const { 
    goToEditarProcesso, 
    goToSubprocessos, 
    goToNovoSubprocesso,
    goToDetalheProcesso,
    goBack
  } = useProcessoNavigation();

  // Consulta para obter a hierarquia completa do processo
  const {
    data: hierarquia,
    isLoading: isLoadingHierarquia,
    isError: isErrorHierarquia,
    error: hierarquiaError,
    refetch: refetchHierarquia
  } = useQuery({
    queryKey: ['processo', processoId, 'hierarquia'],
    queryFn: () => processoService.getHierarquia(processoId),
    enabled: !!processoId,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  const { 
    data: processo,
    isLoading: isLoadingProcesso,
    isError: isErrorProcesso,
    error: processoError
  } = useProcessoDetalhes(processoId);
  
  const {
    data: detalhes,
    isLoading: isLoadingDetalhes,
    isError: isErrorDetalhes,
    error: detalhesError
  } = useProcessoDetalhesCompletos(processoId, {
    defaultData: { responsaveis: [], ferramentas: [], documentos: [] }
  });
  
  
  const processoPaiId = processo?.processoPaiId;
  const { 
    data: processoPai 
  } = useProcessoDetalhes(processoPaiId, {
    enabled: !!processoPaiId
  });

  // Versão com processo pai incluído
  const processoCompleto = processo ? {
    ...processo,
    processoPai: processoPai
  } : null;

  const { mutation: deleteProcessoMutation } = useDeleteProcesso({
    queryInvalidation: ['processos', 'processo'],
    onSuccessCallback: () => {
      // Navegar para a lista de processos após exclusão
      if (processo?.areaId) {
        navigate(`/areas/${processo.areaId}/processos`);
      } else {
        navigate('/processos/todos');
      }
      showSuccess('Processo excluído com sucesso!');
    },
    onErrorCallback: (error) => {
      showError(`Erro ao excluir processo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  });

  const isLoading = isLoadingProcesso || isLoadingDetalhes || isLoadingHierarquia;
  const isError = isErrorProcesso || isErrorDetalhes || isErrorHierarquia;
  const error = processoError || detalhesError || hierarquiaError;

  const handleDeleteClick = () => {
    setConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    if (processoId) {
      deleteProcessoMutation.mutate(processoId);
    }
    setConfirmDelete(false);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);
  };

  const handleVerSubprocessos = () => {
    goToSubprocessos(processoId);
  };

  // Função para navegar ao detalhe de um subprocesso
  const handleViewProcesso = (id: string) => {
    // Invalidar o cache para o novo processo antes de navegar
    queryClient.invalidateQueries({ queryKey: ['processo', id] });
    queryClient.invalidateQueries({ queryKey: ['processo', id, 'hierarquia'] });
    
    goToDetalheProcesso(id);
  };

  // Efeito para forçar a atualização dos dados quando o ID do processo mudar
  useEffect(() => {
    if (processoId) {
      // Invalidar e recarregar todas as consultas relacionadas a este processo
      queryClient.invalidateQueries({ queryKey: ['processo', processoId] });
      
      refetchHierarquia();
    }
  }, [processoId, queryClient, refetchHierarquia]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (isError || !processo || !detalhes || !hierarquia) {
    return (
      <Box p={3}>
        <ErrorDisplay 
          error={error} 
          onRetry={() => {
            queryClient.invalidateQueries({ queryKey: ['processo', processoId] });
            queryClient.invalidateQueries({ queryKey: ['processo', processoId, 'detalhes'] });
            queryClient.invalidateQueries({ queryKey: ['processo', processoId, 'hierarquia'] });
          }} 
        />
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={goBack}
          sx={{ mt: 2 }}
        >
          Voltar
        </Button>
      </Box>
    );
  }

  // Renderização principal
  return (
    <Box sx={{ p: 3, maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <PageBreadcrumbs 
        items={[
          { label: 'Áreas', href: '/areas' },
          { 
            label: 'Processos', 
            href: `/areas/${processo.areaId}/processos` 
          },
          ...(processo.processoPaiId && processoCompleto?.processoPai ? [
            { 
              label: processoCompleto.processoPai.nome || 'Processo Pai',
              href: `/processos/${processo.processoPaiId}/subprocessos`
            }
          ] : []),
          ...(processo.processoPaiId && processoCompleto?.processoPai ? [
            { 
              label: processoCompleto.processoPai.nome || 'Processo Pai',
              href: `/processos/${processo.processoPaiId}/detalhe`
            }
          ] : []),
          { label: processo.nome }
        ]} 
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" component="h1">{processo.nome}</Typography>
        <Box>
          <Tooltip title="Editar Processo">
            <IconButton
              color="primary"
              onClick={(e) => { e.stopPropagation(); goToEditarProcesso(processoId)}}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir Processo">
            <IconButton
              color="error"
              onClick={(e) => { e.stopPropagation(); handleDeleteClick(); }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Informações Básicas */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader title="Informações Básicas" />
            <Divider />
            <CardContent>
              <Typography variant="body1" gutterBottom>
                <strong>Descrição:</strong> {processo.descricao || 'Não informada'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="subtitle2">Status:</Typography> 
                  {/* Usando StatusChip */}
                  <StatusChip status={processo.status as StatusProcesso} />
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="subtitle2">Tipo:</Typography>
                  <TipoChip 
                    tipo={processo.tipo as TipoProcesso} 
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Responsáveis */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader title="Responsáveis" />
            <Divider />
            <CardContent>
              <List dense>
                {detalhes.responsaveis && detalhes.responsaveis.length > 0 ? (
                  detalhes.responsaveis.map((responsavel) => (
                    <ListItem key={responsavel.id}>
                      <ListItemIcon>
                        <PersonIcon />
                      </ListItemIcon>
                      <ListItemText primary={responsavel.nome} />
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nenhum responsável cadastrado
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Ferramentas */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader title="Ferramentas e Sistemas" />
            <Divider />
            <CardContent>
              <List dense>
                {detalhes.ferramentas && detalhes.ferramentas.length > 0 ? (
                  detalhes.ferramentas.map((ferramenta) => (
                    <ListItem key={ferramenta.id}>
                      <ListItemIcon>
                        <BuildIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={ferramenta.nome}
                        secondary={ferramenta.descricao}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nenhuma ferramenta cadastrada
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Documentação */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardHeader title="Documentação" />
            <Divider />
            <CardContent>
              <List dense>
                {detalhes.documentos && detalhes.documentos.length > 0 ? (
                  detalhes.documentos.map((documento) => (
                    <ListItem key={documento.id}>
                      <ListItemIcon>
                        <DescriptionIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={documento.nome}
                        secondary={documento.descricao}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Nenhuma documentação cadastrada
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Estrutura de Subprocessos */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardHeader
              title="Estrutura Hierárquica"
              action={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Adicionar subprocesso">
                    <IconButton 
                      color="primary"
                      onClick={() => goToNovoSubprocesso(processoId)}
                    >
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Ver subprocessos">
                    <IconButton 
                      onClick={handleVerSubprocessos}
                    >
                      <AccountTreeIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            />
            <Divider />
            <CardContent>
              {hierarquia && (
                <Box sx={{ mt: 2 }}>
                  <SubprocessoTree
                    processo={hierarquia}
                    onViewProcesso={handleViewProcesso}
                  />
                </Box>
              )}

              {/* Mensagem quando não há subprocessos */}
              {(!hierarquia.subProcessos || hierarquia.subProcessos.length === 0) && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Este processo não possui subprocessos
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => goToNovoSubprocesso(processoId)}
                    sx={{ mt: 1 }}
                    size="small"
                  >
                    Adicionar Subprocesso
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ConfirmDeleteDialog
        open={confirmDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        message="Tem certeza que deseja excluir este processo? Esta ação não pode ser desfeita e todos os subprocessos serão excluídos também."
        isLoading={deleteProcessoMutation.isPending}
      />
    </Box>
  );
};

export default ProcessoDetalhePage;