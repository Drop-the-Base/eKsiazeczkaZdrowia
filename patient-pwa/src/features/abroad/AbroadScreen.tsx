import { Link } from 'react-router-dom';
import { ABROAD_LABELS, type DictText } from '@ez/shared';
import { Button, Chip, EmptyState, LoadingState, PageHeader } from '../../ui';
import { LANGUAGES, type AbroadSummary } from './abroad.logic';
import { useAbroad } from './useAbroad';
import styles from './AbroadScreen.module.css';

const pad = (n: number) => String(n).padStart(2, '0');
/** Dates abroad as DD.MM.YYYY – unambiguous for EN/DE/ES readers alike. */
const date = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
};

function Text({ t, labels }: { t: DictText; labels: AbroadSummary['labels'] }) {
  return t.translated ? (
    <>{t.text}</>
  ) : (
    <>
      {t.text}{' '}
      <span className={styles.pl} title={labels.untranslated}>
        (PL)
      </span>
    </>
  );
}

function Summary({ s }: { s: AbroadSummary }) {
  const l = s.labels;
  const now = new Date();
  return (
    <article className={styles.sheet} lang={s.lang}>
      <h2 className={styles.title}>{l.title}</h2>
      <p className={styles.intro}>{l.intro}</p>
      <dl className={styles.facts}>
        <dt>{l.patient}</dt>
        <dd>{s.name}</dd>
        <dt>{l.born}</dt>
        <dd>{date(s.birthDate)}</dd>
        {s.bloodType && (
          <>
            <dt>{l.bloodType}</dt>
            <dd>{s.bloodType}</dd>
          </>
        )}
      </dl>

      <section>
        <h3>{l.allergies}</h3>
        <p className={styles.allergies}>
          {s.allergies.length > 0
            ? s.allergies.map((a, i) => (
                <span key={i} className={styles.allergy}>
                  <Text t={a} labels={l} />
                </span>
              ))
            : l.noAllergies}
        </p>
      </section>

      <section data-tour="abroad-meds">
        <h3>{l.medications}</h3>
        {s.medications.map((g) => (
          <div key={g.category} className={styles.group}>
            <h4>{g.label}</h4>
            {g.items.length === 0 ? (
              <p className={styles.muted}>{l.noMedications}</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{l.substance}</th>
                    <th>ATC</th>
                    <th>{l.dose}</th>
                    <th>{l.schedule}</th>
                    <th>{l.since}</th>
                  </tr>
                </thead>
                <tbody>
                  {g.items.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <strong>
                          <Text t={m.substance} labels={l} />
                        </strong>
                        {m.brand && <span className={styles.brand}> ({m.brand})</span>}
                      </td>
                      <td>{m.atc ?? '—'}</td>
                      <td>{m.dose}</td>
                      <td>{m.schedule}</td>
                      <td>{date(m.since)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </section>

      <section>
        <h3>{l.conditions}</h3>
        {s.conditions.length === 0 ? (
          <p className={styles.muted}>{l.noConditions}</p>
        ) : (
          <ul>
            {s.conditions.map((c) => (
              <li key={c.id}>
                <Text t={c.text} labels={l} />{' '}
                {c.icd10 && (
                  <span className={styles.code}>
                    {l.icd} {c.icd10}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
        {s.pastConditions.length > 0 && (
          <>
            <h4>{l.pastConditions}</h4>
            <ul>
              {s.pastConditions.map((c) => (
                <li key={c.id}>
                  <Text t={c.text} labels={l} />{' '}
                  {c.icd10 && (
                    <span className={styles.code}>
                      {l.icd} {c.icd10}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <footer className={styles.footer}>
        {s.hasUntranslated && <p>(PL) = {l.untranslated}</p>}
        <p>
          {l.generated}:{' '}
          {date(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`)} ·
          eKsiazeczkaZdrowia · {l.disclaimer}
        </p>
      </footer>
    </article>
  );
}

export function AbroadScreen() {
  const abroad = useAbroad();
  return (
    <>
      <PageHeader title="Za granicą" />
      <div className={styles.content} data-tour="abroad">
        <p className={styles.lead}>
          Podsumowanie do okazania lekarzowi lub zapisania w PDF. Dostępne offline.
        </p>
        <div className={styles.langs} role="group" aria-label="Język lekarza">
          {LANGUAGES.map((l) => (
            <Chip
              key={l}
              selected={abroad.lang === l}
              onClick={() => abroad.setLang(l)}
              data-tour={`lang-${l}`}
            >
              {ABROAD_LABELS[l].languageName}
            </Chip>
          ))}
        </div>
        {abroad.loading ? (
          <LoadingState />
        ) : !abroad.summary ? (
          <EmptyState title="Najpierw uzupełnij profil">
            Podsumowanie zawiera imię, datę urodzenia i alergie.{' '}
            <Link to="/profil">Przejdź do profilu</Link>
          </EmptyState>
        ) : (
          <>
            <Summary s={abroad.summary} />
            <Button block variant="secondary" onClick={() => window.print()}>
              Drukuj / zapisz PDF
            </Button>
          </>
        )}
      </div>
    </>
  );
}
