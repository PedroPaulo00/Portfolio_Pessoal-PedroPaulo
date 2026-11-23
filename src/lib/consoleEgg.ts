/**
 * Easter egg do console do navegador: quem abre as ferramentas de desenvolvedor
 * (F12) encontra uma arte ASCII, o contato e um desafio: digitar `pedro.contratar()`.
 * (O navegador não avisa quando o console é aberto; a conquista vem do comando.)
 */
import { portfolio } from '../data/portfolio';
import { unlockAchievement } from './achievements';

const ART = [
  '  ____           _           ',
  ' |  _ \\ ___  __| |_ __ ___  ',
  " | |_) / _ \\/ _` | '__/ _ \\ ",
  ' |  __/  __/ (_| | | | (_) |',
  ' |_|   \\___|\\__,_|_|  \\___/ ',
].join('\n');

export function installConsoleEgg(): void {
  const email = portfolio.contact.email;
  console.log(`%c${ART}`, 'color:#2b93dc;font:bold 13px monospace');
  console.log(
    `%cCurioso, hein? Que tal a gente conversar?\n%c${email}\n%cDigite  pedro.contratar()  aqui no console. :)`,
    'color:#246b42;font:bold 15px sans-serif',
    'color:#0d5aa6;font:14px monospace',
    'color:#888;font:12px sans-serif',
  );
  Object.defineProperty(window, 'pedro', {
    configurable: true,
    value: {
      contratar() {
        unlockAchievement('console');
        console.log(`%cBoa escolha! Me chama: ${email}`, 'color:#246b42;font:bold 14px sans-serif');
        return 'Contratado!';
      },
    },
  });
}
