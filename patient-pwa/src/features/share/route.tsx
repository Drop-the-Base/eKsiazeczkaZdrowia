import type { FeatureRoute } from '../../app/featureRoute';
import { ShareScreen } from './ShareScreen';

export const SHARE_PATH = '/wizyta/udostepnij';

const route: FeatureRoute = { path: SHARE_PATH, element: <ShareScreen /> };
export default route;
