import { useRouter } from 'vue-router';

import { useSidebar } from './useSidebar';
import useVeBal from './useVeBAL';

export default function useNavigationGuards() {
  const router = useRouter();
  const { setShowRedirectModal, isVeBalSupported } = useVeBal();
  const { setSidebarState } = useSidebar();

  router.beforeEach((to, from, next) => {
    if (to.name == 'vebal') {
      if (isVeBalSupported.value) next();
      else {
        setSidebarState(false);
        setShowRedirectModal(true);
        return false;
      }
    } else {
      next();
    }
    next();
  });
}
