import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export function NotFound() {
  return (
    <section className={styles.notFound}>
      <h1>Nie znaleziono</h1>
      <p>Takiego ekranu nie ma.</p>
      <Link to="/">Wróć na start</Link>
    </section>
  );
}
