/**
 * Garante que nenhum texto de interface fique numa língua só.
 *
 *   npm run i18n:check      (também roda dentro de `npm run check`)
 *
 * Analisa src/ com o compilador do TypeScript e acusa, fora dos arquivos de
 * tradução (src/i18n/ e src/data/portfolio.ts):
 *   - texto solto no JSX (<p>Olá</p>);
 *   - atributos lidos pelo visitante com texto fixo (aria-label, title, alt,
 *     placeholder…);
 *   - qualquer string com acentos do português (sinal de texto não traduzido).
 * Para um caso legítimo (ex.: nome de idioma na própria língua), ponha um
 * comentário `i18n-exempt` na linha anterior à declaração.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const SRC = join(ROOT, 'src');
const SKIP = [/[\\/]i18n[\\/]/, /[\\/]data[\\/]portfolio\.ts$/, /[\\/]data[\\/]spotify-demo\.ts$/, /\.d\.ts$/];
const USER_ATTRS = new Set([
  'aria-label',
  'aria-description',
  'aria-roledescription',
  'aria-valuetext',
  'title',
  'alt',
  'placeholder',
  'label',
]);
const LETTER = /\p{L}/u;
const PORTUGUESE = /[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/;

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.(ts|tsx)$/.test(name) && !SKIP.some((re) => re.test(path)) ? [path] : [];
  });
}

function exempt(node, source) {
  for (let current = node; current; current = current.parent) {
    const ranges = ts.getLeadingCommentRanges(source.text, current.getFullStart()) ?? [];
    if (ranges.some((r) => source.text.slice(r.pos, r.end).includes('i18n-exempt'))) return true;
    if (ts.isStatement(current)) break;
  }
  return false;
}

/** Argumentos de `new Error(...)` são para desenvolvedores, não para o visitante. */
function insideError(node) {
  for (let current = node.parent; current; current = current.parent) {
    if (ts.isNewExpression(current) && current.expression.getText() === 'Error') return true;
    if (ts.isStatement(current)) return false;
  }
  return false;
}

const problems = [];

for (const file of files(SRC)) {
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const report = (node, text, why) => {
    if (exempt(node, source)) return;
    const { line } = source.getLineAndCharacterOfPosition(node.getStart());
    problems.push(`${relative(ROOT, file)}:${line + 1}  ${why}: ${JSON.stringify(text.trim().slice(0, 70))}`);
  };

  const visit = (node) => {
    if (ts.isJsxText(node) && LETTER.test(node.text)) {
      report(node, node.text, 'texto fixo no JSX');
    } else if (ts.isJsxAttribute(node) && USER_ATTRS.has(node.name.getText())) {
      const init = node.initializer;
      if (init && ts.isStringLiteral(init) && LETTER.test(init.text))
        report(node, init.text, `atributo ${node.name.getText()} fixo`);
    } else if (
      (ts.isStringLiteral(node) ||
        ts.isNoSubstitutionTemplateLiteral(node) ||
        ts.isTemplateHead(node) ||
        ts.isTemplateMiddle(node) ||
        ts.isTemplateTail(node)) &&
      PORTUGUESE.test(node.text) &&
      !ts.isImportDeclaration(node.parent) &&
      !insideError(node)
    ) {
      report(node, node.text, 'texto em português fora do i18n');
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}

if (problems.length > 0) {
  console.error(`Textos sem tradução (${problems.length}). Mova-os para src/i18n/ui.ts (pt e en):\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}
console.log('i18n: nenhum texto de interface fora das traduções.');
