export interface Ferramenta {
  id: string;
  nome: string;
  descricao: string;
}

export interface FerramentaProcesso {
  id: string;
  processoDetalheId: string;
  ferramentaId: string;
  ferramenta?: Ferramenta;
}