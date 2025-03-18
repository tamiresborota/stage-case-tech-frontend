import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Business as BusinessIcon,
  Folder as FolderIcon,
  BarChart as BarChartIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { areaService } from '../services/areaService';
import { processoService } from '../services/processoService';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Buscar todas as áreas
  const { 
    data: areas = [], 
    isLoading: areasLoading, 
    isError: areasError 
  } = useQuery({
    queryKey: ['areas'],
    queryFn: areaService.getAll
  });

  // Buscar todos os processos para estatísticas
  const { 
    data: processos = [], 
    isLoading: processosLoading, 
    isError: processosError 
  } = useQuery({
    queryKey: ['processos'],
    queryFn: processoService.getAll
  });

  const handleNovaArea = () => {
    navigate('/areas', { state: { openDialog: true } });
  };

  const areaSummary = {
    total: areas.length,
    recent: areas.slice(0, 3) // Limita para mostrar apenas os 3 mais recentes
  };

  // Agrupar processos por área
  const processosByArea = processos.reduce((acc, processo) => {
    const areaId = processo.areaId;
    const area = areas.find(a => a.id === areaId);
    const areaNome = area ? area.nome : 'Sem área';

    if (!acc[areaNome]) {
      acc[areaNome] = { area: areaNome, count: 0 };
    }
    acc[areaNome].count += 1;
    return acc;
  }, {});

  const processosSummary = {
    total: processos.length,
    byArea: Object.values(processosByArea)
  };

  const isLoading = areasLoading || processosLoading;
  const isError = areasError || processosError;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Ocorreu um erro ao carregar os dados do dashboard. Tente novamente mais tarde.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Cards de resumo */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <BusinessIcon />
                </Avatar>
                <Typography variant="h6">Áreas</Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ mb: 2, fontWeight: 'bold' }}>
                {areaSummary.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Áreas cadastradas no sistema
              </Typography>
            </CardContent>
            <Divider />
            <CardActions>
              <Button size="small" onClick={() => navigate('/areas')}>
                Ver Áreas
              </Button>
              <Button 
                size="small" 
                color="primary" 
                startIcon={<AddIcon />}
                onClick={handleNovaArea}
              >
                Nova Área
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <FolderIcon />
                </Avatar>
                <Typography variant="h6">Processos</Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ mb: 2, fontWeight: 'bold' }}>
                {processosSummary.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Processos mapeados no sistema
              </Typography>
            </CardContent>
            <Divider />
            <CardActions>
              <Button size="small" onClick={() => navigate('/processos/todos')}>
                Ver Processos
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <BarChartIcon />
                </Avatar>
                <Typography variant="h6">Visualização</Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Explore os processos organizados por área para uma visualização completa da estrutura organizacional.
              </Typography>
            </CardContent>
            <Divider />
            <CardActions>
              <Button 
                size="small" 
                variant="contained" 
                color="primary"
                onClick={() => navigate('/processos/hierarquia')}
              >
                Ver Hierarquia
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Áreas recentes */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Áreas Recentes
            </Typography>
            {areaSummary.recent.length > 0 ? (
              <List>
                {areaSummary.recent.map((area) => (
                  <ListItem 
                    key={area.id}
                    button
                    onClick={() => navigate(`/areas/${area.id}/processos`)}
                    sx={{ borderRadius: 1, mb: 1 }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        <BusinessIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={area.nome} />
                  </ListItem>
                ))}
                <ListItem button onClick={() => navigate('/areas')}>
                  <ListItemText 
                    primary="Ver todas as áreas" 
                    sx={{ color: 'primary.main', textAlign: 'center' }} 
                  />
                </ListItem>
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                Nenhuma área cadastrada ainda.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Distribuição de processos */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Processos por Área
            </Typography>
            {processosSummary.byArea.length > 0 ? (
              <Box sx={{ mt: 2 }}>
                {processosSummary.byArea.map((item, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="body1">{item.area}</Typography>
                      <Chip 
                        label={item.count} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                    </Box>
                    <Box
                      sx={{
                        height: 8,
                        bgcolor: 'grey.200',
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          width: `${(item.count / processosSummary.total) * 100}%`,
                          bgcolor: 'primary.main',
                          borderRadius: 4,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                Nenhum processo cadastrado ainda.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;