export interface Prompt {
  id: number;
  titre: string;
  module: string;
  outil_ia: string;
  paragraphe: string;
  texte_prompt: string;
}

export interface Filters {
  module: string;
  paragraphe: string;
  outil: string;
  keyword: string;
}
