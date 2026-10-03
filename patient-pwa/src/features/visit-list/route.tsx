import type { FeatureRoute } from '../../app/featureRoute';
import { VisitListScreen } from './VisitListScreen';

export const VISIT_PATH = '/wizyta';

const route: FeatureRoute = { path: VISIT_PATH, element: <VisitListScreen /> };
export default route;
