import { useId, type FormEvent } from 'react';
import { useI18n } from '../../i18n/I18n';

interface SearchBoxProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  /** Enter e clique na lupa executam a mesma pesquisa. */
  readonly onSubmit: () => void;
}

/** Campo Aero com a lupa no canto direito, dentro do campo (kit 7H). */
export function SearchBox({ value, onChange, onSubmit }: SearchBoxProps) {
  const { t } = useI18n();
  const id = useId();
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form className="search-box" role="search" onSubmit={submit}>
      <label className="sr-only" htmlFor={id}>
        {t.searchProjects}
      </label>
      <input
        id={id}
        className="aero-input search-box__input"
        type="search"
        placeholder={t.searchProjects}
        autoComplete="off"
        enterKeyHint="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <button type="submit" className="search-box__submit" aria-label={t.search} title={t.search}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="10" cy="10" r="6" />
          <path d="m15 15 5 5" />
        </svg>
      </button>
    </form>
  );
}
