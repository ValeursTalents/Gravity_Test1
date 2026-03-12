import { useState, useCallback, useMemo } from 'react';
import { BookOpen, Zap } from 'lucide-react';
import { FilterBar } from './components/FilterBar';
import { PromptCard } from './components/PromptCard';
import {
  usePrompts,
  useFilterOptions,
  useParagraphes,
  useFilteredPrompts,
} from './hooks/usePrompts';
import type { Filters } from './types';

const INITIAL_FILTERS: Filters = {
  module: '',
  paragraphe: '',
  outil: '',
  keyword: '',
};

// Map module name → stable color index
function useModuleColorMap(modules: string[]) {
  return useMemo(() => {
    const map = new Map<string, number>();
    modules.filter(Boolean).forEach((m, i) => map.set(m, i));
    return map;
  }, [modules]);
}

export default function App() {
  const { prompts, loading, error } = usePrompts();
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);

  const { modules, outils } = useFilterOptions(prompts);
  const paragraphes = useParagraphes(prompts, filters.module);
  const filtered = useFilteredPrompts(prompts, filters);
  const moduleColorMap = useModuleColorMap(modules);

  const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
    setFilters(prev => {
      // When module changes, reset § filter (dynamic list)
      if (key === 'module') {
        return { ...prev, module: value, paragraphe: '' };
      }
      return { ...prev, [key]: value };
    });
  }, []);

  const handleReset = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  /* ── Loading ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="app">
        <div className="loading-state" role="status" aria-live="polite">
          <div className="spinner" aria-hidden="true" />
          <p className="loading-text">Chargement des prompts…</p>
        </div>
      </div>
    );
  }

  /* ── Error ───────────────────────────────────────────────── */
  if (error) {
    return (
      <div className="app">
        <div className="loading-state">
          <p style={{ color: 'var(--accent-3)' }}>
            Erreur de chargement : {error}
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Vérifiez que le fichier <code>/public/data/prompts.csv</code> est bien présent.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="header">
        <div className="header-logo-row">
          <div className="header-icon" aria-hidden="true">
            <BookOpen size={26} color="white" strokeWidth={1.8} />
          </div>
          <h1>Base de prompts RS7138</h1>
        </div>
        <p className="header-subtitle">Trouvez et copiez vos prompts en 1 clic</p>
        <div className="header-badge" aria-label={`${prompts.length} prompts disponibles`}>
          <Zap size={12} />
          {prompts.length} prompts · Formation IA distanciel
        </div>
      </header>

      {/* ── Filter Bar ─────────────────────────────────────── */}
      <FilterBar
        filters={filters}
        modules={modules}
        paragraphes={paragraphes}
        outils={outils}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      {/* ── Results counter ────────────────────────────────── */}
      <div className="results-bar" aria-live="polite" aria-atomic="true">
        <div className="results-count">
          <span
            className="results-count-number"
            aria-label={`${filtered.length} prompts trouvés`}
          >
            {filtered.length}
          </span>
          <span>prompt{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* ── Cards Grid ─────────────────────────────────────── */}
      <main>
        <div className="cards-grid" role="list" aria-label="Liste des prompts">
          {filtered.length === 0 ? (
            <div className="empty-state" role="listitem">
              <div className="empty-icon" aria-hidden="true">
                <BookOpen size={32} color="var(--text-muted)" strokeWidth={1.5} />
              </div>
              <h3>Aucun prompt trouvé</h3>
              <p>
                Aucun prompt ne correspond à vos critères actuels.
                Modifiez vos filtres ou cliquez sur «&nbsp;Réinitialiser&nbsp;».
              </p>
            </div>
          ) : (
            filtered.map((prompt, i) => (
              <div key={prompt.id} role="listitem">
                <PromptCard
                  prompt={prompt}
                  moduleIndex={moduleColorMap.get(prompt.module) ?? 0}
                  animDelay={Math.min(i * 40, 400)}
                />
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
