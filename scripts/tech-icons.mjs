/**
 * Baixa os ícones das tecnologias para src/assets/tech/ (uma vez; o site não
 * depende de nenhuma API em tempo de execução).
 *
 *   npm run tech-icons
 *
 * Fontes:
 *   - Devicon (MIT) — logos coloridos: https://devicon.dev
 *   - Simple Icons (CC0) — monocromáticos, pintados com a cor oficial: https://simpleicons.org
 * As marcas pertencem aos seus donos; os ícones só identificam as tecnologias.
 *
 * Para acrescentar: inclua uma linha em ICONS, rode o comando e ligue o nome do
 * item ao arquivo em src/data/techIcons.ts.
 */
import { mkdir, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/assets/tech/', import.meta.url);
const DEVICON = 'https://cdn.jsdelivr.net/npm/devicon@2.18.0/icons';
const SIMPLE = 'https://cdn.jsdelivr.net/npm/simple-icons@16.37.0/icons';

/** [arquivo, fonte, nome no catálogo, variante (Devicon) ou cor (Simple Icons)] */
const ICONS = [
  ['javascript', 'devicon', 'javascript', 'original'],
  ['typescript', 'devicon', 'typescript', 'original'],
  ['dart', 'devicon', 'dart', 'original'],
  ['java', 'devicon', 'java', 'original'],
  ['python', 'devicon', 'python', 'original'],
  ['c', 'devicon', 'c', 'original'],
  ['cplusplus', 'devicon', 'cplusplus', 'original'],
  ['html5', 'devicon', 'html5', 'original'],
  ['css3', 'devicon', 'css3', 'original'],
  ['flutter', 'devicon', 'flutter', 'original'],
  ['react', 'devicon', 'react', 'original'],
  ['spring', 'devicon', 'spring', 'original'],
  ['electron', 'devicon', 'electron', 'original'],
  ['nodejs', 'devicon', 'nodejs', 'original'],
  ['capacitor', 'devicon', 'capacitor', 'original'],
  ['git', 'devicon', 'git', 'original'],
  ['github', 'devicon', 'github', 'original'],
  ['docker', 'devicon', 'docker', 'original'],
  ['figma', 'devicon', 'figma', 'original'],
  ['vscode', 'devicon', 'vscode', 'original'],
  ['firebase', 'devicon', 'firebase', 'original'],
  ['postgresql', 'devicon', 'postgresql', 'original'],
  ['claudecode', 'simple-icons', 'claudecode', '#D97757'],
  ['gemini', 'simple-icons', 'googlegemini', '#8E75B2'],
];

async function get(url) {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (error) {
      if (attempt >= 5) throw new Error(`${url}: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
    }
  }
}

await mkdir(OUT, { recursive: true });
for (const [file, source, name, extra] of ICONS) {
  let svg =
    source === 'devicon'
      ? await get(`${DEVICON}/${name}/${name}-${extra}.svg`)
      : (await get(`${SIMPLE}/${name}.svg`)).replace('<svg ', `<svg fill="${extra}" `);
  // Decorativos (o nome aparece ao lado): sem <title>, para não duplicar a leitura.
  svg = svg.replace(/<title>[\s\S]*?<\/title>/g, '').trim() + '\n';
  await writeFile(new URL(`${file}.svg`, OUT), svg);
  console.log(`${file}.svg`.padEnd(18), source);
}
