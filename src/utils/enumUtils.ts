import { Processo, ProcessoInput } from '../types/processo';
import { TipoProcesso, StatusProcesso } from '../types/enums';

export function mapTipoProcesso(tipo: string | number): TipoProcesso {
  if (typeof tipo === 'number') {
    return tipo === 0 ? TipoProcesso.Manual : TipoProcesso.Sistemico;
  }
  return tipo.toLowerCase().includes('manual') 
    ? TipoProcesso.Manual 
    : TipoProcesso.Sistemico;
}

export function mapStatusProcesso(status: string | number): StatusProcesso {
  if (typeof status === 'number') {
    const statusMap = {
      0: StatusProcesso.Implementado,
      1: StatusProcesso.EmImplementacao,
      2: StatusProcesso.Planejado,
      3: StatusProcesso.Problematico,
      4: StatusProcesso.Obsoleto
    };
    return statusMap[status] || StatusProcesso.Planejado;
  }
  
  if (status.toUpperCase().includes('IMPLEMENTADO')) return StatusProcesso.Implementado;
  if (status.toUpperCase().includes('IMPLEMENTACAO')) return StatusProcesso.EmImplementacao;
  if (status.toUpperCase().includes('PLANEJADO')) return StatusProcesso.Planejado;
  if (status.toUpperCase().includes('PROBLEMATICO')) return StatusProcesso.Problematico;
  if (status.toUpperCase().includes('OBSOLETO')) return StatusProcesso.Obsoleto;
  
  return StatusProcesso.Planejado;
}

export function convertTipoToNumber(tipo?: TipoProcesso): number {
  if (!tipo) return 0;
  return tipo === TipoProcesso.Manual ? 0 : 1;
}

export function convertStatusToNumber(status?: StatusProcesso): number {
  if (!status) return 0;
  
  const statusMap = {
    [StatusProcesso.Implementado]: 0,
    [StatusProcesso.EmImplementacao]: 1,
    [StatusProcesso.Planejado]: 2,
    [StatusProcesso.Problematico]: 3,
    [StatusProcesso.Obsoleto]: 4
  };
  
  return statusMap[status];
}

export const convertProcessoToBackend = (processo: Partial<Processo>): any => {
  if ('areaId' in processo) {
    return {
      nome: processo.nome,
      descricao: processo.descricao,
      areaId: processo.areaId,
      processoPaiId: processo.processoPaiId,
      tipo: convertTipoToNumber(processo.tipo),
      status: convertStatusToNumber(processo.status)
    };
  }
  
  return {
    nome: processo.nome,
    descricao: processo.descricao,
    processoPaiId: processo.processoPaiId,
    tipo: convertTipoToNumber(processo.tipo),
    status: convertStatusToNumber(processo.status)
  };
};


export function convertTipoFromNumber(tipoNumber?: number): 'Manual' | 'Sistemico' {
  return tipoNumber === 1 ? 'Sistemico' : 'Manual';
}


export function convertStatusFromNumber(statusNumber?: number): string {
  switch (statusNumber) {
    case 0: return 'Implementado';
    case 1: return 'EmImplementacao';
    case 2: return 'Planejado';
    case 3: return 'Problematico';
    case 4: return 'Obsoleto';
    default: return 'Implementado';
  }
}