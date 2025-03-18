
export interface Area {
    id: string;
    nome: string;
  }
  

  export interface AreaInput {
    nome: string;
  }
  

  export type AreaUpdate = Partial<Omit<Area, 'id'>> & { id: string };