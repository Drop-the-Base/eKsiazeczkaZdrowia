import styles from './Placeholder.module.css';

export function Placeholder({ title, owner }: { title: string; owner: 'A' | 'B' }) {
  return (
    <section className={styles.placeholder}>
      <h1>{title}</h1>
      <p>Ekran w budowie · właściciel: agent {owner}</p>
    </section>
  );
}
