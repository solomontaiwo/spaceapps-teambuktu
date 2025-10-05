export type Planet = {
  name: string;
  period?: number;
  radius?: number;
  eq_temp?: number;
  star_temp?: number;
  ra?: number;
  dec?: number;
  // Puoi lasciare altri campi come mass, distance, orbitalPeriod, color, ecc.
  distance?: number;
  orbitalPeriod?: number;
  color?: string;
  mass?: number;
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
