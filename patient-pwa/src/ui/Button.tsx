import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  block?: boolean;
};

export function Button({ variant = 'primary', block, className, type = 'button', ...rest }: Props) {
  const classes = [styles.button, styles[variant], block && styles.block, className]
    .filter(Boolean)
    .join(' ');
  return <button type={type} className={classes} {...rest} />;
}
