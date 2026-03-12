import { Search, RotateCcw } from 'lucide-react';
import type { Filters } from '../types';

interface Props {
  filters: Filters;
  modules: string[];
  paragraphes: string[];
  outils: string[];
  onFilterChange: (key: keyof Filters, value: string) => void;
  onReset: () => void;
}

export function FilterBar({
  filters,
  modules,
  paragraphes,
  outils,
  onFilterChange,
  onReset,
}: Props) {
  return (
    <div className="filter-bar" role="search" aria-label="Filtres de recherche">
      <div className="filter-grid">

        {/* Module */}
        <div className="filter-group">
          <label className="filter-label" htmlFor="filter-module">Module</label>
          <select
            id="filter-module"
            className="filter-select"
            value={filters.module}
            onChange={e => onFilterChange('module', e.target.value)}
            aria-label="Filtrer par module"
          >
            <option value="">Tous les modules</option>
            {modules.filter(Boolean).map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Paragraphe */}
        <div className="filter-group">
          <label className="filter-label" htmlFor="filter-para">Paragraphe</label>
          <select
            id="filter-para"
            className="filter-select"
            value={filters.paragraphe}
            onChange={e => onFilterChange('paragraphe', e.target.value)}
            aria-label="Filtrer par paragraphe"
          >
            <option value="">Tous les §</option>
            {paragraphes.filter(Boolean).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Outil IA */}
        <div className="filter-group">
          <label className="filter-label" htmlFor="filter-outil">Outil IA</label>
          <select
            id="filter-outil"
            className="filter-select"
            value={filters.outil}
            onChange={e => onFilterChange('outil', e.target.value)}
            aria-label="Filtrer par outil IA"
          >
            <option value="">Tous les outils</option>
            {outils.filter(Boolean).map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        {/* Mot-clé + Réinitialiser */}
        <div className="filter-group">
          <label className="filter-label" htmlFor="filter-keyword">Recherche</label>
          <div className="filter-actions">
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              />
              <input
                id="filter-keyword"
                className="filter-input"
                type="search"
                placeholder="Chercher un mot-clé…"
                value={filters.keyword}
                onChange={e => onFilterChange('keyword', e.target.value)}
                style={{ paddingLeft: 36 }}
                aria-label="Rechercher un mot-clé"
              />
            </div>
            <button
              id="btn-reset-filters"
              className="btn-reset"
              onClick={onReset}
              aria-label="Réinitialiser tous les filtres"
              title="Réinitialiser"
            >
              <RotateCcw size={15} />
              Réinitialiser
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
