import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography,
  IconButton, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Collapse,
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Dashboard as DashboardIcon, 
  Layers as LayersIcon, 
  FormatListBulleted as ListIcon,
  AccountTree as TreeIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const [processosOpen, setProcessosOpen] = useState(true);

  const handleProcessosClick = () => {
    setProcessosOpen(!processosOpen);
  };

  const isActive = (path: string) => location.pathname === path;
  const isActiveParent = (path: string) => location.pathname.startsWith(path);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Áreas', icon: <LayersIcon />, path: '/areas' }
  ];

  const processosSubItems = [
    { text: 'Lista de Processos', icon: <ListIcon />, path: '/processos/todos' },
    { text: 'Hierarquia', icon: <TreeIcon />, path: '/processos/hierarquia' }
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setOpen(!open)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Stage - Sistema de Gestão de Processos
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="persistent"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => navigate(item.path)}
                selected={isActive(item.path)}
                sx={{
                  bgcolor: isActive(item.path) ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.08)' }
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}

            {/* Menu Processos com submenu */}
            <ListItem
              button
              onClick={handleProcessosClick}
              selected={isActiveParent('/processos')}
              sx={{
                bgcolor: isActiveParent('/processos') ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.08)' }
              }}
            >
              <ListItemIcon>
                <ListIcon />
              </ListItemIcon>
              <ListItemText primary="Processos" />
              {processosOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItem>

            <Collapse in={processosOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {processosSubItems.map((item) => (
                  <ListItem
                    button
                    key={item.text}
                    onClick={() => navigate(item.path)}
                    selected={isActive(item.path)}
                    sx={{
                      pl: 4,
                      bgcolor: isActive(item.path) ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                      '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.08)' }
                    }}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 0, width: { sm: `calc(100% - ${open ? drawerWidth : 0}px)` } }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;