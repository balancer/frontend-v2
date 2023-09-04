/**
 * useBackgroundColor
 *
 * @description Adds ability to change page background color via route meta.
 * This composable should only be imported once at the app component level
 * because it watches dark mode and toggles the background color. We don't
 * want that happening in multiple places.
 *
 * @dev to use, set route meta.bgColors attribute in router.ts for page.
 */
import { ref, watch } from 'vue';
import { RouteLocationNormalizedLoaded, useRoute } from 'vue-router';

/**
 * CONSTANTS
 */
const defaultBgColor = 'bg-white';
const defaultDarkBgColor = 'bg-gray-900';

/**
 * STATE
 */
const bgColor = ref(defaultBgColor);

/**
 * COMPOSABLES
 */

/**
 * METHODS
 */
function setBackgroundColor(color: string): void {
  document.documentElement.classList.remove(bgColor.value);
  bgColor.value = color;
  document.documentElement.classList.add(bgColor.value);
}

function setDefaultBgColor(): void {
  setBackgroundColor(defaultBgColor);
}

export function newRouteHandler(newRoute: RouteLocationNormalizedLoaded): void {
  if (newRoute.meta.bgColors?.dark) {
    setBackgroundColor(newRoute.meta.bgColors.dark);
  } else if (newRoute.meta.bgColors?.light) {
    setBackgroundColor(newRoute.meta.bgColors.light);
  } else {
    setDefaultBgColor();
  }
}

/**
 * INIT
 */
setDefaultBgColor();

export default function useBackgroundColor() {
  const route = useRoute();

  return {
    newRouteHandler,
  };
}
