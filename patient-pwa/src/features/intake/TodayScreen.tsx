import { PageHeader } from '../../ui';
import { TodayIntakes } from './components/TodayIntakes';
import styles from './TodayScreen.module.css';

export function TodayScreen() {
  return (
    <>
      <PageHeader title="Leki na dziś" />
      <div className={styles.content}>
        <TodayIntakes />
      </div>
    </>
  );
}
