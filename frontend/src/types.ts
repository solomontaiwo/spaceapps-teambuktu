export type Planet = {
  name: string;
  radius: number;          // in raggi terrestri (scala visuale la gestiamo noi)
  distance: number;        // in UA (scala visuale)
  orbitalPeriod: number;   // in giorni
  color?: string;
};

export type Star = {
  name: string;
  radius: number;
  temperature: number;
};

export type System = {
  star: Star;
  planets: Planet[];
};

export type SimilarityResp = {
  ESI: number;             // 0..1
  classification: string;  // testo (es. “Very Earth-like”)
};
