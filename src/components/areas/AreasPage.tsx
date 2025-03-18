import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Avatar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Folder as FolderIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoadingIndicator, ErrorDisplay } from '../../components/ui/SharedUI';
import { ConfirmDeleteDialog } from '../../components/ui/ConfirmDeleteDialog';
import { useSnackbar } from '../../hooks/useSnackbar';
import { areaService } from '../../services/areaService';
import { Area, AreaInput } from '../../types/area';

const AreasPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<AreaInput>({
    nome: ''
  });
  const { showSuccess, showError } = useSnackbar();

  // Consulta para buscar áreas
  const { 
    data: areas = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['areas'],
    queryFn: areaService.getAll
  });

  // Mutação para criar uma área
  const createAreaMutation = useMutation({
    mutationFn: areaService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      handleCloseDialog();
      showSuccess('Área criada com sucesso!');
    },
    onError: (error) => {
      showError(`Erro ao criar área: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  });

  // Mutação para atualizar uma área
  const updateAreaMutation = useMutation({
    mutationFn: (data: Area) => areaService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      handleCloseDialog();
      showSuccess('Área atualizada com sucesso!');
    },
    onError: (error) => {
      showError(`Erro ao atualizar área: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  });

  // Mutação para deletar uma área
  const deleteAreaMutation = useMutation({
    mutationFn: (id: string) => areaService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      setConfirmDelete(null);
      showSuccess('Área excluída com sucesso!');
    },
    onError: (error) => {
      showError(`Erro ao excluir área: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setConfirmDelete(null);
    }
  });

  // Filtrar áreas com base no termo de pesquisa
  const filteredAreas = areas.filter(
    area => area.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (area?: Area) => {
    if (area) {
      setSelectedArea(area);
      setFormData({
        nome: area.nome
      });
    } else {
      setSelectedArea(null);
      setFormData({
        nome: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (selectedArea) {
      updateAreaMutation.mutate({ ...formData, id: selectedArea.id });
    } else {
      createAreaMutation.mutate(formData);
    }
  };

  const handleViewProcesses = (areaId: string) => {
    navigate(`/areas/${areaId}/processos`);
  };

  const handleConfirmDelete = () => {
    if (confirmDelete) {
      deleteAreaMutation.mutate(confirmDelete);
    }
  };

  // Abrir o diálogo automaticamente se vindo do dashboard
  useEffect(() => {
    if (location.state?.openDialog) {
      handleOpenDialog();
    }
  }, [location.state]);

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <Typography variant="h4" gutterBottom sx={{ fontSize: '2rem' }}>
        Gestão de Áreas
      </Typography>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <TextField
          placeholder="Pesquisar áreas..."
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
          onClick={() => handleOpenDialog()}
          size="large"
          sx={{ px: 3, py: 1 }}
        >
          Nova Área
        </Button>
      </Box>

      {isLoading ? (
        <LoadingIndicator />
      ) : isError ? (
        <ErrorDisplay error={error} onRetry={() => queryClient.invalidateQueries({ queryKey: ['areas'] })} />
      ) : filteredAreas.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">
            {searchTerm ? `Nenhuma área encontrada para "${searchTerm}".` : 'Nenhuma área cadastrada.'}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table size="medium">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Área</TableCell>
                <TableCell align="center" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAreas.map((area) => (
                <TableRow 
                  key={area.id} 
                  hover 
                  onClick={() => handleViewProcesses(area.id)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } 
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        sx={{ 
                          bgcolor: '#1976d2', 
                          width: 40, 
                          height: 40 
                        }}
                      >
                        {area.nome.substring(0, 1).toUpperCase()}
                      </Avatar>
                      <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                        {area.nome}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Tooltip title="Ver processos">
                        <IconButton 
                          color="primary" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProcesses(area.id);
                          }}
                          size="large"
                        >
                          <FolderIcon fontSize="medium" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton 
                          color="primary" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDialog(area);
                          }}
                          size="small"
                        >
                          <EditIcon fontSize="medium" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton 
                          color="error" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete(area.id);
                          }}
                          size="small"
                        >
                          <DeleteIcon fontSize="medium" />
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

      {/* Dialog para criar/editar área */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedArea ? 'Editar Área' : 'Nova Área'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="nome"
            label="Nome da Área"
            type="text"
            fullWidth
            value={formData.nome}
            onChange={handleChange}
            required
            error={!formData.nome.trim()}
            helperText={!formData.nome.trim() ? 'Nome é obrigatório' : ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={createAreaMutation.isPending || updateAreaMutation.isPending}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={!formData.nome.trim() || createAreaMutation.isPending || updateAreaMutation.isPending}
          >
            {createAreaMutation.isPending || updateAreaMutation.isPending ? (
              <CircularProgress size={24} />
            ) : selectedArea ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleConfirmDelete}
        message="Tem certeza que deseja excluir esta área? Esta ação não pode ser desfeita."
        isLoading={deleteAreaMutation.isPending}
      />
    </Box>
  );
};

export default AreasPage;