import { TipoProcesso, StatusProcesso } from './enums';
import { FerramentaProcesso } from './ferramenta';
import { DocumentoProcesso } from './documento';
import { ResponsavelProcesso } from './responsavel';

export interface Processo {
  id: string;
  nome: string;
  descricao: string;
  areaId: string;
  areaNome: string;
  processoPaiId?: string;
  tipo: TipoProcesso | string;
  status: StatusProcesso | string;
  detalheId?: string;
  ferramentas?: FerramentaProcesso[];
  responsaveis?: ResponsavelProcesso[];
  documentos?: DocumentoProcesso[];
}

export interface ProcessoInput {
  nome: string;
  descricao: string;
  tipo: TipoProcesso | number;
  status: StatusProcesso | number;
  areaId?: string | null;
  processoPaiId?: string | null;
}

export interface ProcessoCreateInput {
  nome: string;
  descricao: string;
  tipo: TipoProcesso | number;
  status: StatusProcesso | number;
  areaId?: string | null;
  processoPaiId?: string | null;
  responsaveis?: string[];
  ferramentas?: string[];
  documentos?: string[];
}

export type ProcessoUpdate = Partial<Omit<Processo, 'id'>> & { id: number };

export interface ProcessoHierarquia extends Processo {
  subProcessos: ProcessoHierarquia[];
}