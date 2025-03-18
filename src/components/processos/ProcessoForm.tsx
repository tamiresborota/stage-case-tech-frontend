import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Button,
  Grid,
  Box,
  Paper,
  Typography,
  Chip
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { TipoProcesso, StatusProcesso } from '../../types/enums';

export interface ProcessoFormData {
  nome: string;
  descricao: string;
  tipo: TipoProcesso;
  status: StatusProcesso;
  areaId?: string | null;
  processoPaiId?: string | null;
  responsaveis?: string;
  ferramentas?: string;
  documentos?: string;
}

interface ProcessoFormProps {
  initialData?: Partial<ProcessoFormData>;
  onSubmit: (data: ProcessoFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

export function ProcessoForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isSubmitting = false,
  isEditing = false
}: ProcessoFormProps) {
  const { 
    control, 
    handleSubmit, 
    formState: { errors },
    reset,
    watch
  } = useForm<ProcessoFormData>({
    defaultValues: {
      nome: '',
      descricao: '',
      tipo: TipoProcesso.Manual,
      status: StatusProcesso.Planejado,
      areaId: null,
      processoPaiId: null,
      responsaveis: '',
      ferramentas: '',
      documentos: '',
      ...initialData
    }
  });

  // Atualiza o formulário quando os dados iniciais mudam
  useEffect(() => {
    if (initialData) {
      reset({
        nome: '',
        descricao: '',
        tipo: TipoProcesso.Manual,
        status: StatusProcesso.Planejado,
        areaId: null,
        processoPaiId: null,
        responsaveis: '',
        ferramentas: '',
        documentos: '',
        ...initialData
      });
    }
  }, [initialData, reset]);

  // Observa os campos para renderizar chips
  const responsaveis = watch('responsaveis') || '';
  const ferramentas = watch('ferramentas') || '';
  const documentos = watch('documentos') || '';

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              name="nome"
              control={control}
              rules={{ required: 'Nome é obrigatório' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nome do Processo"
                  fullWidth
                  error={!!errors.nome}
                  helperText={errors.nome?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="descricao"
              control={control}
              rules={{ required: 'Descrição é obrigatória' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Descrição"
                  fullWidth
                  multiline
                  rows={3}
                  error={!!errors.descricao}
                  helperText={errors.descricao?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="tipo"
              control={control}
              rules={{ required: 'Tipo é obrigatório' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.tipo}>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    {...field}
                    label="Tipo"
                  >
                    <MenuItem value={TipoProcesso.Manual}>{TipoProcesso.Manual}</MenuItem>
                    <MenuItem value={TipoProcesso.Sistemico}>{TipoProcesso.Sistemico}</MenuItem>
                  </Select>
                  {errors.tipo && <FormHelperText>{errors.tipo.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="status"
              control={control}
              rules={{ required: 'Status é obrigatório' }}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.status}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    {...field}
                    label="Status"
                  >
                    <MenuItem value={StatusProcesso.Implementado}>{StatusProcesso.Implementado}</MenuItem>
                    <MenuItem value={StatusProcesso.EmImplementacao}>Em Implementação</MenuItem>
                    <MenuItem value={StatusProcesso.Planejado}>{StatusProcesso.Planejado}</MenuItem>
                    <MenuItem value={StatusProcesso.Problematico}>Problemático</MenuItem>
                    <MenuItem value={StatusProcesso.Obsoleto}>{StatusProcesso.Obsoleto}</MenuItem>
                  </Select>
                  {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>

          {/* Responsáveis */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Responsáveis
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Controller
                name="responsaveis"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Responsáveis"
                    fullWidth
                    error={!!errors.responsaveis}
                    helperText={errors.responsaveis?.message || "Adicione os responsáveis separados por vírgulas (ex: João Silva, Maria Souza)"}
                  />
                )}
              />

              {responsaveis && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  {responsaveis.split(',').map((nome, idx) => (
                    nome.trim() && (
                      <Chip 
                        key={idx} 
                        label={nome.trim()} 
                        color="primary"
                        variant="outlined"
                      />
                    )
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Sistemas e Ferramentas */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Sistemas e Ferramentas
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Controller
                name="ferramentas"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Sistemas e Ferramentas"
                    fullWidth
                    multiline
                    rows={2}
                    helperText="Adicione os sistemas ou ferramentas separados por vírgulas (ex: SAP, Excel, Teams)"
                  />
                )}
              />

              {ferramentas && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  {ferramentas.split(',').map((sistema, idx) => (
                    sistema.trim() && (
                      <Chip 
                        key={idx} 
                        label={sistema.trim()} 
                        color="primary" 
                        variant="outlined"
                      />
                    )
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Documentação */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Documentação
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Controller
                name="documentos"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Documentação"
                    fullWidth
                    multiline
                    rows={3}
                    helperText="Adicione os documentos ou links separados por vírgulas"
                  />
                )}
              />

              {documentos && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                  {documentos.split(',').map((doc, idx) => (
                    doc.trim() && (
                      <Chip 
                        key={idx} 
                        label={doc.trim()} 
                        color="info" 
                        variant="outlined"
                      />
                    )
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                startIcon={<SaveIcon />}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar' : 'Salvar'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </form>
  );
}