#!/usr/bin/env node
/**
 * Lista os placeholders que ainda restam no conteúdo do portfólio.
 *
 *   npm run placeholders
 *
 * Lê src/data/portfolio.ts e index.html e aponta, linha a linha, textos
 * provisórios conhecidos. Sai com código 1 se algum for encontrado, para poder
 * ser usado como verificação antes de publicar.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);

const PATTERNS = [
  [/Seu Nome/, 'nome provisório'],
  [/provis[óo]ri[oa]/i, 'texto marcado como provisório'],
  [/Modelo (de card|do campo)/, 'texto-modelo de projeto'],
  [/Projeto (profissional|acad[êe]mico|pessoal) \d+/, 'nome de projeto-modelo'],
  [/Tecnologia [A-Z]\b/, 'tecnologia genérica'],
  [/\b(Linguagem|Framework|Ferramenta|Interesse|Item) \d\b/, 'item genérico'],
  [/Par[áa]grafo provis[óo]rio/, 'parágrafo provisório'],
];

const FILES = ['src/data/portfolio.ts', 'index.html'];
let found = 0;

for (const file of FILES) {
  const lines = readFileSync(fileURLToPath(new URL(file, root)), 'utf8').split('\n');
  lines.forEach((line, index) => {
    const hit = PATTERNS.find(([pattern]) => pattern.test(line));
    if (!hit) return;
    found += 1;
    console.log(`${file}:${index + 1}  [${hit[1]}]  ${line.trim().slice(0, 90)}`);
  });
}

const missing = [];
const data = readFileSync(fileURLToPath(new URL('src/data/portfolio.ts', root)), 'utf8');
if (!/\bemail:\s*'/.test(data)) missing.push('contact.email');
if (!/\blogo:\s*\{/.test(data)) missing.push('profile.logo (usando marca provisória com iniciais)');
if (!/\burl:\s*'/.test(data)) missing.push('contact.links[].url');
if (!/\bthumbnail:\s*\{/.test(data)) missing.push('projects[].thumbnail (miniaturas provisórias)');
if (/ambient-template/.test(data)) missing.push('sound.src (som de fundo ainda é o template)');
if (data.includes('logos/template.png')) missing.push('projects[].logo (Flor Digital ainda usa o logo template)');
if (/kind: 'template' \}/.test(data)) missing.push('desktopIcons (atalhos template na área de trabalho)');

if (missing.length) {
  console.log('\nAinda não configurado:');
  for (const item of missing) console.log(`  - ${item}`);
}

if (found || missing.length) {
  console.log(`\n${found} linha(s) com placeholder; ${missing.length} campo(s) não configurado(s).`);
  process.exit(1);
}
console.log('Nenhum placeholder encontrado.');
