import whatsappLogo from '../../assets/contato/whatsapp.svg';
import { useI18n } from '../../i18n/I18n';
import { RouteLink } from '../../lib/navigation';
import type { Contact, Section, Service, Services } from '../../types/portfolio';
import { Icon } from '../ui/Icon';
import { Orb } from '../ui/Orb';
import { SectionHeader } from './SectionHeader';

interface ServicesSectionProps {
  readonly section: Section;
  readonly services: Services;
  readonly contact: Contact;
}

/**
 * Serviços: o que ofereço a clientes (conteúdo em portfolio.ts → services).
 * O serviço principal em destaque (com a prévia de um site no navegador e no
 * celular), os demais em cartões de vidro com a cor de cada serviço, as etapas
 * do atendimento com orbes numerados e uma chamada para conversar.
 */
export function ServicesSection({ section, services, contact }: ServicesSectionProps) {
  const { t } = useI18n();
  const whatsapp = contact.links.find((link) => /whatsapp/i.test(link.label) && link.url)?.url;
  const tails = lastRowClasses(services.items.filter((item) => !item.featured).map((item) => item.id));

  return (
    <div className="services">
      <SectionHeader title={section.title ?? section.label} description={section.description} />

      <ul className="services__grid">
        {services.items.map((service) => {
          const tail = tails.get(service.id);
          return (
            <li
              key={service.id}
              data-service={service.id}
              className={`service-card${service.featured ? ' service-card--featured' : ''}${tail ? ` ${tail}` : ''}`}
            >
              <article aria-labelledby={`servico-${service.id}`}>
                {service.featured ? (
                  <>
                    <div className="service-card__body">
                      <span className="service-card__ribbon">{t.featuredService}</span>
                      <ServiceHead service={service} size={46} />
                      <Includes items={service.includes} />
                      {service.idealFor ? (
                        <div className="service-card__ideal">
                          <strong>{t.idealFor}</strong>
                          <ul className="service-card__chips">
                            {splitList(service.idealFor).map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                    <SitePreview />
                  </>
                ) : (
                  <>
                    <ServiceHead service={service} size={34} />
                    <Includes items={service.includes} />
                    {service.idealFor ? (
                      <p className="service-card__ideal service-card__ideal--plain">
                        <strong>{t.idealFor}</strong>
                        {service.idealFor}
                      </p>
                    ) : null}
                  </>
                )}
              </article>
            </li>
          );
        })}
      </ul>

      {services.steps.length > 0 ? (
        <section className="services__steps" aria-labelledby="services-steps-title">
          <h2 id="services-steps-title" className="group-title">
            {t.howItWorks}
          </h2>
          <ol className="service-steps">
            {services.steps.map((step, index) => (
              <li key={step.title} className="service-step">
                <span className="service-step__orb">
                  <Orb variant={1} size={44}>
                    {index + 1}
                  </Orb>
                </span>
                <h3 className="service-step__title">{step.title}</h3>
                <p className="service-step__text">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="services__cta" aria-labelledby="services-cta-title">
        <div className="services__cta-text">
          <h2 id="services-cta-title" className="services__cta-title">
            {services.cta.title}
          </h2>
          <p>{services.cta.text}</p>
        </div>
        <div className="services__cta-actions">
          {whatsapp ? (
            <a
              className="aero-button aero-button--primary services__whatsapp"
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
            >
              <img src={whatsappLogo} alt="" width={20} height={20} />
              {t.talkOnWhatsApp}
              <span className="sr-only">{t.opensNewTab}</span>
            </a>
          ) : null}
          <RouteLink to={{ section: 'contato' }} className="aero-button">
            {t.otherContacts}
          </RouteLink>
        </div>
      </section>
    </div>
  );
}

/** Ícone em ladrilho de vidro, título e resumo de um serviço. */
function ServiceHead({ service, size }: { readonly service: Service; readonly size: number }) {
  return (
    <div className="service-card__head">
      <span className="service-card__tile" aria-hidden="true">
        <Icon name={service.icon} size={size} />
      </span>
      <div className="service-card__intro">
        <h2 id={`servico-${service.id}`} className="service-card__title">
          {service.title}
        </h2>
        <p className="service-card__summary">{service.summary}</p>
      </div>
    </div>
  );
}

function Includes({ items }: { readonly items: readonly string[] }) {
  return (
    <ul className="service-card__includes">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/** "a, b, c e d" → ["a", "b", "c", "d"] (vírgulas e o último "e"/"and"). */
function splitList(text: string): string[] {
  return text
    .split(/,\s*|\s+(?:e|and)\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Cartões da última linha, para a grade não deixar buraco: com 3 colunas, sobra
 * 1 (ocupa a linha) ou 2 (meia linha cada); com 2 colunas, o último ímpar ocupa a linha.
 */
function lastRowClasses(ids: readonly string[]): Map<string, string> {
  const classes = new Map<string, string[]>();
  const add = (id: string | undefined, name: string) => {
    if (id) classes.set(id, [...(classes.get(id) ?? []), name]);
  };
  const rest3 = ids.length % 3;
  ids.slice(ids.length - rest3).forEach((id) => add(id, rest3 === 1 ? 'is-tail3-full' : 'is-tail3-half'));
  if (ids.length % 2 === 1) add(ids[ids.length - 1], 'is-tail2-full');
  return new Map([...classes].map(([id, names]) => [id, names.join(' ')]));
}

/**
 * Prévia decorativa do serviço em destaque: uma landing page numa janela de
 * navegador Aero e a mesma página num celular, só com formas (sem texto).
 */
function SitePreview() {
  return (
    <div className="site-preview" aria-hidden="true">
      <div className="site-preview__browser">
        <div className="site-preview__bar">
          <i />
          <i />
          <i />
          <span className="site-preview__url" />
        </div>
        <div className="site-preview__page">
          <div className="site-preview__hero">
            <span className="site-preview__line site-preview__line--title" />
            <span className="site-preview__line" />
            <span className="site-preview__line site-preview__line--short" />
            <span className="site-preview__cta" />
          </div>
          <div className="site-preview__cards">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
      <div className="site-preview__phone">
        <div className="site-preview__phone-screen">
          <div className="site-preview__hero site-preview__hero--phone">
            <span className="site-preview__line site-preview__line--title" />
            <span className="site-preview__line" />
            <span className="site-preview__cta" />
          </div>
          <span className="site-preview__block" />
          <span className="site-preview__block" />
          <span className="site-preview__whatsapp" />
        </div>
      </div>
    </div>
  );
}
