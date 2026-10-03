import type { FeatureRoute } from '../../app/featureRoute';
import { PostVisitScreen } from './PostVisitScreen';

export const POST_VISIT_PATH = '/wizyta/po-wizycie';

const route: FeatureRoute = { path: POST_VISIT_PATH, element: <PostVisitScreen /> };
export default route;
