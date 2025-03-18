import { TipoProcesso, StatusProcesso } from '../types/enums';
import { Processo, ProcessoInput } from '../types/processo';
import { mapTipoProcesso, mapStatusProcesso, convertTipoToNumber, convertStatusToNumber } from './enumUtils';
import { ProcessoFormData } from '../components/processos/ProcessoForm';

export interface ProcessoApiResponse {
  id: string;
  nome: string;
  descricao: string;
  areaId: string;
  areaNome: string;
  processoPaiId?: string;
  tipo: number | string;
  status: number | string;
  detalheId?: string;
  ferramentas?: Array<{ id: string; nome: string }>;
  responsaveis?: Array<{ id: string; nome: string }>;
  documentos?: Array<{ id: string; nome: string }>;
}

export interface ProcessoApiRequest {
  nome: string;
  descricao: string;
  areaId?: string;
  processoPaiId?: string | null;
  tipo: number;
  status: number;
}


export function processoToApi(processo: Partial<Processo | ProcessoInput>): ProcessoApiRequest {
  const apiData: ProcessoApiRequest = {
    nome: processo.nome || '',
    descricao: processo.descricao || '',
    tipo: typeof processo.tipo === 'string' 
      ? convertTipoToNumber(processo.tipo as TipoProcesso)
      : processo.tipo as number || 0,
    status: typeof processo.status === 'string'
      ? convertStatusToNumber(processo.status as StatusProcesso)
      : processo.status as number || 0
  };

  if (processo.areaId) {
    apiData.areaId = processo.areaId;
  }

  if (processo.processoPaiId) {
    apiData.processoPaiId = processo.processoPaiId;
  }

  return apiData;
}

export function processoFromApi(data: ProcessoApiResponse): Processo {
  return {
    id: data.id,
    nome: data.nome,
    descricao: data.descricao,
    areaId: data.areaId,
    areaNome: data.areaNome || 'Não especificada',
    processoPaiId: data.processoPaiId,
    tipo: mapTipoProcesso(data.tipo),
    status: mapStatusProcesso(data.status),
    detalheId: data.detalheId,
    // Converter arrays de objetos relacionados, se existirem
    ferramentas: data.ferramentas?.map(f => ({
      id: f.id,
      nome: f.nome,
      processoDetalheId: data.detalheId || ''
    })),
    responsaveis: data.responsaveis?.map(r => ({
      id: r.id,
      nome: r.nome,
      processoDetalheId: data.detalheId || ''
    })),
    documentos: data.documentos?.map(d => ({
      id: d.id,
      nome: d.nome,
      processoDetalheId: data.detalheId || ''
    }))
  };
}

export const processoFormToData = (data: ProcessoFormData) => {
  return {
    nome: data.nome,
    descricao: data.descricao,
    tipo: data.tipo,
    status: data.status,
    areaId: data.areaId,
    processoPaiId: data.processoPaiId,
    responsaveis: data.responsaveis.split(',').map(r => r.trim()),
    ferramentas: data.ferramentas.split('\n').map(s => s.trim()),
    documentos: data.documentos.split('\n').map(d => d.trim())
  };
};