/**
 * Converte o conteúdo bilíngue (portfolio.ts) para o idioma atual. Cada campo
 * de texto é reescrito explicitamente: se um campo bilíngue novo não for tratado
 * aqui, o objeto `{ pt, en }` vaza para um campo `string` e o TypeScript acusa.
 */
import type { Localized, Locale, PortfolioData, Project, ProjectImage, Section } from '../types/portfolio';

export function localize(data: PortfolioData<'source'>, locale: Locale): PortfolioData {
  const text = (value: Localized) => value[locale];
  const name = (value: string | Localized) => (typeof value === 'string' ? value : value[locale]);
  const image = (value: ProjectImage<'source'>): ProjectImage => ({ ...value, alt: text(value.alt) });

  const section = ({ title, ...rest }: Section<'source'>): Section => ({
    ...rest,
    label: text(rest.label),
    description: text(rest.description),
    ...(title ? { title: text(title) } : {}),
  });

  const project = ({ thumbnail, details, gallery, ...rest }: Project<'source'>): Project => ({
    ...rest,
    name: name(rest.name),
    summary: text(rest.summary),
    stack: rest.stack.map(name),
    ...(thumbnail ? { thumbnail: image(thumbnail) } : {}),
    ...(details ? { details: text(details) } : {}),
    ...(gallery ? { gallery: gallery.map(image) } : {}),
  });

  const { logo, photo, ...profile } = data.profile;
  const { education, highlights, languages, ...about } = data.about;

  return {
    ...data,
    profile: {
      ...profile,
      role: text(profile.role),
      tagline: text(profile.tagline),
      ...(logo ? { logo: image(logo) } : {}),
      ...(photo ? { photo: image(photo) } : {}),
    },
    sections: data.sections.map(section),
    projects: data.projects.map(project),
    about: {
      ...about,
      paragraphs: about.paragraphs.map(text),
      interests: about.interests.map(text),
      ...(education
        ? {
            education: {
              course: text(education.course),
              ...(education.stage ? { stage: text(education.stage) } : {}),
            },
          }
        : {}),
      ...(highlights ? { highlights: highlights.map(text) } : {}),
      ...(languages ? { languages: languages.map(text) } : {}),
    },
    skills: data.skills.map((group) => ({ title: text(group.title), items: group.items.map(name) })),
    contact: {
      ...data.contact,
      intro: text(data.contact.intro),
      links: data.contact.links.map((link) => ({ ...link, label: name(link.label) })),
    },
    desktopIcons: data.desktopIcons.map((icon) => ({ ...icon, label: name(icon.label) })),
  };
}
