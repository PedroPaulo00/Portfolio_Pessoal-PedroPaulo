import githubLogo from '../../assets/contato/github.png';
import gmailLogo from '../../assets/contato/gmail.png';
import hotmailLogo from '../../assets/contato/hotmail.png';
import instagramLogo from '../../assets/contato/instagram.png';
import { useI18n } from '../../i18n/I18n';
import type { Contact, Section } from '../../types/portfolio';
import { Icon, type IconName } from '../ui/Icon';
import { SectionHeader } from './SectionHeader';

interface ContactSectionProps {
  readonly section: Section;
  readonly contact: Contact;
}

interface Channel {
  readonly label: string;
  readonly value: string;
  readonly href?: string;
  readonly icon: IconName;
  readonly external: boolean;
}

/**
 * Logo de cada serviço, escolhido pelo endereço do canal: um link ou e-mail novo
 * desses serviços recebe o logo sozinho; os demais usam o ícone Aero padrão.
 */
const LOGOS: readonly { readonly match: RegExp; readonly src: string; readonly invertInDark?: boolean }[] = [
  { match: /github\.com/i, src: githubLogo, invertInDark: true },
  { match: /@gmail\.com$/i, src: gmailLogo },
  { match: /@(outlook|hotmail|live)\.com$/i, src: hotmailLogo },
  { match: /instagram\.com/i, src: instagramLogo },
];

function ChannelIcon({ channel }: { readonly channel: Channel }) {
  const logo = channel.href ? LOGOS.find((item) => item.match.test(channel.href ?? '')) : undefined;
  if (!logo) return <Icon name={channel.icon} size={36} />;
  return (
    <img
      className={`aero-icon contact-logo${logo.invertInDark ? ' contact-logo--invert-dark' : ''}`}
      src={logo.src}
      alt=""
      width={36}
      height={36}
    />
  );
}

/** Links sem URL não aparecem. Sem e-mail, o canal fica como "não configurado". */
export function ContactSection({ section, contact }: ContactSectionProps) {
  const { t } = useI18n();
  const channels: Channel[] = [
    contact.email
      ? { label: t.email, value: contact.email, href: `mailto:${contact.email}`, icon: 'contato', external: false }
      : { label: t.email, value: t.notConfigured, icon: 'contato', external: false },
    ...(contact.secondaryEmail
      ? [
          {
            label: t.secondaryEmail,
            value: contact.secondaryEmail,
            href: `mailto:${contact.secondaryEmail}`,
            icon: 'contato',
            external: false,
          } satisfies Channel,
        ]
      : []),
    ...contact.links.flatMap((link): Channel[] =>
      link.url
        ? [
            {
              label: link.label,
              value: displayUrl(link.url),
              href: link.url,
              icon: iconFor(link.label),
              external: true,
            },
          ]
        : [],
    ),
  ];

  return (
    <div className="contact">
      <SectionHeader title={section.title ?? section.label} description={section.description} />
      <p className="contact__intro">{contact.intro}</p>
      <ul className="contact-list">
        {channels.map((channel) => (
          <li key={channel.label}>
            {channel.href ? (
              <a
                className="contact-item"
                href={channel.href}
                {...(channel.external ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                <ChannelIcon channel={channel} />
                <span className="contact-item__text">
                  <span className="contact-item__label">{channel.label}</span>
                  <span className="contact-item__value">
                    {channel.value}
                    {channel.external ? <span className="sr-only">{t.opensNewTab}</span> : null}
                  </span>
                </span>
              </a>
            ) : (
              <div className="contact-item contact-item--disabled" aria-disabled="true">
                <ChannelIcon channel={channel} />
                <span className="contact-item__text">
                  <span className="contact-item__label">{channel.label}</span>
                  <span className="contact-item__value">{channel.value}</span>
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function iconFor(label: string): IconName {
  return /curr[ií]culo|cv|pdf/i.test(label) ? 'documento' : 'link';
}

function displayUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}
