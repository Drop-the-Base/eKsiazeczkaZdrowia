import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export function NotFound() {
  return (
    <section className={styles.notFound}>
      <h1>Nie znaleziono strony</h1>
      <p>Żądana strona nie istnieje.</p>
      <Link to="/">Przejdź do strony głównej</Link>
    </section>
  );
}
