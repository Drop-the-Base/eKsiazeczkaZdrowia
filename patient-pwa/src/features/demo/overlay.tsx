import { isDemo } from '../../demoMode';
import { DemoTour } from './DemoTour';

/** The guide exists only under `/demo`; the real app renders nothing here. */
export default function DemoOverlay() {
  return isDemo ? <DemoTour /> : null;
}
