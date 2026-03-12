import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import type { Prompt } from '../types';

interface Props {
  prompt: Prompt;
  moduleIndex: number;
  animDelay: number;
}

// Color palette per module index (cycles 0–5)
const MODULE_COLORS = [
  'badge-module-0',
  'badge-module-1',
  'badge-module-2',
  'badge-module-3',
  'badge-module-4',
  'badge-module-5',
];

export function PromptCard({ prompt, moduleIndex, animDelay }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(prompt.texte_prompt);
    } catch {
      // Fallback for insecure contexts
      const ta = document.createElement('textarea');
      ta.value = prompt.texte_prompt;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [prompt.texte_prompt]);

  const modClass = prompt.module
    ? MODULE_COLORS[moduleIndex % MODULE_COLORS.length]
    : 'badge-module-none';

  // Split multi-tool values for display
  const tools = prompt.outil_ia
    ? prompt.outil_ia.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  return (
    <article
      className="prompt-card"
      style={{ animationDelay: `${animDelay}ms` }}
      aria-label={`Prompt : ${prompt.titre}`}
    >
      {/* Badges row */}
      <div className="card-badges">
        {prompt.module && (
          <span className={`badge ${modClass}`}>
            {prompt.module}
          </span>
        )}
        {prompt.paragraphe && (
          <span className="badge badge-para">{prompt.paragraphe}</span>
        )}
        {tools.map(tool => (
          <span key={tool} className="badge badge-tool">{tool}</span>
        ))}
      </div>

      {/* Title */}
      <h2 className="card-title">{prompt.titre || '(Sans titre)'}</h2>

      {/* Prompt text */}
      <div className="card-prompt" role="region" aria-label="Texte du prompt">
        {prompt.texte_prompt}
      </div>

      {/* Copy button */}
      <button
        id={`copy-btn-${prompt.id}`}
        className={`btn-copy${copied ? ' copied' : ''}`}
        onClick={handleCopy}
        aria-label={copied ? 'Prompt copié !' : 'Copier ce prompt'}
      >
        {copied ? (
          <>
            <Check size={16} strokeWidth={2.5} />
            Copié !
          </>
        ) : (
          <>
            <Copy size={16} strokeWidth={2} />
            Copier
          </>
        )}
      </button>
    </article>
  );
}
