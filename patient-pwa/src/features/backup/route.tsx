import type { FeatureRoute } from '../../app/featureRoute';
import { BackupScreen } from './BackupScreen';

export const BACKUP_PATH = '/kopia-zapasowa';

const route: FeatureRoute = { path: BACKUP_PATH, element: <BackupScreen /> };
export default route;
