import React from 'react';
import { 
  Box, 
  Typography, 
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
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  AccountTree as AccountTreeIcon,
  Computer as ComputerIcon
} from '@mui/icons-material';
import { StatusChip } from './StatusChip';
import { TipoChip } from './TipoChip';
import { Processo } from '../../types/processo';

export interface ProcessoTableProps {
  processos: Processo[];
  showArea?: boolean;
  onDetalheClick?: (id: string) => void;
  onSubprocessosClick?: (id: string) => void;
  onEditarClick?: (id: string) => void;
  onDeleteClick?: (id: string) => void;
  emptyMessage?: string;
  searchTerm?: string;
  isLoading?: boolean;
}

export const ProcessoTable: React.FC<ProcessoTableProps> = ({
  processos,
  showArea = false,
  onDetalheClick,
  onSubprocessosClick,
  onEditarClick,
  onDeleteClick,
  emptyMessage = 'Nenhum processo encontrado.',
  searchTerm = '',
}) => {
  if (processos.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="textSecondary">
          {searchTerm ? `Nenhum processo encontrado para "${searchTerm}".` : emptyMessage}
        </Typography>
      </Paper>
    );
  }

  const isTipoManual = (tipo: string): boolean => {
    return tipo?.toUpperCase() === 'MANUAL';
  };

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
      <Table size="medium">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Processo</TableCell>
            {showArea && (
              <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Área</TableCell>
            )}
            <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Tipo</TableCell>
            <TableCell sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Status</TableCell>
            <TableCell align="center" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {processos.map((processo) => (
            <TableRow 
              key={processo.id} 
              hover 
              onClick={() => onDetalheClick && onDetalheClick(processo.id)}
              sx={{ 
                cursor: onDetalheClick ? 'pointer' : 'default',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } 
              }}
            >
              <TableCell>
                <Box display="flex" alignItems="center">
                  <Box sx={{ mr: 2 }}>
                    {isTipoManual(processo.tipo) ? (
                      <DescriptionIcon color="action" />
                    ) : (
                      <ComputerIcon color="primary" />
                    )}
                  </Box>
                  <Typography variant="body1">{processo.nome}</Typography>
                </Box>
              </TableCell>
              
              {showArea && (
                <TableCell>
                  {processo.areaNome || 'Não especificada'}
                </TableCell>
              )}
              
              <TableCell><TipoChip tipo={processo.tipo} /></TableCell>
              <TableCell><StatusChip status={processo.status} /></TableCell>
              
              <TableCell align="center">
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                  {onSubprocessosClick && (
                    <Tooltip title="Ver subprocessos">
                      <IconButton 
                        color="primary" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSubprocessosClick(processo.id);
                        }}
                        size="small"
                      >
                        <AccountTreeIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  {onDetalheClick && (
                    <Tooltip title="Ver detalhes">
                      <IconButton 
                        color="info" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDetalheClick(processo.id);
                        }}
                        size="small"
                      >
                        <DescriptionIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  {onEditarClick && (
                    <Tooltip title="Editar">
                      <IconButton 
                        color="primary" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditarClick(processo.id);
                        }}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  {onDeleteClick && (
                    <Tooltip title="Excluir">
                      <IconButton 
                        color="error" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteClick(processo.id);
                        }}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};