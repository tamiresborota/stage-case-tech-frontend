import { Chip, ChipProps } from '@mui/material';
import { StatusProcesso } from '../../types/enums';

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: StatusProcesso;
}

export function StatusChip({ status, ...props }: StatusChipProps) {
  // Determina cor baseado no status
  const getStatusColor = (status: StatusProcesso): ChipProps['color'] => {
    switch (status) {
      case StatusProcesso.Implementado:
        return 'success';
      case StatusProcesso.EmImplementacao:
        return 'warning';
      case StatusProcesso.Planejado:
        return 'info';
      case StatusProcesso.Problematico:
        return 'error';
      case StatusProcesso.Obsoleto:
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: StatusProcesso): string => {
    switch (status) {
      case StatusProcesso.Implementado:
        return 'Implementado';
      case StatusProcesso.EmImplementacao:
        return 'Em Implementação';
      case StatusProcesso.Planejado:
        return 'Planejado';
      case StatusProcesso.Problematico:
        return 'Problemático';
      case StatusProcesso.Obsoleto:
        return 'Obsoleto';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <Chip
      label={getStatusLabel(status)}
      color={getStatusColor(status)}
      size="small"
      {...props}
    />
  );
}