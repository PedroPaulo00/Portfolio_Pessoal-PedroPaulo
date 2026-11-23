import whatsappLogo from '../../assets/contato/whatsapp.svg';
import { useI18n } from '../../i18n/I18n';
import { RouteLink } from '../../lib/navigation';
import type { Contact, Section, Services } from '../../types/portfolio';
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
 * Cartões no estilo dos painéis do Windows 7, o serviço principal em destaque,
 * as etapas do atendimento com orbes numerados e uma chamada para conversar.
 */
export function ServicesSection({ section, services, contact }: ServicesSectionProps) {
  const { t } = useI18n();
  const whatsapp = contact.links.find((link) => /whatsapp/i.test(link.label) && link.url)?.url;

  return (
    <div className="services">
      <SectionHeader title={section.title ?? section.label} description={section.description} />

      <ul className="services__grid">
        {services.items.map((service) => (
          <li key={service.id} className={`service-card${service.featured ? ' service-card--featured' : ''}`}>
            <article aria-labelledby={`servico-${service.id}`}>
              {service.featured ? <span className="service-card__ribbon">{t.featuredService}</span> : null}
              <div className="service-card__head">
                <span className="service-card__tile" aria-hidden="true">
                  <Icon name={service.icon} size={service.featured ? 44 : 34} />
                </span>
                <div className="service-card__intro">
                  <h2 id={`servico-${service.id}`} className="service-card__title">
                    {service.title}
                  </h2>
                  <p className="service-card__summary">{service.summary}</p>
                </div>
              </div>
              <ul className="service-card__includes">
                {service.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {service.idealFor ? (
                <p className="service-card__ideal">
                  <strong>{t.idealFor}</strong>
                  {service.idealFor}
                </p>
              ) : null}
            </article>
          </li>
        ))}
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
