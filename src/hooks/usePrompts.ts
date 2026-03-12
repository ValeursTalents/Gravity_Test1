import { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import type { Prompt, Filters } from '../types';

const CSV_PATH = '/data/prompts.csv';

interface RawRow {
  id?: string;
  titre?: string;
  module?: string;
  outil_ia?: string;
  paragraphe?: string;
  texte_prompt?: string;
  [key: string]: string | undefined;
}

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(CSV_PATH)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then(csv => {
        const result = Papa.parse<RawRow>(csv, {
          header: true,
          skipEmptyLines: true,
          transformHeader: h => h.trim(),
        });

        const parsed: Prompt[] = result.data.map((row, i) => ({
          id: Number(row.id ?? i + 1),
          titre: (row.titre ?? '').trim(),
          module: (row.module ?? '').trim(),
          outil_ia: (row.outil_ia ?? '').trim(),
          paragraphe: (row.paragraphe ?? '').trim(),
          texte_prompt: (row.texte_prompt ?? '').trim(),
        }));

        setPrompts(parsed);
      })
      .catch(err => setError(String(err)))
      .finally(() => setLoading(false));
  }, []);

  return { prompts, loading, error };
}

/* ── Derived filter options (computed once from full dataset) ── */
export function useFilterOptions(prompts: Prompt[]) {
  return useMemo(() => {
    const modules = [''].concat(
      [...new Set(prompts.map(p => p.module).filter(Boolean))].sort()
    );

    // Decompose multi-tool values: "ChatGPT, Gemini" → ["ChatGPT", "Gemini"]
    const allTools = prompts
      .flatMap(p => p.outil_ia.split(',').map(t => t.trim()).filter(Boolean));
    const outils = [''].concat([...new Set(allTools)].sort());

    return { modules, outils };
  }, [prompts]);
}

/* ── Dynamic § list (filtered by selected module) ─────────────── */
export function useParagraphes(prompts: Prompt[], selectedModule: string) {
  return useMemo(() => {
    const source = selectedModule
      ? prompts.filter(p => p.module === selectedModule)
      : prompts;
    const para = [...new Set(source.map(p => p.paragraphe).filter(Boolean))].sort();
    return ['', ...para];
  }, [prompts, selectedModule]);
}

/* ── Filtered results (all filters combined) ──────────────────── */
export function useFilteredPrompts(prompts: Prompt[], filters: Filters) {
  return useMemo(() => {
    let result = prompts;

    if (filters.module) {
      result = result.filter(p => p.module === filters.module);
    }

    if (filters.paragraphe) {
      result = result.filter(p => p.paragraphe === filters.paragraphe);
    }

    if (filters.outil) {
      result = result.filter(p =>
        p.outil_ia.split(',').map(t => t.trim()).includes(filters.outil)
      );
    }

    if (filters.keyword.trim()) {
      const kw = filters.keyword.toLowerCase();
      result = result.filter(
        p =>
          p.titre.toLowerCase().includes(kw) ||
          p.texte_prompt.toLowerCase().includes(kw)
      );
    }

    // Sort: module ASC, paragraphe ASC
    return [...result].sort((a, b) => {
      if (a.module < b.module) return -1;
      if (a.module > b.module) return 1;
      if (a.paragraphe < b.paragraphe) return -1;
      if (a.paragraphe > b.paragraphe) return 1;
      return 0;
    });
  }, [prompts, filters]);
}
