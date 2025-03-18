import React, { useEffect } from 'react';
import { 
  Box, Typography, IconButton, CircularProgress, Breadcrumbs
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate, useParams, Link as RouterLink, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { processoService } from '../../services/processoService';
import { areaService } from '../../services/areaService';
import { TipoProcesso, StatusProcesso } from '../../types/enums';
import { useCreateProcesso, useUpdateProcesso } from '../../hooks/useProcessoMutations';
import { ErrorDisplay } from '../../components/ui/SharedUI';
import { useSnackbar } from '../../hooks/useSnackbar';
import { ProcessoForm, ProcessoFormData } from './ProcessoForm';

const ProcessoFormPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const params = useParams();
  const areaId = params.areaId;
  const processoId = pathname.includes('/subprocessos/novo') ? null : params.processoId;
  const processoPaiId = pathname.includes('/subprocessos/novo') ? params.processoId : null;
  
  // Determine os modos corretamente
  const isSubprocessRoute = pathname.includes('/subprocessos/novo');
  const isEditMode = !!processoId && !isSubprocessRoute;
  const isSubprocessoMode = isSubprocessRoute && !!processoPaiId;
  
  const { showSuccess, showError } = useSnackbar();
  
  const { data: areas = [] } = useQuery({
    queryKey: ['areas'],
    queryFn: areaService.getAll
  });
  
  const { data: processoPai } = useQuery({
    queryKey: ['processo', processoPaiId],
    queryFn: () => processoPaiId ? processoService.getById(processoPaiId) : Promise.reject('ID do processo pai não fornecido'),
    enabled: !!processoPaiId
  });

  const { 
    data: processoExistente, 
    isLoading: isLoadingProcesso,
    error: processoError 
  } = useQuery({
    queryKey: ['processo', processoId],
    queryFn: () => processoId ? processoService.getById(processoId) : Promise.reject('ID do processo não fornecido'),
    enabled: isEditMode
  });

  const {
    data: processoDetalhes,
    isLoading: isLoadingDetalhes,
    error: detalhesError
  } = useQuery({
    queryKey: ['processo', processoId, 'detalhes'],
    queryFn: () => processoId ? processoService.getDetalhes(processoId) : Promise.reject('ID do processo não fornecido'),
    enabled: !!processoId,
    onSuccess: (data) => console.log("Detalhes carregados com sucesso:", data),
    onError: (error) => console.error("Erro ao carregar detalhes:", error)
  });

  const { 
    data: areaAtual
  } = useQuery({
    queryKey: ['area', areaId],
    queryFn: () => areaId ? areaService.getById(areaId) : Promise.reject('ID da área não fornecido'),
    enabled: !!areaId && !isSubprocessoMode
  });

  const { mutation: createProcessoMutation } = useCreateProcesso({
    onSuccessCallback: (data) => {
      showSuccess('Processo criado com sucesso!');
      if (isSubprocessoMode && processoPaiId) {
        navigate(`/processos/${processoPaiId}/subprocessos`);
      } else if (data.areaId) {
        navigate(`/areas/${data.areaId}/processos`);
      } else {
        navigate('/processos/todos');
      }
    },
    onErrorCallback: (error) => {
      showError(`Erro ao criar processo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  });
  
  const { mutation: updateProcessoMutation } = useUpdateProcesso({
    onSuccessCallback: (data) => {
      showSuccess('Processo atualizado com sucesso!');
      if (data.processoPaiId || data.processoPaiId) {
        const processoPaiId = data.processoPaiId || data.processoPaiId;
        navigate(`/processos/${processoPaiId}/subprocessos`);
      } else if (data.areaId) {
        navigate(`/areas/${data.areaId}/processos`);
      } else {
        navigate('/processos/todos');
      }
    },
    onErrorCallback: (error) => {
      showError(`Erro ao atualizar processo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  });

  const prepareInitialData = (): ProcessoFormData | undefined => {
    if (isEditMode && processoExistente && processoDetalhes) {
      return {
        nome: processoExistente.nome,
        descricao: processoExistente.descricao,
        tipo: processoExistente.tipo,
        status: processoExistente.status,
        areaId: processoExistente.areaId,
        processoPaiId: processoExistente.processoPaiId,
        responsaveis: processoDetalhes.responsaveis?.map(r => r.nome).join(', ') || '',
        ferramentas: processoDetalhes.ferramentas?.map(f => f.nome).join(', ') || '',
        documentos: processoDetalhes.documentos?.map(d => d.nome).join(', ') || ''
      };
    } else if (isSubprocessoMode && processoPai) {
      return {
        nome: '',
        descricao: '',
        tipo: TipoProcesso.Manual,
        status: StatusProcesso.Planejado,
        areaId: processoPai.areaId,
        processoPaiId: processoPaiId,
        responsaveis: '',
        ferramentas: '',
        documentos: ''
      };
    } else if (areaId) {
      return {
        nome: '',
        descricao: '',
        tipo: TipoProcesso.Manual,
        status: StatusProcesso.Planejado,
        areaId: areaId,
        processoPaiId: null,
        responsaveis: '',
        ferramentas: '',
        documentos: ''
      };
    }
    return undefined;
  };

  const handleSubmit = (data: ProcessoFormData) => {
    
    if (isEditMode && processoId) {
      const updateData: Partial<Processo> = {
        id: processoId,
        nome: data.nome,
        descricao: data.descricao,
        tipo: data.tipo,
        status: data.status,
        areaId: data.areaId,
        processoPaiId: data.processoPaiId,
        responsaveis: data.responsaveis.split(',').map(r => r.trim()),
        ferramentas: data.ferramentas.split(',').map(s => s.trim()),
        documentos: data.documentos.split(',').map(d => d.trim())
      };
          
      if (!updateData.nome || !updateData.descricao || !updateData.tipo || !updateData.status) {
        console.error('Dados incompletos para atualização:', updateData);
        showError('Dados incompletos para atualização.');
        return;
      }
    
      updateProcessoMutation.mutate(updateData);
    } else {
      const baseData = {
        nome: data.nome,
        descricao: data.descricao,
        tipo: data.tipo,
        status: data.status,
        responsaveis: data.responsaveis?.split(',').map(r => r.trim()) || [],
        ferramentas: data.ferramentas?.split(',').map(s => s.trim()) || [],
        documentos: data.documentos?.split(',').map(d => d.trim()) || []
      };
      
      if (isSubprocessoMode && processoPaiId) {
        if (processoPai) {
          const subprocessoData = {
            ...baseData,
            areaId: processoPai.areaId,
            processoPaiId: processoPaiId
          };
          
          createProcessoMutation.mutate(subprocessoData);
        } else {
          processoService.getById(processoPaiId)
            .then(pai => {
              const subprocessoData = {
                ...baseData,
                areaId: pai.areaId,
                processoPaiId: processoPaiId
              };
              
              createProcessoMutation.mutate(subprocessoData);
            })
            .catch(error => {
              console.error('Erro ao buscar processo pai:', error);
              showError('Não foi possível obter informações do processo pai');
            });
        }
      } else if (areaId) {
        const processoData = {
          ...baseData,
          areaId: areaId,
          processoPaiId: null
        };
        
        createProcessoMutation.mutate(processoData);
      } else {
        showError('Dados insuficientes: não foi possível determinar a área ou processo pai');
      }
    }
  };

  const handleCancel = () => {
    if (isSubprocessoMode && processoPaiId) {
      navigate(`/processos/${processoPaiId}/subprocessos`);
    } else if (areaId) {
      navigate(`/areas/${areaId}/processos`);
    } else if (processoExistente?.processoPaiId) {
      navigate(`/processos/${processoExistente.processoPaiId}/subprocessos`);
    } else if (processoExistente?.areaId) {
      navigate(`/areas/${processoExistente.areaId}/processos`);
    } else {
      navigate('/areas');
    }
  };

  const getPageTitle = () => {
    if (isEditMode) {
      return 'Editar Processo';
    } else if (isSubprocessoMode) {
      return 'Novo Subprocesso';
    } else {
      return 'Novo Processo';
    }
  };

  const getBreadcrumbText = () => {
    if (isEditMode && processoExistente) {
      return processoExistente.nome;
    } else if (isSubprocessoMode && processoPai) {
      return `Novo Subprocesso de ${processoPai.nome}`;
    } else {
      return isEditMode ? 'Editar' : 'Novo Processo';
    }
  };

  const getBackRoute = () => {
    if (isSubprocessoMode && processoPaiId) {
      return `/processos/${processoPaiId}/subprocessos`;
    } else if (areaId) {
      return `/areas/${areaId}/processos`;
    } else if (processoExistente?.processoPaiId) {
      return `/processos/${processoExistente.processoPaiId}/subprocessos`;
    } else if (processoExistente?.areaId) {
      return `/areas/${processoExistente.areaId}/processos`;
    } else {
      return '/areas';
    }
  };

  const getOriginName = () => {
    if (isSubprocessoMode && processoPai) {
      return processoPai.nome;
    } else if (areaAtual) {
      return areaAtual.nome;
    } else if (processoExistente?.processoPaiId) {
      return 'Processo Pai';
    } else {
      return '';
    }
  };

  const isLoading = isEditMode && (isLoadingProcesso || isLoadingDetalhes);
  const initialData = prepareInitialData();

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          Dashboard
        </RouterLink>
        <RouterLink to="/areas" style={{ textDecoration: 'none', color: 'inherit' }}>
          Áreas
        </RouterLink>
        {areaId && (
          <RouterLink to={`/areas/${areaId}/processos`} style={{ textDecoration: 'none', color: 'inherit' }}>
            {areaAtual?.nome || 'Área'}
          </RouterLink>
        )}
        {isSubprocessoMode && processoPaiId && (
          <RouterLink to={`/processos/${processoPaiId}/subprocessos`} style={{ textDecoration: 'none', color: 'inherit' }}>
            {processoPai?.nome || 'Processo Pai'}
          </RouterLink>
        )}
        <Typography color="text.primary">{getBreadcrumbText()}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate(getBackRoute())} size="small" sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontSize: '1.8rem' }}>
          {getPageTitle()}
          {getOriginName() && (
            <Typography component="span" variant="subtitle1" sx={{ ml: 1, fontSize: '1rem' }}>
              {isSubprocessoMode ? `(Subprocesso de ${getOriginName()})` : `(Área: ${getOriginName()})`}
            </Typography>
          )}
        </Typography>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : processoError || detalhesError ? (
        <ErrorDisplay 
          error={processoError || detalhesError} 
          onRetry={() => window.location.reload()} 
        />
      ) : (
        <ProcessoForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={createProcessoMutation.isPending || updateProcessoMutation.isPending}
          isEditing={isEditMode}
        />
      )}
    </Box>
  );
};

export default ProcessoFormPage;