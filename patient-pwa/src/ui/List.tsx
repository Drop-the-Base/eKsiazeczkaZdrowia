import type { ReactNode } from 'react';
import styles from './List.module.css';

export function List({ children }: { children: ReactNode }) {
  return <ul className={styles.list}>{children}</ul>;
}

type ItemProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
  dataTour?: string;
};

export function ListItem({ title, subtitle, leading, trailing, onClick, dataTour }: ItemProps) {
  const body = (
    <>
      {leading && <span className={styles.leading}>{leading}</span>}
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </span>
      {trailing && <span className={styles.trailing}>{trailing}</span>}
    </>
  );
  return (
    <li className={styles.item} data-tour={dataTour}>
      {onClick ? (
        <button type="button" className={styles.row} onClick={onClick}>
          {body}
        </button>
      ) : (
        <div className={styles.row}>{body}</div>
      )}
    </li>
  );
}
