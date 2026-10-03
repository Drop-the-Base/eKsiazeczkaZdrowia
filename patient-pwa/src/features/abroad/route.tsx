import type { FeatureRoute } from '../../app/featureRoute';
import { AbroadScreen } from './AbroadScreen';

export const ABROAD_PATH = '/wizyta/za-granica';

const route: FeatureRoute = { path: ABROAD_PATH, element: <AbroadScreen /> };
export default route;
