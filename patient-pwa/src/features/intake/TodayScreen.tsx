import { PageHeader } from '../../ui';
import { DemoNotificationButton } from '../reminders';
import { TodayIntakes } from './components/TodayIntakes';
import styles from './TodayScreen.module.css';

export function TodayScreen() {
  return (
    <>
      <PageHeader title="Leki na dziś" back="/profil" />
      <div className={styles.content}>
        <TodayIntakes />
        <DemoNotificationButton />
      </div>
    </>
  );
}
