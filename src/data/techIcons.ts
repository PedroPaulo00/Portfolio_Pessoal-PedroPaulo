/**
 * Ícone de cada item de `skills` (Tecnologias), pelo nome exato do item.
 * SVGs: `npm run tech-icons` (Devicon e Simple Icons). PNGs: imagens enviadas,
 * otimizadas por `npm run images`. Itens sem entrada aqui mantêm o marcador padrão.
 */
const files = import.meta.glob<string>('../assets/tech/*.{svg,png}', { eager: true, query: '?url', import: 'default' });

// i18n-exempt: as chaves são os nomes dos itens (em português e em inglês).
const byName: Record<string, string> = {
  JavaScript: 'javascript.svg',
  TypeScript: 'typescript.svg',
  Dart: 'dart.svg',
  Java: 'java.svg',
  Python: 'python.svg',
  C: 'c.svg',
  'C++': 'cplusplus.svg',
  HTML5: 'html5.svg',
  CSS3: 'css3.svg',
  Flutter: 'flutter.svg',
  React: 'react.svg',
  Spring: 'spring.svg',
  Electron: 'electron.svg',
  'Node.js': 'nodejs.svg',
  Capacitor: 'capacitor.svg',
  Git: 'git.svg',
  GitHub: 'github.svg',
  Docker: 'docker.svg',
  Figma: 'figma.svg',
  'Visual Studio Code': 'vscode.svg',
  Firebase: 'firebase.svg',
  PostgreSQL: 'postgresql.svg',
  'Claude Code': 'claudecode.svg',
  Gemini: 'gemini.svg',
  'OpenAI Codex': 'openai.png',
  ChatGPT: 'chatgpt.png',
  localStorage: 'localstorage.png',
  // Design e IHC: ícones próprios (desenhados para o portfólio), nos dois idiomas.
  'Prototipação de interfaces': 'prototipacao.svg',
  'Interface prototyping': 'prototipacao.svg',
  Responsividade: 'responsividade.svg',
  'Responsive design': 'responsividade.svg',
  Glassmorphism: 'glassmorphism.svg',
  Skeuomorfismo: 'skeuomorfismo.svg',
  Skeuomorphism: 'skeuomorfismo.svg',
  'Frutiger Aero': 'frutiger-aero.svg',
  'Heurísticas de usabilidade': 'heuristicas.svg',
  'Usability heuristics': 'heuristicas.svg',
};

export function techIcon(name: string): string | undefined {
  const file = byName[name];
  return file ? files[`../assets/tech/${file}`] : undefined;
}
