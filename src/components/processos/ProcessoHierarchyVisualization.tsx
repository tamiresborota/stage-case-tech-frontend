import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid, 
  Tooltip, 
  IconButton, 
  Card, 
  CardHeader, 
  Divider, 
  FormHelperText,
  Paper,
  CircularProgress
} from '@mui/material';
import { 
  FitScreen as FitScreenIcon,
  Computer as ComputerIcon,
  Description as DescriptionIcon,
  AccountTree as AccountTreeIcon,
  CheckCircle as CheckCircleIcon,
  Autorenew as AutorenewIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  HighlightOff as HighlightOffIcon
} from '@mui/icons-material';
import ReactFlow, {
  Background, 
  Controls, 
  MiniMap,
  useNodesState, 
  useEdgesState,
  ReactFlowProvider,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useNavigate } from 'react-router-dom';
import { areaService } from '../../services/areaService';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useProcessoHierarquia } from '../../hooks/useProcessoQueries';
import { PageBreadcrumbs } from '../../components/ui/PageBreadcrumbs';


const mapProcessoStatus = (status) => { 
  const statusMap = {
    0: "Implementado",
    1: "EmImplementacao", 
    2: "Planejado", 
    3: "Problematico", 
    4: "Obsoleto"
  };
  
  // Se for undefined ou null, retorna o valor padrão
  if (status === undefined || status === null) return "Implementado";
  
  // Converter explicitamente para número se for uma string numérica
  if (typeof status === 'string') {
    const parsedStatus = parseInt(status, 10);
    if (!isNaN(parsedStatus) && parsedStatus.toString() === status.trim()) {
      status = parsedStatus;
    }
  }
  
  // Verificar se o status está no mapa
  if (statusMap[status] !== undefined) {
    return statusMap[status];
  }
  
  // Fallback para o valor padrão
  console.warn(`Status desconhecido: ${status}, usando valor padrão`);
  return "Implementado";
};

// Similar para mapProcessoTipo
const mapProcessoTipo = (tipo) => {  
  const tipoMap = {
    0: "Manual",
    1: "Sistemico"
  };
  
  if (tipo === undefined || tipo === null) return "Manual";
  
  if (typeof tipo === 'string') {
    const parsedTipo = parseInt(tipo, 10);
    if (!isNaN(parsedTipo) && parsedTipo.toString() === tipo.trim()) {
      tipo = parsedTipo;
    }
  }
  
  return tipoMap[tipo] !== undefined ? tipoMap[tipo] : "Manual";
};

// Função recursiva para mapear tipos e status apenas quando necessário
const mapHierarchyData = (processo) => {
  if (!processo) return null;
  
  // Verificar se o mapeamento é necessário
  const precisaMapearStatus = typeof processo.status === 'number';
  const precisaMapearTipo = typeof processo.tipo === 'number';
  
  const mapped = {
    ...processo,
    // Aplicar mapeamento apenas se for um número
    tipo: precisaMapearTipo ? mapProcessoTipo(processo.tipo) : processo.tipo,
    status: precisaMapearStatus ? mapProcessoStatus(processo.status) : processo.status
  };
  
  // Processar subprocessos somente se existirem
  if (processo.subProcessos && processo.subProcessos.length > 0) {
    mapped.subProcessos = processo.subProcessos.map(subProcesso => mapHierarchyData(subProcesso));
  }
  
  return mapped;
};



// Nó personalizado para processos
const ProcessoNode = ({ data }) => {
  const { nome, tipo, status, onNodeClick, id, areaNome } = data;
  
  const getStatusColor = (status) => {
    // Converter para string para garantir comparação correta
    status = String(status).trim();
    
    switch(status) {
      case 'Implementado': return '#4caf50';
      case 'EmImplementacao': return '#ff9800';
      case 'Planejado': return '#2196f3';
      case 'Problematico': return '#f44336';
      case 'Obsoleto': return '#9e9e9e';
      default: 
        console.warn(`Status desconhecido: "${status}"`);
        return '#9e9e9e';
    }
  };
  
  const getStatusIcon = (status) => {
    // Converter para string para garantir comparação correta
    status = String(status).trim();
    
    switch(status) {
      case 'Implementado': return <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />;
      case 'EmImplementacao': return <AutorenewIcon sx={{ fontSize: 16, color: '#ff9800' }} />;
      case 'Planejado': return <ScheduleIcon sx={{ fontSize: 16, color: '#2196f3' }} />;
      case 'Problematico': return <ErrorIcon sx={{ fontSize: 16, color: '#f44336' }} />;
      case 'Obsoleto': return <HighlightOffIcon sx={{ fontSize: 16, color: '#9e9e9e' }} />;
      default: 
        console.warn(`Status desconhecido para ícone: "${status}"`);
        return null;
    }
  };
  
  const getBgColor = (tipo) => {
    return tipo === 'Sistemico' ? '#e3f2fd' : '#f5f5f5';
  };
  
  const getBorderColor = (tipo) => {
    return tipo === 'Sistemico' ? '#1976d2' : '#9e9e9e';
  };
  
  const statusColor = getStatusColor(status);
  const bgColor = getBgColor(tipo);
  const borderColor = getBorderColor(tipo);
  const statusIcon = getStatusIcon(status);

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555', width: 8, height: 8 }}
        isConnectable={false}
      />
      
      <Paper
        elevation={2}
        sx={{
          width: 200,
          padding: 1.5,
          borderRadius: 1,
          border: `2px solid ${borderColor}`,
          backgroundColor: bgColor,
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'scale(1.03)',
            boxShadow: 3
          },
          // Garantir que os handles (pontos de conexão) sejam exibidos corretamente
          '& .react-flow__handle': {
            backgroundColor: borderColor,
            width: 8,
            height: 8
          }
        }}
        onClick={() => onNodeClick(id)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: '80%' }}>
            <Box 
              sx={{ 
                width: 10, 
                height: 10, 
                borderRadius: '50%', 
                bgcolor: statusColor, 
                mr: 1 
              }} 
            />
            <Tooltip 
              title={
                <Box sx={{ p: 0.5 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {nome}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: 'white' }}>
                    Status: {status}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: 'white' }}>
                    Tipo: {tipo}
                  </Typography>
                </Box>
              }
              placement="top"
              arrow
              enterDelay={500}
              leaveDelay={200}
            >
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600, 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {nome}
              </Typography>
            </Tooltip>
          </Box>
          {statusIcon}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
          {tipo === 'Sistemico' ? (
            <ComputerIcon sx={{ fontSize: 14, mr: 0.5, color: 'primary.main' }} />
          ) : (
            <DescriptionIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
          )}
          <Typography variant="caption" color="text.secondary">
            {tipo}
          </Typography>
        </Box>
      </Paper>
      
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#555', width: 8, height: 8 }}
        isConnectable={false}
      />
    </>
  );
};

// Tipos de nós personalizados para o ReactFlow
const nodeTypes = {
  processo: ProcessoNode
};

// Estilo para melhorar a animação das linhas pontilhadas
const globalStyles = `
  .react-flow__edge {
    z-index: 999 !important;
  }
  
  .react-flow__edge-path {
    stroke-width: 2px;
    stroke-dasharray: 5, 5;
  }
  
  .react-flow__edge.animated .react-flow__edge-path {
    animation: dashdraw 0.5s linear infinite;
  }
  
  @keyframes dashdraw {
    from {
      stroke-dashoffset: 10;
    }
    to {
      stroke-dashoffset: 0;
    }
  }
  
  .react-flow__handle {
    width: 10px !important;
    height: 10px !important;
    background: #555;
  }
`;

// Componente principal para a visualização hierárquica
const ProcessoHierarchyVisualization: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados para área e processo selecionados
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [processosPorArea, setProcessosPorArea] = useState([]);
  const [selectedProcessoId, setSelectedProcessoId] = useState("");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  const {
    data: processoHierarquia,
  } = useProcessoHierarquia(selectedProcessoId, {
    enabled: !!selectedProcessoId,
    onSuccess: (data) => {
      const hierarchyData = mapHierarchyData(data);
    },
    onError: (err) => {
      console.error("Erro ao buscar hierarquia do processo:", err);
      setError("Não foi possível carregar a hierarquia do processo selecionado.");
    }
  });
  
  const handleNodeClick = useCallback((id) => {
    navigate(`/processos/${id}/detalhe`);
  }, [navigate]);
  
  const buildFlowElements = useCallback((processo) => {
    if (!processo) return { nodes: [], edges: [] };
    
    const nodes = [];
    const edges = [];
    
    const processNode = (node, level = 0, position = 0, processoPaiId = null) => {
      const nodeId = node.id;
      const horizontalGap = 300;
      const verticalGap = 180;
      
      nodes.push({
        id: nodeId,
        type: 'processo',
        position: { x: position * horizontalGap, y: level * verticalGap },
        data: { 
          id: node.id,
          nome: node.nome,
          tipo: node.tipo,
          status: node.status,
          areaNome: node.areaNome,
          onNodeClick: handleNodeClick
        },
        style: {
          zIndex: 1000
        }
      });
      
      if (processoPaiId) {
        edges.push({
          id: `edge-${processoPaiId}-${nodeId}`,
          source: processoPaiId,
          target: nodeId,
          type: 'step',
          animated: true,
          sourceHandle: null,
          targetHandle: null,
          style: { 
            stroke: '#555',
            strokeWidth: 2,
            strokeDasharray: '5, 5'
          },
          markerEnd: {
            type: 'arrow',
            width: 20,
            height: 20,
            color: '#555'
          },
          zIndex: 1
        });
      }
      
      if (node.subProcessos && node.subProcessos.length > 0) {
        const childCount = node.subProcessos.length;
        const startOffset = -(childCount - 1) / 2;
        
        node.subProcessos.forEach((subprocesso, index) => {
          const subPosition = position + (startOffset + index) * 1.2;
          processNode(subprocesso, level + 1, subPosition, nodeId);
        });
      }
    };
    
    processNode(processo);
    
    return { nodes, edges };
  }, [handleNodeClick]);
  
  // Estabilizar função onLayout
  const onLayout = useCallback(() => {
    if (!processoHierarquia) return;
    
    const { nodes: layoutNodes, edges: layoutEdges } = buildFlowElements(processoHierarquia);
    
    setTimeout(() => {
      setNodes(layoutNodes);
      setEdges(layoutEdges);
    }, 50);
  }, [processoHierarquia, buildFlowElements]);
  
  // Handlers para alteração de área e processo
  const handleAreaChange = useCallback((areaId) => {
    setSelectedAreaId(areaId);
    setSelectedProcessoId(""); 
  }, []);
  
  const handleProcessoChange = useCallback((processoId) => {
    setSelectedProcessoId(processoId);
  }, []);
  
  // Carregar áreas ao inicializar o componente
  useEffect(() => {
    const fetchAreas = async () => {
      setLoading(true);
      try {
        const areas = await areaService.getAll();
        setAreas(areas);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar áreas:", err);
        setError("Não foi possível carregar as áreas. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAreas();
  }, []);
  
  // Carregar processos quando a área é selecionada
  useEffect(() => {
    if (!selectedAreaId) {
      setProcessosPorArea([]);
      return;
    }
    
    const fetchProcessos = async () => {
      setLoading(true);
      try {
        const processos = await areaService.getProcessos(selectedAreaId);
        setProcessosPorArea(processos);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar processos da área:", err);
        setError("Não foi possível carregar os processos desta área.");
        setProcessosPorArea([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProcessos();
  }, [selectedAreaId]);
  
  // Atualizar o fluxo quando a hierarquia é carregada
  useEffect(() => {
    if (processoHierarquia) {
      const { nodes, edges } = buildFlowElements(processoHierarquia);
      setNodes(nodes);
      setEdges(edges);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [processoHierarquia, buildFlowElements]);
  
  return (
    <Box sx={{ p: 3, maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Estilos globais */}
      <style>{globalStyles}</style>
      
      {/* Substituir breadcrumbs existente pelo componente reutilizável */}
      <PageBreadcrumbs 
        items={[
          { 
            label: 'Processos', 
            href: '/processos/todos',
            icon: <AccountTreeIcon fontSize="small" />
          },
          { label: 'Hierarquia' }
        ]} 
      />

      {/* Resto do componente permanece igual... */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="Visualização Hierárquica de Processos" 
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Centralizar visualização">
                <IconButton onClick={() => onLayout()} size="small" disabled={!processoHierarquia}>
                  <FitScreenIcon />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
        <Divider />
        
        {/* Mensagem de erro, se houver */}
        {error && (
          <Box sx={{ p: 2, bgcolor: '#ffebee', color: '#c62828' }}>
            <Typography>{error}</Typography>
          </Box>
        )}
        
        {/* Seletores em dois níveis */}
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            {/* Seletor de área */}
            <Grid item xs={12} md={6} lg={4}>
              <FormControl fullWidth size="small" disabled={loading}>
                <InputLabel id="area-select-label">Área</InputLabel>
                <Select
                  labelId="area-select-label"
                  value={selectedAreaId}
                  onChange={(e) => handleAreaChange(e.target.value)}
                  label="Área"
                >
                  {areas.map((area) => (
                    <MenuItem key={area.id} value={area.id}>
                      <Typography>{area.nome}</Typography>
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  Selecione primeiro a área dos processos
                </FormHelperText>
              </FormControl>
            </Grid>
            
            {/* Seletor de processo - disponível apenas quando área é selecionada */}
            <Grid item xs={12} md={6} lg={4}>
              <FormControl 
                fullWidth 
                size="small" 
                disabled={!selectedAreaId || loading}
              >
                <InputLabel id="processo-select-label">Processo Principal</InputLabel>
                <Select
                  labelId="processo-select-label"
                  value={selectedProcessoId}
                  onChange={(e) => handleProcessoChange(e.target.value)}
                  label="Processo Principal"
                >
                  {processosPorArea.map((processo) => (
                    <MenuItem key={processo.id} value={processo.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {processo.tipo === 'Sistemico' ? (
                        <ComputerIcon 
                        fontSize="small" 
                        sx={{ 
                          mr: 1, 
                          color: processo.processoPaiId === null ? 'secondary.light' : 'text.secondary' 
                        }} 
                        />
                      ) : (
                        <DescriptionIcon 
                        fontSize="small" 
                        sx={{ 
                          mr: 1, 
                          color: processo.processoPaiId === null ? 'secondary.light' : 'text.secondary' 
                        }} 
                        />
                      )}
                      <Typography>{processo.processoPaiId === null ? processo.nome  + ' (Processo Principal)': processo.nome }</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  Agora escolha o processo principal para visualização
                </FormHelperText>
              </FormControl>
            </Grid>
            
            {/* Legenda */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#4caf50', mr: 0.5 }} />
                  <Typography variant="caption">Implementado</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ff9800', mr: 0.5 }} />
                  <Typography variant="caption">Em Implementação</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#2196f3', mr: 0.5 }} />
                  <Typography variant="caption">Planejado</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#f44336', mr: 0.5 }} />
                  <Typography variant="caption">Problemático</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#9e9e9e', mr: 0.5 }} />
                  <Typography variant="caption">Obsoleto</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        {/* Estado de carregamento */}
        {loading && (
          <Box sx={{ height: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        )}
        
        {/* Mensagem de instrução quando nenhum processo é selecionado */}
        {!loading && (!selectedAreaId || !selectedProcessoId) ? (
          <Box sx={{ height: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary" variant="h6">
              {!selectedAreaId 
                ? "Selecione uma área para começar" 
                : "Agora selecione um processo principal"}
            </Typography>
          </Box>
        ) : null}
        
        {/* Área de visualização do fluxo */}
        {!loading && processoHierarquia && (
          <Box sx={{ height: 600 }}>
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.3 }}
                defaultEdgeOptions={{
                  type: 'step',
                  animated: true,
                  style: { 
                    strokeWidth: 2, 
                    strokeDasharray: '5, 5',
                    stroke: '#555'
                  }
                }}
                edgesFocusable={false}
                edgesUpdatable={false}
                elementsSelectable={false}
                deleteKeyCode={null}
                connectionLineStyle={{ 
                  stroke: '#555', 
                  strokeWidth: 2,
                  strokeDasharray: '5, 5'
                }}
                attributionPosition="bottom-left"
                zoomOnScroll={true}
                panOnScroll={true}
                minZoom={0.2}
                maxZoom={1.5}
              >
                <Controls />
                <MiniMap 
                  nodeStrokeColor={(n) => {
                    if (n.data?.status === 'Problematico') return '#f44336';
                    if (n.data?.tipo === 'Sistemico') return '#1976d2';
                    return '#555';
                  }}
                  nodeColor={(n) => {
                    if (n.data?.status === 'Implementado') return '#4caf50';
                    if (n.data?.status === 'EmImplementacao') return '#ff9800';
                    if (n.data?.status === 'Planejado') return '#2196f3';
                    if (n.data?.status === 'Problematico') return '#f44336';
                    if (n.data?.status === 'Obsoleto') return '#9e9e9e';
                    return '#eee';
                  }}
                  style={{
                    backgroundColor: '#f5f5f5',
                  }}
                />
                <Background color="#aaa" gap={16} variant="dots" />
              </ReactFlow>
            </ReactFlowProvider>
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default ProcessoHierarchyVisualization;