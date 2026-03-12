# PRD — Base de prompts RS7138 Distanciel

> **Données source confirmées** : 38 prompts réels, 6 modules (Module 1 → Module 6), 5 sections (§1 → §5), 10 outils IA distincts.

---

## 1. Vue d'ensemble

| Champ | Valeur |
|---|---|
| **Nom** | Base de prompts RS7138 Distanciel |
| **Baseline** | Le bon prompt, en un clic |
| **Problème résolu** | Les stagiaires de la formation IA peinent à copier-coller les prompts depuis le livret PDF/papier. Cette appli centralise tous les prompts et les rend instantanément copiables. |
| **Utilisateur cible** | Stagiaires de la formation IA (RS7138), en situation distanciel |
| **Valeur principale** | Trouver et copier n'importe quel prompt en < 10 secondes, via filtres combinables, sans manipulation de document |

---

## 2. Fonctionnalités core (MVP)

1. **Charger les prompts** depuis un fichier CSV embarqué au démarrage de l'appli, sans action utilisateur.
2. **Filtrer par module** — Afficher uniquement les prompts appartenant au numéro de module sélectionné.
3. **Filtrer par paragraphe (§)** — Afficher uniquement les prompts du § choisi (combinable avec le filtre module).
4. **Filtrer par outil IA** — Afficher uniquement les prompts associés à l'outil IA sélectionné (ex. ChatGPT, Gemini, Copilot…).
5. **Rechercher par mot-clé** — Filtrer en temps réel les prompts dont le titre ou le texte contient le mot-clé saisi.
6. **Copier un prompt en 1 clic** — Copier le texte complet du prompt dans le presse-papier et afficher un feedback visuel de confirmation.
7. **Réinitialiser tous les filtres** — Remettre tous les critères à zéro et afficher l'intégralité des prompts en un clic.

---

## 3. Écrans & flux utilisateur

### Écran unique : Tableau de bord des prompts

**En-tête (fixe, haut de page)**
- Logo/Nom de l'appli à gauche : « Base de prompts RS7138 »
- Sous-titre : « Trouvez et copiez vos prompts en 1 clic »

**Zone de filtres (sous l'en-tête, horizontale sur desktop / empilée sur mobile)**
- `Dropdown` — Module : liste des numéros de module uniques extraits du CSV (option par défaut : « Tous les modules »)
- `Dropdown` — Paragraphe § : liste des § uniques **filtrée dynamiquement** selon le module sélectionné (option par défaut : « Tous les §»)
- `Dropdown` — Outil IA : liste unique des outils extraits du CSV (option par défaut : « Tous les outils »)
- `Champ texte` — Recherche mot-clé : placeholder « Chercher un mot-clé… », filtrage déclenché à chaque frappe (debounce 300 ms)
- `Bouton` — « Réinitialiser » : remet tous les dropdowns et le champ texte à leur valeur par défaut

**Compteur de résultats**
- Texte dynamique : « X prompt(s) trouvé(s) »

**Grille de cartes de prompts (zone principale défilable)**
- Chaque carte contient :
  - **Badge Module** (ex. « M3 ») — coin supérieur gauche, couleur distincte par module
  - **Badge §** (ex. « §2.1 ») — à droite du badge module
  - **Badge Outil IA** (ex. « ChatGPT ») — coin supérieur droit, couleur codée par outil
  - **Titre du prompt** — en gras, tronqué à 2 lignes
  - **Texte du prompt** — affiché en entier, police monospace légèrement grisée
  - **Bouton « Copier »** — icône presse-papier + libellé « Copier »
    - Au clic : texte copié → bouton devient ✅ « Copié ! » pendant 2 secondes, puis revient à l'état initial

**État vide**
- SI aucun prompt ne correspond aux filtres : afficher une illustration + message « Aucun prompt trouvé. Modifiez vos critères. »

---

## 4. Modèle de données

### Entité `Prompt`

| Champ | Type | Valeurs réelles |
|---|---|---|
| `id` | `number` | 1 → 38 (auto-incrémenté depuis le CSV) |
| `titre` | `string` | Ex. « Le metaprompt », « Prompt Auditor », « Prompt veille IA » |
| `module` | `enum["Module 1","Module 2","Module 3","Module 4","Module 5","Module 6",""]` | 6 modules + cas sans module |
| `outil_ia` | `string` | Valeurs : `TouteIAG`, `ChatGPT, Gemini`, `Claude, Github`, `Leonardo, TouteIAG`, `Genspark, TouteIAG`, `Gamma, TouteIAG`, `Make`, `ChatGPT, zapier`, `NotebookLM`, `Genspark` |
| `paragraphe` | `enum["§1","§2","§3","§4","§5",""]` | §1 à §5 + cas sans § |
| `texte_prompt` | `string` | Texte complet multi-lignes du prompt |

**Source** : fichier [prompts.csv](file:///G:/Mon%20Drive/Mickael/Valeurs&Talents/Formation/Formations%20perso/IA/Google%20Antigravity%202/BasePrompts_RS7138/public/data/prompts.csv) déjà créé dans [/public/data/prompts.csv](file:///G:/Mon%20Drive/Mickael/Valeurs&Talents/Formation/Formations%20perso/IA/Google%20Antigravity%202/BasePrompts_RS7138/public/data/prompts.csv), 38 lignes, parsé au chargement via Papa Parse.
**Note** : certains prompts n'ont pas de module ni de § renseignés (ex. prompts transversaux) — ils doivent apparaître dans les résultats lorsque les filtres module/§ sont à « Tous ».

---

## 5. Logique métier

```
// == FILTRAGE COMBINÉ (déclenché à chaque changement de filtre) ==

SI filtre_module ≠ "tous"
  ALORS résultats = prompts WHERE module = filtre_module
  SINON résultats = tous les prompts  // inclut les prompts sans module

SI filtre_paragraphe ≠ "tous"
  ALORS résultats = résultats WHERE paragraphe = filtre_paragraphe
  // inclut les prompts sans § seulement si filtre_paragraphe = "tous"

SI filtre_outil ≠ "tous"
  ALORS résultats = résultats WHERE outil_ia CONTAINS filtre_outil
  // CONTAINS car la colonne peut contenir plusieurs outils séparés par ","
  // ex: "ChatGPT, Gemini" → doit matcher si filtre = "ChatGPT" OU "Gemini"

SI mot_clé ≠ ""
  ALORS résultats = résultats WHERE
    (titre CONTAINS mot_clé OU texte_prompt CONTAINS mot_clé)
    [insensible à la casse]

AFFICHER résultats triés par (module ASC, paragraphe ASC)
AFFICHER compteur : "X prompt(s) trouvé(s)"


// == LISTES DYNAMIQUES DES DROPDOWNS ==

AU CHARGEMENT :
  modules_uniques = extraire valeurs uniques non vides de colonne module + "Tous les modules"
  outils_uniques = décomposer colonne outil_ia par "," → dédupliquer → trier
  // ex: "ChatGPT, Gemini" → deux entrées distinctes "ChatGPT" et "Gemini"

SI filtre_module = "tous"
  ALORS dropdown_paragraphe = tous les § uniques non vides
  SINON dropdown_paragraphe = § uniques du module sélectionné uniquement


// == COPIER EN 1 CLIC ==

AU CLIC sur bouton "Copier" du prompt P :
  ALORS copier P.texte_prompt dans navigator.clipboard
  ALORS changer état bouton → "Copié !" + icône ✅ (couleur verte)
  APRÈS 2000ms : restaurer état bouton initial
  SI navigator.clipboard indisponible (HTTP non sécurisé) :
    ALORS fallback : sélection texte via document.execCommand('copy')
```

---

## 6. Stack & contraintes techniques

| Décision | Choix | Justification |
|---|---|---|
| **Framework** | Vite + React 18 + TypeScript | Démarrage rapide, typage fort, écosystème riche |
| **Styling** | Vanilla CSS + CSS Variables | Contrôle total, zéro dépendance lourde |
| **Parsing CSV** | Papa Parse (npm) | Standard, robuste, parsing client-side |
| **Persistance** | Aucune (stateless) — CSV embarqué dans `/public` | Données fixes, pas de backend requis |
| **Déploiement** | Fichiers statiques (Netlify Drop ou GitHub Pages) | Gratuit, zéro serveur |
| **Clipboard API** | `navigator.clipboard.writeText()` natif | Pas de dépendance externe |
| **Responsive** | Mobile-first, breakpoint unique à 768 px | Stagiaires en distanciel sur mobile ou desktop |
| **Police** | Google Fonts — Inter | Lisibilité maximale pour le texte de prompts |
| **Icônes** | Lucide React | Léger, cohérent, bien typé |

**Patterns obligatoires**
- Tous les filtres sont des **états React locaux** dans un composant `App.tsx`
- Le CSV est parsé **une seule fois** au montage (`useEffect` au chargement)
- Les listes de filtres disponibles sont **calculées dynamiquement** depuis les données parsées
- Aucune route, aucun localStorage, aucune authentification

---

## 7. Critères d'acceptation

- [ ] L'appli charge et affiche les **38 prompts** du CSV au démarrage sans action utilisateur
- [ ] Le filtre Module affiche les **6 modules réels** (Module 1 à Module 6) + « Tous les modules »
- [ ] Le filtre Outil IA décompose les valeurs multi-outils (ex. « ChatGPT, Gemini » → 2 entrées)
- [ ] Un prompt avec outil « ChatGPT, Gemini » apparaît si le filtre est « ChatGPT » OU « Gemini »
- [ ] Le dropdown § ne propose que les § du module actif si un module est sélectionné
- [ ] Le filtre Outil IA est cumulable avec les filtres Module et §
- [ ] Les prompts sans module ni § s'affichent uniquement si les deux filtres sont à « Tous »
- [ ] La recherche mot-clé fonctionne en temps réel et est insensible à la casse
- [ ] Le bouton « Réinitialiser » restaure l'affichage complet (38 prompts) en un clic
- [ ] Le bouton « Copier » place le texte exact du prompt dans le presse-papier
- [ ] Le feedback visuel « Copié ! » s'affiche 2 secondes puis disparaît automatiquement
- [ ] Le compteur de résultats reflète en temps réel le nombre de prompts affichés
- [ ] L'interface est utilisable sur mobile (320 px min) et desktop (1280 px+)
- [ ] L'état vide affiche un message clair si aucun prompt ne correspond aux filtres combinés

---

## Prompt de démarrage

```
Tu es un agent de vibe coding autonome. Génère l'intégralité de l'application décrite dans ce PRD sans poser de questions.

Stack : Vite + React 18 + TypeScript + Vanilla CSS + Papa Parse + Lucide React.
Crée le projet avec `npx create-vite@latest ./ --template react-ts`, installe les dépendances, puis génère tous les fichiers nécessaires.

Place un fichier `prompts.csv` d'exemple dans `/public/data/` avec au moins 6 lignes couvrant 2 modules, 2 §, 2 outils IA différents, pour valider tous les filtres.

L'interface doit être premium, moderne (dark mode, glassmorphism, couleurs vives harmonieuses), utiliser la police Inter (Google Fonts) et des micro-animations sur les cartes et le bouton Copier.

Respecte à la lettre chaque critère d'acceptation de la section 7 et chaque règle de la logique métier de la section 5.

Démarre le serveur avec `npm run dev` une fois la génération terminée.
```
