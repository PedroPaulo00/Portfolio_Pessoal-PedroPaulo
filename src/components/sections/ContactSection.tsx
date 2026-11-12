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
                <Icon name={channel.icon} size={36} />
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
                <Icon name={channel.icon} size={36} />
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
