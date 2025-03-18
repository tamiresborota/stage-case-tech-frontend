export interface Documento {
  id: string;
  nome: string;
  descricao: string;
}

export interface DocumentoProcesso {
  id: string;
  processoDetalheId: string;
  documentoId: string;
  documento?: Documento;
}