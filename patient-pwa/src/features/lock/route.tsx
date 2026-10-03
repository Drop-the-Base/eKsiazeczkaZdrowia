import type { FeatureRoute } from '../../app/featureRoute';
import { SecurityScreen } from './SecurityScreen';

export const SECURITY_PATH = '/zabezpieczenia';

const route: FeatureRoute = { path: SECURITY_PATH, element: <SecurityScreen /> };
export default route;
