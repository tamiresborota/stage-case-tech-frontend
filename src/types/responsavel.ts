export interface Responsavel {
  id: string;
  nome: string;
}

export interface ResponsavelProcesso {
  id: string;
  processoDetalheId: string;
  responsavelId: string;
  responsavel?: Responsavel;
}