import { Goals } from '@/services/fathom/goals';

interface Fathom {
  trackPageview: (opts?: PageViewOptions) => void;
  trackGoal: (code: string, cents: number) => void;
}

export type PageViewOptions = {
  url?: string;
  referrer?: string;
};

type FathomCommand =
  | { type: 'trackPageview'; opts: PageViewOptions | undefined }
  | { type: 'trackGoal'; code: string; cents: number };

declare global {
  interface Window {
    fathom?: Fathom;
    __fathomClientQueue: FathomCommand[];
  }
}

const goals = new Goals();

export default function useFathom() {
  function trackGoal(goal: string, value = 0) {
    if (!window.fathom) return;
    try {
      window.fathom.trackGoal(goal, value);
    } catch (error) {
      console.error(error);
    }
  }

  return { trackGoal, Goals: goals };
}
