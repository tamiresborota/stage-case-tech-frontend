import { Chip, ChipProps } from '@mui/material';
import { TipoProcesso } from '../../types/enums';

interface TipoChipProps extends Omit<ChipProps, 'color'> {
  tipo: TipoProcesso;
}

export function TipoChip({ tipo, ...props }: TipoChipProps) {
  return (
    <Chip
      label={tipo === TipoProcesso.Manual ? 'Manual' : 'Sistêmico'}
      color={tipo === TipoProcesso.Manual ? 'default' : 'primary'}
      size="small"
      variant="outlined"
      {...props}
    />
  );
}